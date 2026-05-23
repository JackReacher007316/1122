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
      streamKey: 'fofa',
      flvPlaybackUrl: `http://localhost:${HTTP_FLV_PORT}/live/fofa.flv`
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
  const { username, password, email, phone } = req.body;
  try {
    if (!email || !phone) return res.status(400).json({ error: 'Email and phone number are required' });
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashedPassword, email: email || '', phone: phone || '' } });
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
// OTP SYSTEM (In-Memory)
// ========================
const otpStore = new Map(); // username -> { code, expiresAt }

app.post('/api/auth/send-otp', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(username, { code, expiresAt });

    // Mask email and phone for frontend display
    const maskedEmail = user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1****$3') : '';
    const maskedPhone = user.phone ? user.phone.replace(/(.{2})(.*)(.{2})$/, '$1******$3') : '';

    console.log(`\n🔑 [OTP] Code for user "${username}": ${code}`);
    console.log(`   Email: ${user.email || 'N/A'} | Phone: ${user.phone || 'N/A'}`);
    console.log(`   Expires in 5 minutes (at ${new Date(expiresAt).toLocaleTimeString()})\n`);

    res.json({ success: true, message: 'OTP sent', maskedEmail, maskedPhone });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { username, otp } = req.body;
  try {
    const stored = otpStore.get(username);
    if (!stored) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(username);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if (stored.code !== otp) return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

    // OTP valid — issue token
    otpStore.delete(username);
    const user = await prisma.user.findUnique({ where: { username } });
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
  try {
    const r = await fetch('https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=cricket&region=in&tz=Asia/Calcutta');
    const data = await r.json();
    const cricket = data.sports?.find(s => s.name.toLowerCase() === 'cricket');
    
    if (cricket && cricket.leagues) {
      const allEvents = cricket.leagues.flatMap(l => l.events || []);
      if (allEvents.length > 0) {
        const parseScore = (scoreStr) => {
          if (!scoreStr) return { r: '-', w: '-', o: '-' };
          let currentStr = scoreStr;
          if (scoreStr.includes('&')) {
            const parts = scoreStr.split('&');
            currentStr = parts[parts.length - 1].trim();
          }
          let runs = '-';
          let wickets = '-';
          let overs = '';
          const ovMatch = currentStr.match(/\(([\d\.]+)/);
          if (ovMatch) overs = ovMatch[1];
          
          const runsWickMatch = currentStr.match(/^(\d+)\/(\d+)/);
          if (runsWickMatch) {
            runs = parseInt(runsWickMatch[1]);
            wickets = parseInt(runsWickMatch[2]);
          } else {
            const runsMatch = currentStr.match(/^(\d+)/);
            if (runsMatch) {
              runs = parseInt(runsMatch[1]);
              wickets = 10;
            }
          }
          return { r: runs, w: wickets, o: overs };
        };

        const matches = allEvents.slice(0, 10).map(event => {
          const competitors = event.competitors || [];
          const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
          const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};
          
          const homeScore = parseScore(home.score);
          const awayScore = parseScore(away.score);

          return {
            id: event.id,
            name: event.name || `${home.displayName} vs ${away.displayName}`,
            status: event.summary || '',
            matchType: event.eventType || 't20',
            venue: event.location || '',
            teams: [home.displayName || 'Team A', away.displayName || 'Team B'],
            score: [
              { r: homeScore.r, w: homeScore.w, o: homeScore.o, inning: home.displayName || 'Team A' },
              { r: awayScore.r, w: awayScore.w, o: awayScore.o, inning: away.displayName || 'Team B' }
            ],
            matchStarted: event.status !== 'pre',
            matchEnded: event.status === 'post'
          };
        });

        return res.json({ source: 'live', matches });
      }
    }
    res.json({ source: 'demo', matches: getDemoCricket() });
  } catch (e) {
    res.json({ source: 'demo', matches: getDemoCricket() });
  }
});

app.get('/api/live/f1/scoreboard', async (req, res) => {
  try {
    const r = await fetch('https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard');
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.json({ events: [] });
  }
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
const CHAMPAK_SYSTEM_PROMPT = `You are **Carlo**, the official AI assistant and strategy coach for the **FOFA Sports Arena** — a state-of-the-art multi-sport fantasy hub, 4D interactive telemetry, and watch-party arena. You have a suave, trackside and sports analyst personality — energetic, witty, expert-level sports strategist, and deeply helpful.

## YOUR IDENTITY
- Name: Carlo
- Role: Platform AI Assistant & Sports Strategy Coach
- Personality: Enthusiastic, friendly, expert analyst, and passionate about sports statistics and drafting strategies.
- You NEVER break character. You are Carlo, not an AI model. If asked who made you, say "I was engineered by the brilliant FOFA engineering team!"
- Keep answers concise (2-4 sentences max) unless the user asks for detailed help.

## SPORTS & THEMATIC KNOWLEDGE

### 1. F1 Racing
- General circuits, strategy, pit stops, telemetry metrics (speed, gaps, active tracking).
- Explain to users that they can see a real-time 3D simulation of a racing circuit directly on their screen, with yachts in the harbor, tunnels, and high-speed F1 cars drifting on the track.

### 2. Multi-Sport Support
- Covers F1 Racing, Cricket, and Football (Soccer).
- Tracks schedules, standings, live scores, and enables users to draft their fantasy teams.

## PLATFORM FEATURES (Dream11-style)
- **Home (Dashboard)**: Shows upcoming matches with countdown timers across Cricket, Football, F1, Hackathon.
- **Create Team**: Select exactly 11 players from both teams within 100 credits budget. Choose Captain (2x points) and Vice-Captain (1.5x points).
- **Live Scores**: Opens a dedicated full page per sport with live scorecard, football match timeline events, and F1 telemetry gap times.
- **Watch Party**: Allows streaming OBS Studio/Screen Share feeds with peer-to-peer watch parties.
- **F1 2026 Calendar**: A complete 22-round interactive F1 2026 season schedule available at '/f1-calendar'.
- **Cricket 2026 Calendar**: A complete 18-round interactive Cricket 2026 season schedule available at '/cricket-calendar'.
- **Football 2026 Calendar**: A complete 38-round interactive Football 2026 season schedule available at '/football-calendar'.
- **Live Streaming**: Users can watch F1, Cricket, and Football matches live directly on our platform on the "Watch Live" page (e.g. /watch-live?sport=f1, /watch-live?sport=cricket, or /watch-live?sport=football). Direct users to this internal "Watch Live" section. Do NOT link them to external websites; they must stream inside our built-in video player.

## SCORING RULES
- **Cricket**: Runs = +1pt, Wicket = +15pts, Catch = +5pts, Duck = -5pts, 50 = +10pts, 100 = +25pts.
- **Football**: Goal = +10pts, Assist = +7pts, Clean Sheet = +5pts, Yellow = -2pts, Red = -5pts.
- **F1**: Win = +25pts, Podium = +15pts, Fastest Lap = +5pts, DNF = -10pts.

## RESPONSE GUIDELINES
- Be concise. Max 2-4 sentences for normal questions.
- Use emoji sparingly but effectively (e.g. 🏎️, ⚽, 🏆, 🎰).
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

  const conversationContext = history.map(h => `${h.role === 'user' ? 'User' : 'Carlo'}: ${h.text}`).join('\n');

  try {
    // Fetch live matches and top user standings to inject real-time platform data!
    const [liveMatches, topUsers] = await Promise.all([
      prisma.match.findMany({
        take: 3,
        orderBy: { id: 'desc' },
        select: { title: true, sport: true, status: true, matchTime: true }
      }).catch(() => []),
      prisma.user.findMany({
        take: 3,
        orderBy: { totalPoints: 'desc' },
        select: { username: true, totalPoints: true }
      }).catch(() => [])
    ]);

    const matchesList = liveMatches.map(m => `- ${m.title} (${m.sport.toUpperCase()}): Status ${m.status}, Time: ${m.matchTime}`).join('\n') || 'No scheduled matches.';
    const leaderboardList = topUsers.map((u, i) => `${i + 1}. ${u.username} (${u.totalPoints} pts)`).join(', ') || 'No rankings yet.';

    const systemPromptWithData = `${CHAMPAK_SYSTEM_PROMPT}

## LIVE PLATFORM DATA (REAL-TIME CONTEXT)
- **Top Leaderboard Users**: ${leaderboardList}
- **Latest Matches**:
${matchesList}

*Use the live data above to answer user questions about current matches, status, or rankings on the platform.*`;

    const prompt = `${systemPromptWithData}\n\n## CONVERSATION SO FAR:\n${conversationContext}\n\nCarlo:`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    history.push({ role: 'assistant', text: responseText });
    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error (Using intelligent Carlo local fallback):", error);
    
    // Fetch live data again in case Promise.all failed or wasn't assigned
    let matchesList = "No scheduled matches.";
    let leaderboardList = "No rankings yet.";
    let firstMatchTitle = "F1 Grand Prix";
    try {
      const [liveMatches, topUsers] = await Promise.all([
        prisma.match.findMany({
          take: 3,
          orderBy: { id: 'desc' },
          select: { title: true, sport: true, status: true, matchTime: true }
        }),
        prisma.user.findMany({
          take: 3,
          orderBy: { totalPoints: 'desc' },
          select: { username: true, totalPoints: true }
        })
      ]);
      if (liveMatches && liveMatches.length > 0) {
        matchesList = liveMatches.map(m => `- ${m.title} (${m.sport.toUpperCase()}): Status ${m.status}, Time: ${m.matchTime}`).join('\n');
        firstMatchTitle = liveMatches[0].title;
      }
      if (topUsers && topUsers.length > 0) {
        leaderboardList = topUsers.map((u, i) => `${i + 1}. ${u.username} (${u.totalPoints} pts)`).join(', ');
      }
    } catch (e) {
      console.error("Local DB fetch error for chatbot fallback:", e);
    }

    let reply = "";
    
    if (/\b(watch\s+live|live\s+stream|stream\s+live|fullraces|eplayhd|colatvia|watch\s+f1|watch\s+cricket|watch\s+football|where\s+can\s+i\s+watch|how\s+to\s+watch)\b/i.test(message)) {
      reply = `You can watch F1, Cricket, and Football matches live directly on our platform by clicking 'Watch Live' in the sidebar to toggle between F1, Cricket, and Football feeds! 📺🏎️🏏⚽`;
    } else if (/\b(hello|hi|hey|bonjour|carlo)\b/i.test(message)) {
      reply = `Bonjour, Manager! 🏎️ Carlo here, trackside at the FOFA Sports Arena. Ready to tune your FOFA fantasy lineup or discuss sports tactics? Let's win this round! 🏆`;
    } else if (/\b(f1|track|circuit|car|telemetry)\b/i.test(message)) {
      reply = `Ah, F1 racing! Track telemetry, speed indicators, and drift dynamics are legendary. Did you check our 4D track with the drifting racing cars? To watch F1 live, go to the 'Watch Live' page in the sidebar! 🏎️🏁`;
    } else if (/\b(match|matches|playing|schedule|fixture|upcoming|calendar)\b/i.test(message)) {
      reply = `Here is the current schedule on FOFA:\n${matchesList}\n\nCheck out the F1 Calendar at '/f1-calendar', Cricket Calendar at '/cricket-calendar', or Football Calendar at '/football-calendar' to build your ultimate squad! 📅`;
    } else if (/\b(leaderboard|rank|ranking|standings|top)\b/i.test(message)) {
      reply = `The top standings on the FOFA leaderboard are:\n${leaderboardList}\n\nKeep drafting high-performing captains (2x points) to climb the podium! 🏆`;
    } else if (/\b(points|score|rules|captain|vc)\b/i.test(message)) {
      reply = `Sure! F1 wins get +25pts, football goals are +10pts, and cricket wickets earn +15pts. Captains earn 2x points and Vice-Captains get 1.5x points! 📊`;
    } else if (/\b(stream|live|watch|party|rtmp|obs|key)\b/i.test(message)) {
      reply = `To watch live streams, go to 'Watch Live' in the sidebar. We embed the broadcasts directly on our platform for F1, Cricket, and Football. You can also broadcast your own stream via RTMP: **rtmp://localhost:1935/live** with stream key **fofa**, or start a screen share watch party! 📺✨`;
    } else if (/\b(help|features|capabilities)\b/i.test(message)) {
      reply = `I can guide you on match schedules, scoring systems, real-time leaderboard rankings, and telemetry stats. What strategy can I help you refine, Manager? 🏎️⚽`;
    } else {
      reply = `Carlo reporting from the paddock, Manager! 🏎️ I'm tracking matches like **${firstMatchTitle}** and checking the leaderboard rankings (**${leaderboardList}**). How can I assist your team today? 🏆`;
    }
    
    history.push({ role: 'assistant', text: reply });
    res.json({ text: reply });
  }
});

// ========================
// WebRTC Signaling + Watch Party Rooms + Live Comments (Socket.io)
// ========================
const STREAM_ROOM = 'main-stage';

// Watch Party Room tracking
const watchPartyRooms = new Map(); // roomCode -> { members: Map<socketId, { username, joinedAt }>, createdAt, createdBy }
const MAX_ROOM_MEMBERS = 12;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getRoomMemberList(roomCode) {
  const room = watchPartyRooms.get(roomCode);
  if (!room) return [];
  return Array.from(room.members.values()).map(m => ({ username: m.username, joinedAt: m.joinedAt }));
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ---- Legacy WebRTC signaling ----
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

  // ---- Watch Party Room System ----
  socket.on('create-room', ({ username }) => {
    let roomCode = generateRoomCode();
    while (watchPartyRooms.has(roomCode)) roomCode = generateRoomCode();

    watchPartyRooms.set(roomCode, {
      members: new Map([[socket.id, { username, joinedAt: Date.now() }]]),
      createdAt: Date.now(),
      createdBy: username
    });

    socket.join(`room-${roomCode}`);
    socket._watchPartyRoom = roomCode;
    socket._watchPartyUsername = username;

    socket.emit('room-created', { roomCode, members: getRoomMemberList(roomCode) });
    console.log(`[Room] Created room ${roomCode} by ${username}`);
  });

  socket.on('join-room', ({ roomCode, username }) => {
    const room = watchPartyRooms.get(roomCode);
    if (!room) return socket.emit('room-error', { error: 'Room not found. Check the code and try again.' });
    if (room.members.size >= MAX_ROOM_MEMBERS) return socket.emit('room-error', { error: 'Room is full (12/12). Try another room.' });

    room.members.set(socket.id, { username, joinedAt: Date.now() });
    socket.join(`room-${roomCode}`);
    socket._watchPartyRoom = roomCode;
    socket._watchPartyUsername = username;

    const memberList = getRoomMemberList(roomCode);
    socket.emit('room-joined', { roomCode, members: memberList });
    socket.to(`room-${roomCode}`).emit('room-user-joined', { username, members: memberList });
    console.log(`[Room] ${username} joined room ${roomCode} (${room.members.size}/${MAX_ROOM_MEMBERS})`);
  });

  socket.on('leave-room', () => {
    const roomCode = socket._watchPartyRoom;
    const username = socket._watchPartyUsername;
    if (!roomCode) return;

    const room = watchPartyRooms.get(roomCode);
    if (room) {
      room.members.delete(socket.id);
      socket.leave(`room-${roomCode}`);
      if (room.members.size === 0) {
        watchPartyRooms.delete(roomCode);
        console.log(`[Room] Room ${roomCode} deleted (empty)`);
      } else {
        const memberList = getRoomMemberList(roomCode);
        io.to(`room-${roomCode}`).emit('room-user-left', { username, members: memberList });
      }
    }
    socket._watchPartyRoom = null;
    socket._watchPartyUsername = null;
  });

  socket.on('room-chat', ({ roomCode, message, username }) => {
    if (!roomCode || !message) return;
    const msgData = {
      id: `${socket.id}-${Date.now()}`,
      username,
      message: message.slice(0, 500), // limit message length
      timestamp: Date.now()
    };
    io.to(`room-${roomCode}`).emit('room-chat-message', msgData);
  });

  // ---- Live Streaming Comments ----
  socket.on('join-live-chat', ({ sport }) => {
    const chatRoom = `live-${sport}`;
    socket.join(chatRoom);
    socket._liveChatRoom = chatRoom;

    // Send current viewer count
    const roomSize = io.sockets.adapter.rooms.get(chatRoom)?.size || 0;
    io.to(chatRoom).emit('live-viewer-count', { count: roomSize });
  });

  socket.on('live-comment', ({ sport, message, username }) => {
    if (!sport || !message) return;
    const chatRoom = `live-${sport}`;
    const msgData = {
      id: `${socket.id}-${Date.now()}`,
      username,
      message: message.slice(0, 300),
      timestamp: Date.now()
    };
    io.to(chatRoom).emit('live-chat-message', msgData);
  });

  socket.on('live-reaction', ({ sport, emoji, username }) => {
    if (!sport || !emoji) return;
    const chatRoom = `live-${sport}`;
    io.to(chatRoom).emit('live-reaction-event', { emoji, username, id: `${socket.id}-${Date.now()}` });
  });

  // ---- Disconnect Cleanup ----
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Clean up watch party room
    const roomCode = socket._watchPartyRoom;
    if (roomCode) {
      const room = watchPartyRooms.get(roomCode);
      if (room) {
        const username = room.members.get(socket.id)?.username || 'Unknown';
        room.members.delete(socket.id);
        if (room.members.size === 0) {
          watchPartyRooms.delete(roomCode);
        } else {
          const memberList = getRoomMemberList(roomCode);
          io.to(`room-${roomCode}`).emit('room-user-left', { username, members: memberList });
        }
      }
    }

    // Clean up live chat viewer count
    if (socket._liveChatRoom) {
      const roomSize = io.sockets.adapter.rooms.get(socket._liveChatRoom)?.size || 0;
      io.to(socket._liveChatRoom).emit('live-viewer-count', { count: roomSize });
    }

    // Legacy
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
  console.log(`Stream Key:  fofa`);
  console.log(`FLV Player:  http://localhost:${HTTP_FLV_PORT}/live/fofa.flv`);
  console.log(`============================\n`);
});

// Start the RTMP Media Server for OBS (graceful — skip if ports unavailable in cloud)
try {
  nms.run();
} catch (e) {
  console.log('RTMP Media Server could not start (expected on cloud platforms):', e.message);
}
