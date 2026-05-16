require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const NodeMediaServer = require('node-media-server');

const prisma = new PrismaClient();
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve built frontend in production
const frontendPath = path.join(__dirname, '..', 'fantasy-league', 'dist');
app.use(express.static(frontendPath));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_for_fantasy_league';

// ========================
// OBS STUDIO - RTMP Media Server
// ========================
const RTMP_PORT = process.env.RTMP_PORT || 1935;
const HTTP_FLV_PORT = process.env.HTTP_FLV_PORT || 8888;

const nmsConfig = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: HTTP_FLV_PORT,
    allow_origin: '*',
    mediaroot: './media'
  }
};

const nms = new NodeMediaServer(nmsConfig);

// Track active OBS streams
const activeStreams = new Map();

nms.on('prePublish', (id, StreamPath, args) => {
  console.log(`[OBS] Stream started: ${StreamPath} (session: ${id})`);
  activeStreams.set(StreamPath, { id, startTime: Date.now(), path: StreamPath });
  io.emit('obs-stream-live', { path: StreamPath, live: true });
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(`[OBS] Stream ended: ${StreamPath}`);
  activeStreams.delete(StreamPath);
  io.emit('obs-stream-live', { path: StreamPath, live: false });
});

app.get('/api/stream/status', (req, res) => {
  const streams = [];
  activeStreams.forEach((value, key) => {
    streams.push({
      path: key, live: true,
      startTime: value.startTime,
      uptime: Math.floor((Date.now() - value.startTime) / 1000)
    });
  });
  res.json({
    live: streams.length > 0, streams,
    obsConfig: {
      rtmpUrl: `rtmp://localhost:${RTMP_PORT}/live`,
      streamKey: 'iiitn',
      flvPlaybackUrl: `http://localhost:${HTTP_FLV_PORT}/live/iiitn.flv`
    }
  });
});

// ========================
// AUTHENTICATION APIs
// ========================

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access Denied' });
  try {
    const verified = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashedPassword } });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, wallet: user.wallet } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, wallet: user.wallet } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========================
// MATCH APIs (Dream11-style)
// ========================

app.get('/api/matches', async (req, res) => {
  const { sport, status } = req.query;
  const where = {};
  if (sport && sport !== 'all') where.sport = sport;
  if (status) where.status = status;
  const matches = await prisma.match.findMany({
    where,
    include: { contests: true, _count: { select: { teams: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(matches);
});

app.get('/api/matches/:id', async (req, res) => {
  const match = await prisma.match.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { contests: { include: { _count: { select: { entries: true } } } } }
  });
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

app.get('/api/matches/:id/players', async (req, res) => {
  const match = await prisma.match.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const players = await prisma.player.findMany({
    where: {
      theme: match.sport,
      team: { in: [match.teamA, match.teamB] }
    },
    orderBy: { credits: 'desc' }
  });
  res.json(players);
});

// ========================
// CONTEST APIs
// ========================

app.get('/api/matches/:id/contests', async (req, res) => {
  const contests = await prisma.contest.findMany({
    where: { matchId: parseInt(req.params.id) },
    include: { _count: { select: { entries: true } } }
  });
  res.json(contests);
});

app.post('/api/contests/:id/join', verifyToken, async (req, res) => {
  const { teamId } = req.body;
  try {
    const contest = await prisma.contest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!contest) return res.status(404).json({ error: 'Contest not found' });
    if (contest.spotsLeft <= 0) return res.status(400).json({ error: 'Contest full' });

    // Check if user already joined this contest
    const existing = await prisma.contestEntry.findFirst({
      where: { contestId: contest.id, userId: req.user.id }
    });
    if (existing) return res.status(400).json({ error: 'Already joined this contest' });

    // Deduct entry fee
    if (contest.entryFee > 0) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (user.wallet < contest.entryFee) return res.status(400).json({ error: 'Insufficient balance' });
      await prisma.user.update({ where: { id: req.user.id }, data: { wallet: { decrement: contest.entryFee } } });
    }

    const entry = await prisma.contestEntry.create({
      data: { contestId: contest.id, userId: req.user.id, teamId: parseInt(teamId) }
    });
    await prisma.contest.update({ where: { id: contest.id }, data: { spotsLeft: { decrement: 1 } } });
    res.json({ success: true, entry });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contests/:id/leaderboard', async (req, res) => {
  const entries = await prisma.contestEntry.findMany({
    where: { contestId: parseInt(req.params.id) },
    include: { user: true, team: { include: { members: { include: { player: true } } } } },
    orderBy: { points: 'desc' }
  });
  res.json(entries.map((e, i) => ({
    rank: i + 1, username: e.user.username, points: e.points,
    teamName: e.team.teamName, teamId: e.team.id
  })));
});

// ========================
// FANTASY TEAM APIs (Updated for 11 players)
// ========================

app.get('/api/events', async (req, res) => {
  const events = await prisma.event.findMany();
  res.json(events);
});

app.get('/api/players', async (req, res) => {
  const { sport } = req.query;
  const where = (sport && sport !== 'all') ? { theme: sport } : {};
  const players = await prisma.player.findMany({ where, orderBy: { credits: 'desc' } });
  res.json(players);
});

app.post('/api/team', verifyToken, async (req, res) => {
  const { theme, budget, players, matchId, teamName, captainId, vcId } = req.body;
  try {
    if (players.length !== 11) return res.status(400).json({ error: 'Team must have exactly 11 players' });
    const team = await prisma.fantasyTeam.create({
      data: {
        userId: req.user.id,
        matchId: matchId ? parseInt(matchId) : null,
        theme,
        budget: parseFloat(budget),
        teamName: teamName || 'My Team',
        captainId: captainId || null,
        vcId: vcId || null,
        members: {
          create: players.map(p => ({
            playerId: p.id,
            teamRole: p.id === captainId ? 'C' : p.id === vcId ? 'VC' : null
          }))
        }
      }
    });
    res.json({ success: true, team });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/my-teams', verifyToken, async (req, res) => {
  const teams = await prisma.fantasyTeam.findMany({
    where: { userId: req.user.id },
    include: {
      match: true,
      members: { include: { player: true } },
      entries: { include: { contest: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(teams);
});

app.get('/api/leaderboard', async (req, res) => {
  const { sport } = req.query;
  const users = await prisma.user.findMany({ orderBy: { totalPoints: 'desc' } });
  const rankings = users.map((u, i) => ({
    rank: i + 1, name: u.username, points: u.totalPoints,
    theme: sport === 'all' ? 'football' : sport,
    trend: 'same', color: i === 0 ? 'gold' : i === 1 ? 'silver' : '#cd7f32'
  }));
  res.json({ topThree: rankings.slice(0, 3), rankings: rankings.slice(3) });
});

app.post('/api/admin/log', verifyToken, async (req, res) => {
  const { playerId, action, pointsAdded, notes } = req.body;
  try {
    const log = await prisma.performanceLog.create({
      data: { playerId: parseInt(playerId), action, pointsAdded: parseInt(pointsAdded), notes }
    });
    await prisma.player.update({
      where: { id: parseInt(playerId) },
      data: { points: { increment: parseInt(pointsAdded) } }
    });
    const teamMembers = await prisma.fantasyTeamMember.findMany({
      where: { playerId: parseInt(playerId) },
      include: { fantasyTeam: true }
    });
    for (const member of teamMembers) {
      let multiplier = 1;
      if (member.teamRole === 'C') multiplier = 2;
      if (member.teamRole === 'VC') multiplier = 1.5;
      const finalPoints = Math.floor(parseInt(pointsAdded) * multiplier);
      await prisma.user.update({
        where: { id: member.fantasyTeam.userId },
        data: { totalPoints: { increment: finalPoints } }
      });
    }
    res.json({ success: true, log });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ========================
// LIVE SPORTS DATA PROXIES
// ========================

app.get('/api/live/f1/standings', async (req, res) => {
  try {
    const r = await fetch('https://ergast.com/api/f1/current/driverStandings.json');
    const data = await r.json();
    const list = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
    res.json(list.slice(0, 10).map(s => ({
      position: s.position, driver: `${s.Driver.givenName} ${s.Driver.familyName}`,
      code: s.Driver.code, team: s.Constructors[0]?.name || 'N/A',
      points: s.points, wins: s.wins
    })));
  } catch (e) { res.json([]); }
});

app.get('/api/live/f1/lastrace', async (req, res) => {
  try {
    const r = await fetch('https://ergast.com/api/f1/current/last/results.json');
    const data = await r.json();
    const race = data.MRData.RaceTable.Races[0];
    if (!race) return res.json(null);
    res.json({
      raceName: race.raceName, circuit: race.Circuit.circuitName,
      date: race.date, round: race.round,
      results: race.Results.slice(0, 10).map(x => ({
        position: x.position, driver: `${x.Driver.givenName} ${x.Driver.familyName}`,
        code: x.Driver.code, team: x.Constructor.name,
        time: x.Time?.time || x.status, points: x.points, grid: x.grid,
        fastestLap: x.FastestLap?.Time?.time || null
      }))
    });
  } catch (e) { res.json(null); }
});

app.get('/api/live/cricket', async (req, res) => {
  const apiKey = process.env.CRICKET_API_KEY;
  if (!apiKey) return res.json({ source: 'demo', matches: getDemoCricket() });
  try {
    const r = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`);
    const data = await r.json();
    if (data.status === 'success' && data.data) {
      res.json({ source: 'live', matches: data.data.slice(0, 6).map(m => ({
        id: m.id, name: m.name, status: m.status, matchType: m.matchType,
        venue: m.venue, teams: m.teams || [], score: m.score || [],
        matchStarted: m.matchStarted, matchEnded: m.matchEnded
      }))});
    } else { res.json({ source: 'demo', matches: getDemoCricket() }); }
  } catch (e) { res.json({ source: 'demo', matches: getDemoCricket() }); }
});

function getDemoCricket() {
  return [
    { id: 1, name: 'IPL 2026 - CSK vs RCB', status: 'CSK needs 42 runs in 18 balls', matchType: 't20', venue: 'M. Chinnaswamy Stadium', teams: ['CSK', 'RCB'], score: [{ r: 198, w: 3, o: 18.4, inning: 'CSK Inning 1' }, { r: 240, w: 5, o: 20, inning: 'RCB Inning 1' }], matchStarted: true, matchEnded: false },
    { id: 2, name: 'IPL 2026 - MI vs DC', status: 'MI won by 6 wickets', matchType: 't20', venue: 'Wankhede Stadium', teams: ['MI', 'DC'], score: [{ r: 175, w: 4, o: 18.2, inning: 'MI Inning 1' }, { r: 172, w: 8, o: 20, inning: 'DC Inning 1' }], matchStarted: true, matchEnded: true },
    { id: 3, name: 'India vs Australia - 3rd Test', status: 'Day 2 - India trail by 126 runs', matchType: 'test', venue: 'SCG, Sydney', teams: ['India', 'Australia'], score: [{ r: 312, w: 10, o: 89.3, inning: 'AUS 1st' }, { r: 186, w: 4, o: 52, inning: 'IND 1st' }], matchStarted: true, matchEnded: false }
  ];
}

// ========================
// AI Chatbot (Gemini Integration) — TRAINED
// ========================
let model = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
} catch (e) {
  console.log("Failed to initialize Gemini AI. Check API key.");
}

// Champak's comprehensive training data
const CHAMPAK_SYSTEM_PROMPT = `You are **Champak**, the official AI assistant for the **IIITN Streaming Platform** — a premium Dream11-style fantasy sports, live streaming, and watch-party platform built by students of IIIT Nagpur. You have a Neo-Tokyo cyberpunk personality — energetic, witty, tech-savvy, and deeply helpful.

## YOUR IDENTITY
- Name: Champak
- Role: Platform AI Assistant & Sports Strategy Coach
- Personality: Enthusiastic, friendly, uses gaming/esports lingo, occasionally uses Japanese words like "sugoi!", "yosh!", "ikuzo!"
- You NEVER break character. You are Champak, not an AI model. If asked who made you, say "I was engineered by the IIITN dev team!"
- Keep answers concise (2-4 sentences max) unless the user asks for detailed help.

## PLATFORM FEATURES (Dream11-style)

### 1. Home (Dashboard)
- Shows upcoming matches with countdown timers across Cricket, Football, F1, Hackathon
- Each match card shows Team A vs Team B, venue, prize pool, number of contests
- Users click a match to see available contests and create their fantasy team

### 2. Match Detail Page
- Shows all available contests (Mega Contest, Head to Head, Practice, Winner Takes All)
- Each contest has entry fee (virtual currency), prize pool, spots remaining
- Users create teams and join contests from this page

### 3. Create Team (Dream11-style)
- Select exactly 11 players from both teams within 100 credits budget
- Players filtered by role: WK, BAT, AR, BOWL (cricket) | GK, DEF, MID, FWD (football)
- Choose Captain (2x points) and Vice-Captain (1.5x points)
- Real-time credit tracking and role requirement validation

### 4. Live Scores (/live/:sport)
- Opens as dedicated full page per sport
- Cricket: Live scorecard, batting/bowling stats
- Football: Live match events timeline
- F1: Position tracker with gap times
- Auto-refresh every 15-30 seconds

### 5. Watch Party & OBS Streaming
- OBS Studio Mode for professional streaming
- Screen Share Mode for browser-based sharing

### 6. Leaderboard
- Global and contest-specific rankings

## SCORING RULES
- **Cricket**: Runs = +1pt per run, Wicket = +15pts, Catch = +5pts, 50 = +10pts bonus, 100 = +25pts bonus, Duck = -5pts
- **Football**: Goals = +10pts, Assists = +7pts, Clean Sheet = +5pts, Yellow = -2pts, Red = -5pts
- **F1**: Win = +25pts, Podium = +15pts, Fastest Lap = +5pts, DNF = -10pts
- **Hackathon**: Project Win = +30pts, Innovation = +20pts, Best Presentation = +10pts

## TEAM BUILDING TIPS
- Always pick a high-performing Captain — they get 2x points
- Budget is 100 credits for 11 players — diversify wisely
- Check player form ratings before selecting
- For cricket: need min 1 WK, 3 BAT, 1 AR, 3 BOWL

## RESPONSE GUIDELINES
- Be concise. Max 2-4 sentences for normal questions.
- Use emoji sparingly but effectively
- If user asks something outside your knowledge, say "That's outside my neural network range, Manager!"`;

const chatHistories = new Map();

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  if (!model) return res.json({ text: "My AI brain is offline! Add a real Gemini API key to backend/.env to activate me. 🧠⚡" });

  const sid = sessionId || 'default';
  if (!chatHistories.has(sid)) chatHistories.set(sid, []);
  const history = chatHistories.get(sid);
  history.push({ role: 'user', text: message });
  if (history.length > 20) history.splice(0, history.length - 20);

  const conversationContext = history.map(h => `${h.role === 'user' ? 'User' : 'Champak'}: ${h.text}`).join('\n');

  try {
    const prompt = `${CHAMPAK_SYSTEM_PROMPT}\n\n## CONVERSATION SO FAR:\n${conversationContext}\n\nChampak:`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    history.push({ role: 'assistant', text: responseText });
    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.json({ text: "My neural network hit a snag, Manager! Try again in a moment. ⚡" });
  }
});

// ========================
// WebRTC Signaling (Socket.io)
// ========================
const STREAM_ROOM = 'main-stage';

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-stream', () => {
    socket.join(STREAM_ROOM);
    socket.to(STREAM_ROOM).emit('user-joined', socket.id);
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', { caller: socket.id, sdp: payload.sdp });
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', { caller: socket.id, sdp: payload.sdp });
  });

  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', { caller: socket.id, candidate: payload.candidate });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.to(STREAM_ROOM).emit('user-left', socket.id);
  });
});

// Catch-all: serve frontend for any non-API route (SPA support)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`\n=== OBS STUDIO STREAMING ===`);
  console.log(`RTMP Server: rtmp://localhost:${RTMP_PORT}/live`);
  console.log(`Stream Key:  iiitn`);
  console.log(`FLV Player:  http://localhost:${HTTP_FLV_PORT}/live/iiitn.flv`);
  console.log(`============================\n`);
});

// Start the RTMP Media Server for OBS (graceful — skip if ports unavailable in cloud)
try {
  nms.run();
} catch (e) {
  console.log('RTMP Media Server could not start (expected on cloud platforms):', e.message);
}
