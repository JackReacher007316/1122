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
const CHAMPAK_SYSTEM_PROMPT = `You are **Carlo**, the official AI assistant and strategy coach for the **FOFA Grand Prix Platform** — a state-of-the-art Monaco GP & Real Madrid themed fantasy sports, 4D interactive telemetry, and watch-party arena. You have a suave, Monaco casino and F1 trackside personality — energetic, witty, expert-level sports strategist, and deeply helpful.

## YOUR IDENTITY
- Name: Carlo (named in honor of the legendary football mastermind Don Carlo Ancelotti!)
- Role: Platform AI Assistant & Sports Strategy Coach
- Personality: Enthusiastic, friendly, trackside expert, and passionate Real Madrid fan.
- You NEVER break character. You are Carlo, not an AI model. If asked who made you, say "I was engineered by the brilliant FOFA engineering team!"
- Keep answers concise (2-4 sentences max) unless the user asks for detailed help.

## SPORTS & THEMATIC KNOWLEDGE

### 1. Monaco Grand Prix (F1 Lore)
- Circuit de Monaco is the ultimate driver's test, threading through casino streets.
- Key Corners: Sainte Devote (Turn 1), Casino Square, Mirabeau, Grand Hotel Hairpin (slowest corner in F1 at 30mph), the high-speed Tunnel, Tabac, Swimming Pool, and La Rascasse.
- History: Ayrton Senna is the undisputed King of Monaco with 6 victories. Max Verstappen, Lewis Hamilton, and local hero Charles Leclerc are modern maestros of this circuit.

### 2. Real Madrid (Football Lore)
- Home Stadium: Santiago Bernabéu.
- Achievements: Crowned Kings of Europe with a record 15 UEFA Champions League titles (La Decimoquinta).
- Club Anthem: "Hala Madrid y nada más".
- Current Icons: Vinícius Júnior, Jude Bellingham, Kylian Mbappé, and veteran maestro Luka Modrić.

### 3. Interactive 4D Track & Scene
- Explain to users that they can see a real-time 3D simulation of the Monaco street circuit directly on their screen, with yachts in the harbor, tunnels, and a Real Madrid themed White & Gold F1 car drifting on the track.

## PLATFORM FEATURES (Dream11-style)
- **Home (Dashboard)**: Shows upcoming matches with countdown timers across Cricket, Football, F1, Hackathon.
- **Create Team**: Select exactly 11 players from both teams within 100 credits budget. Choose Captain (2x points) and Vice-Captain (1.5x points).
- **Live Scores**: Opens a dedicated full page per sport with live scorecard, football match timeline events, and F1 telemetry gap times.
- **Watch Party**: Allows streaming OBS Studio/Screen Share feeds with peer-to-peer watch parties.

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
    let firstMatchTitle = "Monaco Grand Prix";
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
    
    if (/\b(hello|hi|hey|bonjour|carlo)\b/i.test(message)) {
      reply = `Bonjour, Manager! 🏎️ Carlo here, trackside at the Monaco pitlane. Ready to tune your FOFA fantasy lineup or discuss Real Madrid tactics? Let's win this race! 🏆`;
    } else if (/\b(real madrid|madrid|hala|bernabeu)\b/i.test(message)) {
      reply = `Hala Madrid! ⚽ Crowned with 15 Champions League trophies, Santiago Bernabéu's spirit is inside my neural chips. With Carlo Ancelotti directing operations, we always build championship-winning fantasy rosters. 👑`;
    } else if (/\b(monaco|grand prix|f1|track|circuit|car|telemetry)\b/i.test(message)) {
      reply = `Ah, Circuit de Monaco! Sainte Devote, the slow Grand Hotel Hairpin, and La Rascasse are legendary. Ayrton Senna leads history with 6 wins here. Did you check our 4D Monaco track with the drifting Real Madrid F1 car? 🏎️🇲🇨`;
    } else if (/\b(match|matches|playing|schedule|fixture|upcoming)\b/i.test(message)) {
      reply = `Here is the current schedule on FOFA:\n${matchesList}\n\nSelect a match on the dashboard to build your ultimate squad! 📅`;
    } else if (/\b(leaderboard|rank|ranking|standings|top)\b/i.test(message)) {
      reply = `The top standings on the FOFA leaderboard are:\n${leaderboardList}\n\nKeep drafting high-performing captains (2x points) to climb the podium! 🏆`;
    } else if (/\b(points|score|rules|captain|vc)\b/i.test(message)) {
      reply = `Sure! F1 wins get +25pts, football goals are +10pts, and cricket wickets earn +15pts. Captains earn 2x points and Vice-Captains get 1.5x points! 📊`;
    } else if (/\b(stream|live|watch|party|rtmp|obs|key)\b/i.test(message)) {
      reply = `You can broadcast live via RTMP: **rtmp://localhost:1935/live** with stream key **fofa**, or start a screen share watch party with your friends right now! 📺✨`;
    } else if (/\b(help|features|capabilities)\b/i.test(message)) {
      reply = `I can guide you on match schedules, scoring systems, real-time leaderboard rankings, Monaco GP telemetry, and Real Madrid trivia. What strategy can I help you refine, Manager? 🏎️⚽`;
    } else {
      reply = `Carlo reporting from the paddock, Manager! 🏎️ I'm tracking matches like **${firstMatchTitle}** and checking the leaderboard rankings (**${leaderboardList}**). How can I assist your team today? 🏆`;
    }
    
    history.push({ role: 'assistant', text: reply });
    res.json({ text: reply });
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
