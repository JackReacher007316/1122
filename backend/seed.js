const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing database records for a fresh seed...');
  await prisma.contestEntry.deleteMany({});
  await prisma.contest.deleteMany({});
  await prisma.fantasyTeamMember.deleteMany({});
  await prisma.fantasyTeam.deleteMany({});
  await prisma.performanceLog.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.event.deleteMany({});

  console.log('🏏 Seeding real-life sports data with portrait images...');

  const proxifyLogo = (url) => {
    if (url && url.includes('upload.wikimedia.org')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // ========================
  // PLAYERS — CRICKET
  // ========================
  const cricketPlayers = [
    // CSK Players
    { name: 'MS Dhoni', role: 'Wicketkeeper', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/7/70/MS_Dhoni_at_the_JSCA_International_Stadium.jpg', credits: 9.0, team: 'CSK', playerType: 'WK', rating: 8.5, selectedByPct: 72 },
    { name: 'Ruturaj Gaikwad', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Ruturaj_Gaikwad.jpg', credits: 9.5, team: 'CSK', playerType: 'BAT', rating: 9.0, selectedByPct: 81 },
    { name: 'Daryl Mitchell', role: 'Batsman', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Daryl_Mitchell_in_2022.jpg', credits: 8.5, team: 'CSK', playerType: 'BAT', rating: 8.2, selectedByPct: 60 },
    { name: 'Shivam Dube', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Shivam_Dube.jpg', credits: 8.5, team: 'CSK', playerType: 'AR', rating: 8.0, selectedByPct: 68 },
    { name: 'Ravindra Jadeja', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ravindra_Jadeja_in_2018.jpg', credits: 9.0, team: 'CSK', playerType: 'AR', rating: 8.8, selectedByPct: 78 },
    { name: 'Moeen Ali', role: 'All-Rounder', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Moeen_Ali_Worcestershire_Cricket.jpg', credits: 8.0, team: 'CSK', playerType: 'AR', rating: 7.2, selectedByPct: 45 },
    { name: 'Deepak Chahar', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Deepak_Chahar_bowling.jpg', credits: 8.0, team: 'CSK', playerType: 'BOWL', rating: 7.5, selectedByPct: 52 },
    { name: 'Tushar Deshpande', role: 'Bowler', cost: 10, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Tushar_Deshpande.jpg', credits: 7.5, team: 'CSK', playerType: 'BOWL', rating: 7.0, selectedByPct: 38 },
    { name: 'Shardul Thakur', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Shardul_Thakur_in_2018.jpg', credits: 8.0, team: 'CSK', playerType: 'BOWL', rating: 7.4, selectedByPct: 50 },
    { name: 'Rachin Ravindra', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Rachin_Ravindra.jpg', credits: 8.5, team: 'CSK', playerType: 'AR', rating: 8.0, selectedByPct: 58 },
    
    // RCB Players
    { name: 'Virat Kohli', role: 'Batsman', cost: 20, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_2015_World_Cup.jpg', credits: 10.0, team: 'RCB', playerType: 'BAT', rating: 9.8, selectedByPct: 94 },
    { name: 'Faf du Plessis', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Faf_du_Plessis_2019_Boxing_Day.jpg', credits: 9.0, team: 'RCB', playerType: 'BAT', rating: 8.5, selectedByPct: 70 },
    { name: 'Glenn Maxwell', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Glenn_Maxwell_SCG_Jan_2022.jpg', credits: 9.0, team: 'RCB', playerType: 'AR', rating: 8.0, selectedByPct: 62 },
    { name: 'Cameron Green', role: 'All-Rounder', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Cameron_Green_in_2022.jpg', credits: 8.5, team: 'RCB', playerType: 'AR', rating: 8.2, selectedByPct: 55 },
    { name: 'Dinesh Karthik', role: 'Wicketkeeper', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/DineshKarthik.jpg', credits: 8.5, team: 'RCB', playerType: 'WK', rating: 8.0, selectedByPct: 50 },
    { name: 'Mohammed Siraj', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mohammed.siraj.jpg', credits: 9.0, team: 'RCB', playerType: 'BOWL', rating: 8.4, selectedByPct: 65 },
    
    // IND Players
    { name: 'Rohit Sharma', role: 'Batsman', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Rohit_Sharma_November_2016.jpg', credits: 9.5, team: 'IND', playerType: 'BAT', rating: 9.0, selectedByPct: 82 },
    { name: 'Shubman Gill', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Shubman_Gill_2023.jpg', credits: 9.0, team: 'IND', playerType: 'BAT', rating: 8.6, selectedByPct: 74 },
    { name: 'Hardik Pandya', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Hardik_Pandya.jpg', credits: 9.0, team: 'IND', playerType: 'AR', rating: 8.7, selectedByPct: 76 },
    { name: 'Jasprit Bumrah', role: 'Bowler', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Jasprit_Bumrah_training_session.jpg', credits: 9.5, team: 'IND', playerType: 'BOWL', rating: 9.8, selectedByPct: 92 },
    { name: 'KL Rahul', role: 'Wicketkeeper', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/KL_Rahul_at_Femina_Miss_India_2018_Grand_Finale_%28cropped%29.jpg', credits: 9.0, team: 'IND', playerType: 'WK', rating: 8.5, selectedByPct: 68 },
    { name: 'Sanju Samson', role: 'Wicketkeeper', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Sanju.Samson.jpg', credits: 8.5, team: 'IND', playerType: 'WK', rating: 8.2, selectedByPct: 58 },
    
    // AUS Players
    { name: 'Travis Head', role: 'Batsman', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Travis_Head_in_2022.jpg', credits: 9.5, team: 'AUS', playerType: 'BAT', rating: 9.2, selectedByPct: 86 },
    { name: 'Steve Smith', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Steve_Smith_at_SCG_in_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'BAT', rating: 8.5, selectedByPct: 64 },
    { name: 'Pat Cummins', role: 'Bowler', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Pat_Cummins_in_2022.jpg', credits: 9.5, team: 'AUS', playerType: 'BOWL', rating: 9.3, selectedByPct: 82 },
    { name: 'Mitchell Starc', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Mitchell_Starc_in_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'BOWL', rating: 8.8, selectedByPct: 72 },
    { name: 'Adam Zampa', role: 'Bowler', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Adam_Zampa_in_2022.jpg', credits: 8.5, team: 'AUS', playerType: 'BOWL', rating: 8.4, selectedByPct: 66 }
  ];

  // ========================
  // PLAYERS — FOOTBALL
  // ========================
  const footballPlayers = [
    // Man City
    { name: 'Ederson', role: 'Goalkeeper', cost: 12, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ederson_Moraes_2018.jpg', credits: 8.5, team: 'Man City', playerType: 'GK', rating: 8.0, selectedByPct: 55 },
    { name: 'Ruben Dias', role: 'Defender', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/R%C3%BAben_Dias_2021.jpg', credits: 9.0, team: 'Man City', playerType: 'DEF', rating: 8.5, selectedByPct: 62 },
    { name: 'Kevin De Bruyne', role: 'Midfielder', cost: 18, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Kevin_De_Bruyne_in_2018.jpg', credits: 10.0, team: 'Man City', playerType: 'MID', rating: 9.5, selectedByPct: 88 },
    { name: 'Bernardo Silva', role: 'Midfielder', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Bernardo_Silva_2018.jpg', credits: 9.0, team: 'Man City', playerType: 'MID', rating: 8.8, selectedByPct: 72 },
    { name: 'Phil Foden', role: 'Midfielder', cost: 16, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Phil_Foden_2020.jpg', credits: 9.5, team: 'Man City', playerType: 'MID', rating: 9.0, selectedByPct: 78 },
    { name: 'Erling Haaland', role: 'Forward', cost: 20, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Erling_Haaland_2023.jpg', credits: 10.5, team: 'Man City', playerType: 'FWD', rating: 9.8, selectedByPct: 95 },
    
    // Liverpool
    { name: 'Alisson', role: 'Goalkeeper', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Alisson_Becker_2018.jpg', credits: 9.0, team: 'Liverpool', playerType: 'GK', rating: 8.8, selectedByPct: 68 },
    { name: 'Virgil van Dijk', role: 'Defender', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Virgil_van_Dijk_2018.jpg', credits: 9.0, team: 'Liverpool', playerType: 'DEF', rating: 8.8, selectedByPct: 72 },
    { name: 'Trent Alexander-Arnold', role: 'Defender', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Trent_Alexander-Arnold_2021.jpg', credits: 9.0, team: 'Liverpool', playerType: 'DEF', rating: 8.5, selectedByPct: 70 },
    { name: 'Mohamed Salah', role: 'Forward', cost: 19, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Mohamed_Salah_2018.jpg', credits: 10.0, team: 'Liverpool', playerType: 'FWD', rating: 9.5, selectedByPct: 90 },
    { name: 'Luis Diaz', role: 'Forward', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Luis_D%C3%ADaz_%28portrait%29.jpg', credits: 8.5, team: 'Liverpool', playerType: 'FWD', rating: 8.2, selectedByPct: 58 }
  ];

  // ========================
  // PLAYERS — F1
  // ========================
  const f1Players = [
    { name: 'Max Verstappen', role: 'Driver', cost: 25, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Max_Verstappen_2019_FIA_Prize_Giving_cropped.jpg', credits: 10.5, team: 'Red Bull', playerType: 'DRV', rating: 9.8, selectedByPct: 92 },
    { name: 'Sergio Perez', role: 'Driver', cost: 14, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Sergio_P%C3%A9rez_2019.jpg', credits: 8.0, team: 'Red Bull', playerType: 'DRV', rating: 7.5, selectedByPct: 45 },
    { name: 'Lewis Hamilton', role: 'Driver', cost: 22, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Lewis_Hamilton_2021_cropped.jpg', credits: 10.0, team: 'Ferrari', playerType: 'DRV', rating: 9.2, selectedByPct: 82 },
    { name: 'Charles Leclerc', role: 'Driver', cost: 20, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Charles_Leclerc_2019.jpg', credits: 9.5, team: 'Ferrari', playerType: 'DRV', rating: 9.0, selectedByPct: 78 },
    { name: 'Lando Norris', role: 'Driver', cost: 18, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Lando_Norris_F1_driver.jpg', credits: 9.5, team: 'McLaren', playerType: 'DRV', rating: 9.0, selectedByPct: 75 },
    { name: 'Oscar Piastri', role: 'Driver', cost: 16, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Oscar_Piastri_2023.jpg', credits: 9.0, team: 'McLaren', playerType: 'DRV', rating: 8.5, selectedByPct: 65 },
    { name: 'Carlos Sainz', role: 'Driver', cost: 15, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Carlos_Sainz_Jr._2019.jpg', credits: 8.5, team: 'Williams', playerType: 'DRV', rating: 8.2, selectedByPct: 55 },
    { name: 'George Russell', role: 'Driver', cost: 16, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/George_Russell_2019.jpg', credits: 9.0, team: 'Mercedes', playerType: 'DRV', rating: 8.5, selectedByPct: 60 },
    { name: 'Fernando Alonso', role: 'Driver', cost: 14, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Fernando_Alonso_2023.jpg', credits: 8.0, team: 'Aston Martin', playerType: 'DRV', rating: 8.0, selectedByPct: 48 }
  ];

  const allPlayers = [...cricketPlayers, ...footballPlayers, ...f1Players].map(p => ({
    ...p,
    img: proxifyLogo(p.img)
  }));
  for (const p of allPlayers) {
    await prisma.player.create({ data: p });
  }
  console.log(`✅ Created ${allPlayers.length} players`);

  // ========================
  // MATCHES
  // ========================
  const matches = [
    { title: 'IPL Round 1: CSK vs RCB', sport: 'cricket', teamA: 'CSK', teamB: 'RCB', teamALogo: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Royal_Challengers_Bengaluru_Logo.png', venue: 'M.A. Chidambaram Stadium, Chennai', matchTime: 'Jan 15, 2026 • 7:30 PM', deadline: 'Jan 15, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹25,000', contestCount: 4 },
    { title: 'BGT Round 2: AUS vs IND (1st Test)', sport: 'cricket', teamA: 'AUS', teamB: 'IND', teamALogo: 'https://upload.wikimedia.org/wikipedia/en/3/36/Cricket_Australia_logo.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Indian_Cricket_Board_Logo.svg', venue: 'SCG, Sydney', matchTime: 'Jan 29, 2026 • 9:30 AM', deadline: 'Jan 29, 2026 • 9:00 AM', status: 'UPCOMING', prize: '₹50,000', contestCount: 5 },
    { title: 'IPL Round 3: RCB vs CSK', sport: 'cricket', teamA: 'RCB', teamB: 'CSK', teamALogo: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Royal_Challengers_Bengaluru_Logo.png', teamBLogo: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg', venue: 'M. Chinnaswamy Stadium, Bengaluru', matchTime: 'Feb 12, 2026 • 7:30 PM', deadline: 'Feb 12, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹25,000', contestCount: 3 },
    { title: 'T20 Cup Round 4: IND vs AUS', sport: 'cricket', teamA: 'IND', teamB: 'AUS', teamALogo: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Indian_Cricket_Board_Logo.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/en/3/36/Cricket_Australia_logo.svg', venue: 'Narendra Modi Stadium, Ahmedabad', matchTime: 'Feb 26, 2026 • 7:30 PM', deadline: 'Feb 26, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹35,000', contestCount: 4 },
    
    // Football Season Matches (38 rounds)
    ...Array.from({ length: 38 }, (_, i) => {
      const round = i + 1;
      const startDate = new Date('2026-01-18T22:00:00');
      startDate.setDate(startDate.getDate() + i * 14);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[startDate.getMonth()];
      const dayStr = String(startDate.getDate()).padStart(2, '0');
      const year = startDate.getFullYear();
      const matchTime = `${monthStr} ${dayStr}, ${year} • 10:00 PM`;
      const deadline = `${monthStr} ${dayStr}, ${year} • 9:30 PM`;
      const isManCityHome = round % 2 !== 0;
      return {
        title: isManCityHome ? `Premier League Round ${round}: Man City vs Liverpool` : `Premier League Round ${round}: Liverpool vs Man City`,
        sport: 'football',
        teamA: isManCityHome ? 'Man City' : 'Liverpool',
        teamB: isManCityHome ? 'Liverpool' : 'Man City',
        teamALogo: isManCityHome ? 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg' : 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
        teamBLogo: isManCityHome ? 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg' : 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        venue: isManCityHome ? 'Etihad Stadium, Manchester' : 'Anfield, Liverpool',
        matchTime,
        deadline,
        status: 'UPCOMING',
        prize: '₹15,000',
        contestCount: 3
      };
    }),
    
    // F1 2026 Calendar Races (22 rounds)
    { title: 'Australian Grand Prix', sport: 'f1', teamA: 'Grid A', teamB: 'Grid B', teamALogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', venue: 'Albert Park Circuit, Melbourne', matchTime: 'Mar 6, 2026 • 12:00 PM', deadline: 'Mar 6, 2026 • 11:30 AM', status: 'UPCOMING', prize: '₹30,000', contestCount: 3 },
    { title: 'Chinese Grand Prix', sport: 'f1', teamA: 'Grid A', teamB: 'Grid B', teamALogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', venue: 'Shanghai International Circuit, Shanghai', matchTime: 'Mar 13, 2026 • 11:00 AM', deadline: 'Mar 13, 2026 • 10:30 AM', status: 'UPCOMING', prize: '₹30,000', contestCount: 3 },
    { title: 'Japanese Grand Prix', sport: 'f1', teamA: 'Grid A', teamB: 'Grid B', teamALogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', venue: 'Suzuka Circuit, Suzuka', matchTime: 'Mar 27, 2026 • 11:00 AM', deadline: 'Mar 27, 2026 • 10:30 AM', status: 'UPCOMING', prize: '₹30,000', contestCount: 3 },
    { title: 'British Grand Prix', sport: 'f1', teamA: 'Grid A', teamB: 'Grid B', teamALogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', venue: 'Silverstone Circuit, Silverstone', matchTime: 'Jul 3, 2026 • 7:30 PM', deadline: 'Jul 3, 2026 • 7:00 PM', status: 'UPCOMING', prize: '₹30,000', contestCount: 3 },
    { title: 'Abu Dhabi Grand Prix', sport: 'f1', teamA: 'Grid A', teamB: 'Grid B', teamALogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', teamBLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg', venue: 'Yas Marina Circuit, Abu Dhabi', matchTime: 'Dec 4, 2026 • 6:30 PM', deadline: 'Dec 4, 2026 • 6:00 PM', status: 'UPCOMING', prize: '₹30,000', contestCount: 3 }
  ];

  for (const m of matches) {
    const match = await prisma.match.create({
      data: {
        ...m,
        teamALogo: proxifyLogo(m.teamALogo),
        teamBLogo: proxifyLogo(m.teamBLogo)
      }
    });
    const contests = [
      { matchId: match.id, name: 'Mega Contest', entryFee: 49, prizePool: m.prize, maxEntries: 1000, spotsLeft: 847, contestType: 'mega' },
      { matchId: match.id, name: 'Head to Head', entryFee: 25, prizePool: '₹45', maxEntries: 2, spotsLeft: 1, contestType: 'h2h' },
      { matchId: match.id, name: 'Practice Match', entryFee: 0, prizePool: 'FREE', maxEntries: 500, spotsLeft: 312, contestType: 'practice' },
    ];
    for (const c of contests) {
      await prisma.contest.create({ data: c });
    }
  }
  console.log(`✅ Created ${matches.length} matches with contests`);

  // ========================
  // EVENTS
  // ========================
  const events = [
    { title: 'IPL 2026 — CSK vs RCB', type: 'CRICKET', date: 'Jan 15, 2026 — 19:30', teams: 'Chennai Super Kings vs Royal Challengers', theme: 'cricket', status: 'UPCOMING' },
    { title: 'BGT 2026 — Australia vs India', type: 'CRICKET', date: 'Jan 29, 2026 — 09:30', teams: 'Australia vs India', theme: 'cricket', status: 'UPCOMING' },
    { title: 'Premier League — Round 1', type: 'FOOTBALL', date: 'Jan 18, 2026 — 22:00', teams: 'Manchester City vs Liverpool', theme: 'football', status: 'UPCOMING' },
    { title: 'Australian Grand Prix 2026', type: 'F1', date: 'Mar 6, 2026 — 12:00', teams: '20 Drivers', theme: 'f1', status: 'UPCOMING' }
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
