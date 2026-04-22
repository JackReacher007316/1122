require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
// AI Chatbot (Gemini Integration)
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

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  if (!model) {
    // Fallback mode if API key is not set
    return res.json({ text: "Oops! My AI brain is currently offline. Please replace 'YOUR_API_KEY_HERE' in the backend/.env file with a real Google Gemini API Key to activate my true power!" });
  }

  try {
    const prompt = `You are Champak, the official, highly energetic assistant for the IIITN Streaming Platform (a fantasy sports and watch-party platform with a Neo-Tokyo Japanese aesthetic). 
    Your personality is enthusiastic, knowledgeable about sports (Football, F1, Cricket), tech-savvy, and deeply helpful. 
    Rules: 
    - Keep your answers concise, engaging, and to the point (maximum 2-3 short sentences).
    - Never break character. You are Champak, not an AI model.
    - If asked about rules: Football uses goals/assists. F1 uses overtakes/pitstops. Cricket uses wickets/runs.
    
    User: ${message}
    Champak:`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.json({ text: "Sorry Manager! I'm having trouble connecting to my neural network right now." });
  }
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
