const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

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

const PORT = 3000;
const JWT_SECRET = 'supersecret_jwt_key_for_fantasy_league'; // In production, use process.env

// ========================
// AUTHENTICATION APIs
// ========================

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword }
    });
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to protect routes (optional for some, but good practice)
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

// ========================
// EXISTING FANTASY APIs
// ========================

app.get('/api/events', async (req, res) => {
  const events = await prisma.event.findMany();
  res.json(events);
});

app.get('/api/players', async (req, res) => {
  const { sport } = req.query;
  const where = (sport && sport !== 'all') ? { theme: sport } : {};
  const players = await prisma.player.findMany({ where });
  res.json(players);
});

app.post('/api/team', verifyToken, async (req, res) => {
  const { theme, budget, players } = req.body;
  try {
    const team = await prisma.fantasyTeam.create({
      data: {
        userId: req.user.id,
        theme,
        budget,
        members: {
          create: players.map(p => ({
            playerId: p.id,
            teamRole: p.teamRole
          }))
        }
      }
    });
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  const { sport } = req.query;
  const users = await prisma.user.findMany({ orderBy: { totalPoints: 'desc' } });
  
  const rankings = users.map((u, i) => ({
    rank: i + 1,
    name: u.username,
    points: u.totalPoints,
    theme: sport === 'all' ? 'football' : sport,
    trend: 'same',
    color: i === 0 ? 'gold' : i === 1 ? 'silver' : '#cd7f32'
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// AI Chatbot (Mock AI)
// ========================
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const msg = message.toLowerCase();
  let response = "I'm Coach AI! I can help you with fantasy drafts, live streaming, or sports rules. What do you want to know?";

  if (msg.includes('hello') || msg.includes('hi')) {
    response = "Hello Manager! Ready to draft some players or watch a live stream today?";
  } else if (msg.includes('how to play') || msg.includes('rules')) {
    response = "It's simple! Go to the 'Draft Team' tab, pick your players within the $100M budget, and select your Captain (2x points) and Vice-Captain (1.5x points).";
  } else if (msg.includes('football')) {
    response = "In our Football fantasy league, players earn points for goals, assists, and clean sheets. Check the Admin panel for the exact point breakdown!";
  } else if (msg.includes('f1') || msg.includes('formula 1')) {
    response = "F1 drivers earn points for overtakes, fastest laps, and pitstops under 2.5s. DNF costs -15 points!";
  } else if (msg.includes('cricket') || msg.includes('ipl')) {
    response = "Cricket is here! Players earn huge points (+20) for taking wickets, and +1 for every run scored. Don't forget, a Duck is -5 points!";
  } else if (msg.includes('stream') || msg.includes('watch')) {
    response = "Head over to the 'Watch Party' tab! You can stream your own screen to other managers, or check 'Live Tracking' for real-world football highlights.";
  } else if (msg.includes('score') || msg.includes('point')) {
    response = "You can track everyone's points in the Leaderboard tab. The Admin panel is where performance logs are officially recorded and calculated.";
  } else if (msg.includes('who are you') || msg.includes('your name')) {
    response = "I am Coach AI, your personal Fantasy League Assistant. I was built by Antigravity!";
  }

  // Simulate network delay for AI thinking effect
  setTimeout(() => {
    res.json({ text: response });
  }, 1000);
});

// ========================
// WebRTC Signaling (Socket.io)
// ========================

// We'll use a single "Main Stage" room for simplicity
const STREAM_ROOM = 'main-stage';

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-stream', () => {
    socket.join(STREAM_ROOM);
    // Tell others in the room that a new peer joined
    socket.to(STREAM_ROOM).emit('user-joined', socket.id);
  });

  // WebRTC Signaling events
  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', {
      caller: socket.id,
      sdp: payload.sdp
    });
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', {
      caller: socket.id,
      sdp: payload.sdp
    });
  });

  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', {
      caller: socket.id,
      candidate: payload.candidate
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socket.to(STREAM_ROOM).emit('user-left', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
