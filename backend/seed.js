const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🏏 Seeding Dream11-style data...');

  // ========================
  // PLAYERS — CRICKET (22 players, 2 teams)
  // ========================
  const cricketPlayers = [
    // CSK Players
    { name: 'MS Dhoni', role: 'Wicketkeeper', cost: 18, theme: 'cricket', img: '🏏', credits: 9.0, team: 'CSK', playerType: 'WK', rating: 8.5, selectedByPct: 72 },
    { name: 'Ruturaj Gaikwad', role: 'Batsman', cost: 16, theme: 'cricket', img: '🏏', credits: 9.5, team: 'CSK', playerType: 'BAT', rating: 9.0, selectedByPct: 81 },
    { name: 'Devon Conway', role: 'Batsman', cost: 14, theme: 'cricket', img: '🏏', credits: 8.5, team: 'CSK', playerType: 'BAT', rating: 7.8, selectedByPct: 55 },
    { name: 'Shivam Dube', role: 'All-Rounder', cost: 12, theme: 'cricket', img: '🏏', credits: 8.0, team: 'CSK', playerType: 'AR', rating: 7.5, selectedByPct: 62 },
    { name: 'Ravindra Jadeja', role: 'All-Rounder', cost: 15, theme: 'cricket', img: '🏏', credits: 9.0, team: 'CSK', playerType: 'AR', rating: 8.8, selectedByPct: 78 },
    { name: 'Moeen Ali', role: 'All-Rounder', cost: 11, theme: 'cricket', img: '🏏', credits: 8.0, team: 'CSK', playerType: 'AR', rating: 7.0, selectedByPct: 45 },
    { name: 'Deepak Chahar', role: 'Bowler', cost: 12, theme: 'cricket', img: '🏏', credits: 8.5, team: 'CSK', playerType: 'BOWL', rating: 7.6, selectedByPct: 58 },
    { name: 'Tushar Deshpande', role: 'Bowler', cost: 8, theme: 'cricket', img: '🏏', credits: 7.0, team: 'CSK', playerType: 'BOWL', rating: 6.5, selectedByPct: 32 },
    { name: 'Matheesha Pathirana', role: 'Bowler', cost: 10, theme: 'cricket', img: '🏏', credits: 8.0, team: 'CSK', playerType: 'BOWL', rating: 8.0, selectedByPct: 65 },
    { name: 'Rachin Ravindra', role: 'Batsman', cost: 9, theme: 'cricket', img: '🏏', credits: 7.5, team: 'CSK', playerType: 'BAT', rating: 7.2, selectedByPct: 38 },
    { name: 'Shardul Thakur', role: 'Bowler', cost: 9, theme: 'cricket', img: '🏏', credits: 7.5, team: 'CSK', playerType: 'BOWL', rating: 7.0, selectedByPct: 40 },
    // RCB Players
    { name: 'Virat Kohli', role: 'Batsman', cost: 20, theme: 'cricket', img: '🏏', credits: 10.0, team: 'RCB', playerType: 'BAT', rating: 9.5, selectedByPct: 92 },
    { name: 'Faf du Plessis', role: 'Batsman', cost: 16, theme: 'cricket', img: '🏏', credits: 9.0, team: 'RCB', playerType: 'BAT', rating: 8.5, selectedByPct: 70 },
    { name: 'Glenn Maxwell', role: 'All-Rounder', cost: 14, theme: 'cricket', img: '🏏', credits: 8.5, team: 'RCB', playerType: 'AR', rating: 7.5, selectedByPct: 55 },
    { name: 'Rajat Patidar', role: 'Batsman', cost: 10, theme: 'cricket', img: '🏏', credits: 8.0, team: 'RCB', playerType: 'BAT', rating: 7.8, selectedByPct: 48 },
    { name: 'Dinesh Karthik', role: 'Wicketkeeper', cost: 12, theme: 'cricket', img: '🏏', credits: 8.0, team: 'RCB', playerType: 'WK', rating: 7.5, selectedByPct: 42 },
    { name: 'Wanindu Hasaranga', role: 'All-Rounder', cost: 13, theme: 'cricket', img: '🏏', credits: 8.5, team: 'RCB', playerType: 'AR', rating: 8.0, selectedByPct: 60 },
    { name: 'Mohammed Siraj', role: 'Bowler', cost: 14, theme: 'cricket', img: '🏏', credits: 9.0, team: 'RCB', playerType: 'BOWL', rating: 8.2, selectedByPct: 68 },
    { name: 'Josh Hazlewood', role: 'Bowler', cost: 12, theme: 'cricket', img: '🏏', credits: 8.5, team: 'RCB', playerType: 'BOWL', rating: 8.0, selectedByPct: 52 },
    { name: 'Harshal Patel', role: 'Bowler', cost: 11, theme: 'cricket', img: '🏏', credits: 8.0, team: 'RCB', playerType: 'BOWL', rating: 7.8, selectedByPct: 50 },
    { name: 'Shahbaz Ahmed', role: 'All-Rounder', cost: 7, theme: 'cricket', img: '🏏', credits: 7.0, team: 'RCB', playerType: 'AR', rating: 6.5, selectedByPct: 25 },
    { name: 'Anuj Rawat', role: 'Wicketkeeper', cost: 6, theme: 'cricket', img: '🏏', credits: 6.5, team: 'RCB', playerType: 'WK', rating: 6.0, selectedByPct: 15 },
  ];

  // ========================
  // PLAYERS — FOOTBALL (22 players, 2 teams)
  // ========================
  const footballPlayers = [
    // Man City
    { name: 'Ederson', role: 'Goalkeeper', cost: 12, theme: 'football', img: '⚽', credits: 8.5, team: 'Man City', playerType: 'GK', rating: 8.0, selectedByPct: 55 },
    { name: 'Ruben Dias', role: 'Defender', cost: 14, theme: 'football', img: '⚽', credits: 9.0, team: 'Man City', playerType: 'DEF', rating: 8.5, selectedByPct: 62 },
    { name: 'Kyle Walker', role: 'Defender', cost: 10, theme: 'football', img: '⚽', credits: 7.5, team: 'Man City', playerType: 'DEF', rating: 7.5, selectedByPct: 40 },
    { name: 'John Stones', role: 'Defender', cost: 11, theme: 'football', img: '⚽', credits: 8.0, team: 'Man City', playerType: 'DEF', rating: 7.8, selectedByPct: 45 },
    { name: 'Kevin De Bruyne', role: 'Midfielder', cost: 18, theme: 'football', img: '⚽', credits: 10.0, team: 'Man City', playerType: 'MID', rating: 9.5, selectedByPct: 88 },
    { name: 'Bernardo Silva', role: 'Midfielder', cost: 15, theme: 'football', img: '⚽', credits: 9.0, team: 'Man City', playerType: 'MID', rating: 8.8, selectedByPct: 72 },
    { name: 'Rodri', role: 'Midfielder', cost: 13, theme: 'football', img: '⚽', credits: 8.5, team: 'Man City', playerType: 'MID', rating: 8.5, selectedByPct: 60 },
    { name: 'Phil Foden', role: 'Midfielder', cost: 16, theme: 'football', img: '⚽', credits: 9.5, team: 'Man City', playerType: 'MID', rating: 9.0, selectedByPct: 78 },
    { name: 'Erling Haaland', role: 'Forward', cost: 20, theme: 'football', img: '⚽', credits: 10.5, team: 'Man City', playerType: 'FWD', rating: 9.8, selectedByPct: 95 },
    { name: 'Julian Alvarez', role: 'Forward', cost: 12, theme: 'football', img: '⚽', credits: 8.0, team: 'Man City', playerType: 'FWD', rating: 8.0, selectedByPct: 52 },
    { name: 'Jack Grealish', role: 'Forward', cost: 11, theme: 'football', img: '⚽', credits: 8.0, team: 'Man City', playerType: 'FWD', rating: 7.5, selectedByPct: 42 },
    // Liverpool
    { name: 'Alisson', role: 'Goalkeeper', cost: 13, theme: 'football', img: '⚽', credits: 9.0, team: 'Liverpool', playerType: 'GK', rating: 8.8, selectedByPct: 68 },
    { name: 'Virgil van Dijk', role: 'Defender', cost: 15, theme: 'football', img: '⚽', credits: 9.0, team: 'Liverpool', playerType: 'DEF', rating: 8.8, selectedByPct: 72 },
    { name: 'Trent Alexander-Arnold', role: 'Defender', cost: 14, theme: 'football', img: '⚽', credits: 9.0, team: 'Liverpool', playerType: 'DEF', rating: 8.5, selectedByPct: 70 },
    { name: 'Andy Robertson', role: 'Defender', cost: 11, theme: 'football', img: '⚽', credits: 8.0, team: 'Liverpool', playerType: 'DEF', rating: 7.8, selectedByPct: 48 },
    { name: 'Ibrahima Konate', role: 'Defender', cost: 10, theme: 'football', img: '⚽', credits: 7.5, team: 'Liverpool', playerType: 'DEF', rating: 7.5, selectedByPct: 35 },
    { name: 'Alexis Mac Allister', role: 'Midfielder', cost: 13, theme: 'football', img: '⚽', credits: 8.5, team: 'Liverpool', playerType: 'MID', rating: 8.2, selectedByPct: 58 },
    { name: 'Dominik Szoboszlai', role: 'Midfielder', cost: 11, theme: 'football', img: '⚽', credits: 8.0, team: 'Liverpool', playerType: 'MID', rating: 7.8, selectedByPct: 45 },
    { name: 'Curtis Jones', role: 'Midfielder', cost: 8, theme: 'football', img: '⚽', credits: 7.0, team: 'Liverpool', playerType: 'MID', rating: 7.0, selectedByPct: 25 },
    { name: 'Mohamed Salah', role: 'Forward', cost: 19, theme: 'football', img: '⚽', credits: 10.0, team: 'Liverpool', playerType: 'FWD', rating: 9.5, selectedByPct: 90 },
    { name: 'Darwin Nunez', role: 'Forward', cost: 14, theme: 'football', img: '⚽', credits: 8.5, team: 'Liverpool', playerType: 'FWD', rating: 8.0, selectedByPct: 55 },
    { name: 'Luis Diaz', role: 'Forward', cost: 13, theme: 'football', img: '⚽', credits: 8.5, team: 'Liverpool', playerType: 'FWD', rating: 8.2, selectedByPct: 58 },
  ];

  // ========================
  // PLAYERS — F1 (12 drivers)
  // ========================
  const f1Players = [
    { name: 'Max Verstappen', role: 'Driver', cost: 25, theme: 'f1', img: '🏎️', credits: 10.5, team: 'Red Bull', playerType: 'DRV', rating: 9.8, selectedByPct: 92 },
    { name: 'Sergio Perez', role: 'Driver', cost: 14, theme: 'f1', img: '🏎️', credits: 8.0, team: 'Red Bull', playerType: 'DRV', rating: 7.5, selectedByPct: 45 },
    { name: 'Lewis Hamilton', role: 'Driver', cost: 22, theme: 'f1', img: '🏎️', credits: 10.0, team: 'Ferrari', playerType: 'DRV', rating: 9.2, selectedByPct: 82 },
    { name: 'Charles Leclerc', role: 'Driver', cost: 20, theme: 'f1', img: '🏎️', credits: 9.5, team: 'Ferrari', playerType: 'DRV', rating: 9.0, selectedByPct: 78 },
    { name: 'Lando Norris', role: 'Driver', cost: 18, theme: 'f1', img: '🏎️', credits: 9.5, team: 'McLaren', playerType: 'DRV', rating: 9.0, selectedByPct: 75 },
    { name: 'Oscar Piastri', role: 'Driver', cost: 16, theme: 'f1', img: '🏎️', credits: 9.0, team: 'McLaren', playerType: 'DRV', rating: 8.5, selectedByPct: 65 },
    { name: 'Carlos Sainz', role: 'Driver', cost: 15, theme: 'f1', img: '🏎️', credits: 8.5, team: 'Williams', playerType: 'DRV', rating: 8.2, selectedByPct: 55 },
    { name: 'George Russell', role: 'Driver', cost: 16, theme: 'f1', img: '🏎️', credits: 9.0, team: 'Mercedes', playerType: 'DRV', rating: 8.5, selectedByPct: 60 },
    { name: 'Fernando Alonso', role: 'Driver', cost: 14, theme: 'f1', img: '🏎️', credits: 8.0, team: 'Aston Martin', playerType: 'DRV', rating: 8.0, selectedByPct: 48 },
    { name: 'Pierre Gasly', role: 'Driver', cost: 10, theme: 'f1', img: '🏎️', credits: 7.5, team: 'Alpine', playerType: 'DRV', rating: 7.2, selectedByPct: 30 },
    { name: 'Yuki Tsunoda', role: 'Driver', cost: 8, theme: 'f1', img: '🏎️', credits: 7.0, team: 'RB', playerType: 'DRV', rating: 7.0, selectedByPct: 22 },
    { name: 'Nico Hulkenberg', role: 'Driver', cost: 9, theme: 'f1', img: '🏎️', credits: 7.0, team: 'Sauber', playerType: 'DRV', rating: 7.0, selectedByPct: 18 },
  ];

  // ========================
  // PLAYERS — HACKATHON (12 participants)
  // ========================
  const hackathonPlayers = [
    { name: 'Sarah Chen', role: 'Fullstack Dev', cost: 14, theme: 'hackathon', img: '💻', credits: 9.0, team: 'Team Alpha', playerType: 'DEV', rating: 8.5, selectedByPct: 65 },
    { name: 'Code Ninja', role: 'AI Engineer', cost: 15, theme: 'hackathon', img: '🤖', credits: 9.5, team: 'Team Alpha', playerType: 'DEV', rating: 9.0, selectedByPct: 72 },
    { name: 'Priya Sharma', role: 'UI/UX Designer', cost: 12, theme: 'hackathon', img: '🎨', credits: 8.5, team: 'Team Alpha', playerType: 'DES', rating: 8.0, selectedByPct: 55 },
    { name: 'Alex Turner', role: 'Backend Dev', cost: 11, theme: 'hackathon', img: '⚙️', credits: 8.0, team: 'Team Alpha', playerType: 'DEV', rating: 7.5, selectedByPct: 45 },
    { name: 'Maya Patel', role: 'Data Scientist', cost: 13, theme: 'hackathon', img: '📊', credits: 8.5, team: 'Team Alpha', playerType: 'DEV', rating: 8.2, selectedByPct: 58 },
    { name: 'Ryan Kim', role: 'DevOps', cost: 10, theme: 'hackathon', img: '🔧', credits: 7.5, team: 'Team Alpha', playerType: 'DEV', rating: 7.0, selectedByPct: 35 },
    { name: 'Zara Ahmed', role: 'Mobile Dev', cost: 12, theme: 'hackathon', img: '📱', credits: 8.0, team: 'Team Beta', playerType: 'DEV', rating: 7.8, selectedByPct: 48 },
    { name: 'Leo Zhang', role: 'ML Engineer', cost: 14, theme: 'hackathon', img: '🧠', credits: 9.0, team: 'Team Beta', playerType: 'DEV', rating: 8.5, selectedByPct: 62 },
    { name: 'Emma Wilson', role: 'Frontend Dev', cost: 11, theme: 'hackathon', img: '🌐', credits: 8.0, team: 'Team Beta', playerType: 'DEV', rating: 7.5, selectedByPct: 42 },
    { name: 'Arjun Verma', role: 'Blockchain Dev', cost: 10, theme: 'hackathon', img: '⛓️', credits: 7.5, team: 'Team Beta', playerType: 'DEV', rating: 7.2, selectedByPct: 30 },
    { name: 'Sofia Garcia', role: 'QA Engineer', cost: 8, theme: 'hackathon', img: '🔍', credits: 7.0, team: 'Team Beta', playerType: 'DEV', rating: 6.8, selectedByPct: 22 },
    { name: 'Kai Nakamura', role: 'Security Expert', cost: 9, theme: 'hackathon', img: '🛡️', credits: 7.5, team: 'Team Beta', playerType: 'DEV', rating: 7.0, selectedByPct: 28 },
  ];

  const allPlayers = [...cricketPlayers, ...footballPlayers, ...f1Players, ...hackathonPlayers];
  for (const p of allPlayers) {
    await prisma.player.create({ data: p });
  }
  console.log(`✅ Created ${allPlayers.length} players`);

  // ========================
  // MATCHES
  // ========================
  const matches = [
    { title: 'CSK vs RCB', sport: 'cricket', teamA: 'CSK', teamB: 'RCB', teamALogo: '💛', teamBLogo: '❤️', venue: 'M.A. Chidambaram Stadium, Chennai', matchTime: 'Apr 25, 2026 • 7:30 PM', deadline: 'Apr 25, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹25,000', contestCount: 4 },
    { title: 'MI vs DC', sport: 'cricket', teamA: 'MI', teamB: 'DC', teamALogo: '💙', teamBLogo: '🔵', venue: 'Wankhede Stadium, Mumbai', matchTime: 'Apr 26, 2026 • 7:30 PM', deadline: 'Apr 26, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹20,000', contestCount: 3 },
    { title: 'Man City vs Liverpool', sport: 'football', teamA: 'Man City', teamB: 'Liverpool', teamALogo: '🩵', teamBLogo: '🔴', venue: 'Etihad Stadium, Manchester', matchTime: 'Apr 27, 2026 • 10:00 PM', deadline: 'Apr 27, 2026 • 9:30 PM', status: 'UPCOMING', prize: '₹15,000', contestCount: 3 },
    { title: 'Monaco Grand Prix', sport: 'f1', teamA: 'Grid A', teamB: 'Grid B', teamALogo: '🏁', teamBLogo: '🏎️', venue: 'Circuit de Monaco', matchTime: 'Apr 28, 2026 • 6:30 PM', deadline: 'Apr 28, 2026 • 6:00 PM', status: 'UPCOMING', prize: '₹30,000', contestCount: 3 },
    { title: 'TechNova Hackathon', sport: 'hackathon', teamA: 'Team Alpha', teamB: 'Team Beta', teamALogo: '🚀', teamBLogo: '⚡', venue: 'IIIT Nagpur Campus', matchTime: 'Live Now', deadline: 'Started', status: 'LIVE', prize: '₹10,000', contestCount: 2 },
    { title: 'RR vs KKR', sport: 'cricket', teamA: 'RR', teamB: 'KKR', teamALogo: '💗', teamBLogo: '💜', venue: 'Sawai Mansingh Stadium, Jaipur', matchTime: 'Apr 29, 2026 • 7:30 PM', deadline: 'Apr 29, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹18,000', contestCount: 3 },
    { title: 'India vs Australia', sport: 'cricket', teamA: 'IND', teamB: 'AUS', teamALogo: '🇮🇳', teamBLogo: '🇦🇺', venue: 'SCG, Sydney', matchTime: 'Apr 30, 2026 • 9:30 AM', deadline: 'Apr 30, 2026 • 9:00 AM', status: 'UPCOMING', prize: '₹50,000', contestCount: 5 },
  ];

  for (const m of matches) {
    const match = await prisma.match.create({ data: m });
    // Create contests for each match
    const contests = [
      { matchId: match.id, name: 'Mega Contest', entryFee: 49, prizePool: m.prize, maxEntries: 1000, spotsLeft: 847, contestType: 'mega' },
      { matchId: match.id, name: 'Head to Head', entryFee: 25, prizePool: '₹45', maxEntries: 2, spotsLeft: 1, contestType: 'h2h' },
      { matchId: match.id, name: 'Practice Match', entryFee: 0, prizePool: 'FREE', maxEntries: 500, spotsLeft: 312, contestType: 'practice' },
    ];
    if (m.contestCount > 3) {
      contests.push({ matchId: match.id, name: 'Winner Takes All', entryFee: 100, prizePool: '₹10,000', maxEntries: 100, spotsLeft: 67, contestType: 'winner-takes-all' });
    }
    for (const c of contests) {
      await prisma.contest.create({ data: c });
    }
  }
  console.log(`✅ Created ${matches.length} matches with contests`);

  // ========================
  // EVENTS (keep legacy events too)
  // ========================
  const events = [
    { title: 'IPL 2026 — CSK vs RCB', type: 'CRICKET', date: 'Apr 25, 2026 — 19:30', teams: 'Chennai Super Kings vs Royal Challengers', theme: 'cricket', status: 'UPCOMING' },
    { title: 'Premier League — City vs Liverpool', type: 'FOOTBALL', date: 'Apr 27, 2026 — 22:00', teams: 'Manchester City vs Liverpool', theme: 'football', status: 'UPCOMING' },
    { title: 'Monaco Grand Prix 2026', type: 'F1', date: 'Apr 28, 2026 — 18:30', teams: '20 Drivers', theme: 'f1', status: 'UPCOMING' },
    { title: 'TechNova Hackathon', type: 'HACKATHON', date: 'Live Now', teams: '24 Teams', theme: 'hackathon', status: 'LIVE' },
  ];
  for (const e of events) {
    await prisma.event.create({ data: e });
  }
  console.log(`✅ Created ${events.length} events`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
