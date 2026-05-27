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

  // ==================================
  // CRICKET ROSTERS (15 players/team)
  // ==================================
  const cricketPlayers = [
    // CSK (Chennai Super Kings)
    { name: 'Ruturaj Gaikwad', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Ruturaj_Gaikwad.jpg', credits: 9.5, team: 'CSK', playerType: 'BAT', rating: 9.0, selectedByPct: 81 },
    { name: 'MS Dhoni', role: 'Wicketkeeper', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/7/70/MS_Dhoni_at_the_JSCA_International_Stadium.jpg', credits: 9.0, team: 'CSK', playerType: 'WK', rating: 8.5, selectedByPct: 72 },
    { name: 'Ravindra Jadeja', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ravindra_Jadeja_in_2018.jpg', credits: 9.0, team: 'CSK', playerType: 'AR', rating: 8.8, selectedByPct: 78 },
    { name: 'Shivam Dube', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Shivam_Dube.jpg', credits: 8.5, team: 'CSK', playerType: 'AR', rating: 8.0, selectedByPct: 68 },
    { name: 'Matheesha Pathirana', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Matheesha_Pathirana_2023.jpg', credits: 9.0, team: 'CSK', playerType: 'BOWL', rating: 8.6, selectedByPct: 70 },
    { name: 'Devon Conway', role: 'Wicketkeeper', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Devon_Conway.jpg', credits: 8.5, team: 'CSK', playerType: 'WK', rating: 8.3, selectedByPct: 62 },
    { name: 'Rachin Ravindra', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Rachin_Ravindra.jpg', credits: 8.5, team: 'CSK', playerType: 'AR', rating: 8.0, selectedByPct: 58 },
    { name: 'Ravichandran Ashwin', role: 'All-Rounder', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Ravichandran_Ashwin.jpg', credits: 8.5, team: 'CSK', playerType: 'AR', rating: 8.5, selectedByPct: 75 },
    { name: 'Noor Ahmad', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Noor_Ahmad.jpg', credits: 8.8, team: 'CSK', playerType: 'BOWL', rating: 8.8, selectedByPct: 68 },
    { name: 'Khaleel Ahmed', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Khaleel_Ahmed.jpg', credits: 8.0, team: 'CSK', playerType: 'BOWL', rating: 8.0, selectedByPct: 54 },
    { name: 'Rahul Tripathi', role: 'Batsman', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rahul_Tripathi.jpg', credits: 8.0, team: 'CSK', playerType: 'BAT', rating: 8.0, selectedByPct: 42 },
    { name: 'Sam Curran', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Sam_Curran.jpg', credits: 8.2, team: 'CSK', playerType: 'AR', rating: 8.2, selectedByPct: 60 },
    { name: 'Nathan Ellis', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Nathan_Ellis.jpg', credits: 7.8, team: 'CSK', playerType: 'BOWL', rating: 7.8, selectedByPct: 32 },
    { name: 'Mukesh Choudhary', role: 'Bowler', cost: 10, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Mukesh_Choudhary.jpg', credits: 7.5, team: 'CSK', playerType: 'BOWL', rating: 7.5, selectedByPct: 24 },
    { name: 'Shreyas Gopal', role: 'Bowler', cost: 10, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Shreyas_Gopal.jpg', credits: 7.5, team: 'CSK', playerType: 'BOWL', rating: 7.5, selectedByPct: 18 },

    // RCB (Royal Challengers Bengaluru)
    { name: 'Virat Kohli', role: 'Batsman', cost: 20, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_2015_World_Cup.jpg', credits: 10.0, team: 'RCB', playerType: 'BAT', rating: 9.8, selectedByPct: 94 },
    { name: 'Rajat Patidar', role: 'Batsman', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Rajat_Patidar.jpg', credits: 8.5, team: 'RCB', playerType: 'BAT', rating: 8.2, selectedByPct: 65 },
    { name: 'Liam Livingstone', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Liam_Livingstone_2022.jpg', credits: 9.0, team: 'RCB', playerType: 'AR', rating: 8.5, selectedByPct: 78 },
    { name: 'Phil Salt', role: 'Wicketkeeper', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Phil_Salt_2022.jpg', credits: 9.0, team: 'RCB', playerType: 'WK', rating: 8.8, selectedByPct: 82 },
    { name: 'Jitesh Sharma', role: 'Wicketkeeper', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Jitesh_Sharma.jpg', credits: 8.0, team: 'RCB', playerType: 'WK', rating: 7.6, selectedByPct: 40 },
    { name: 'Krunal Pandya', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Krunal_Pandya.jpg', credits: 8.5, team: 'RCB', playerType: 'AR', rating: 8.0, selectedByPct: 56 },
    { name: 'Josh Hazlewood', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Josh_Hazlewood_in_2022.jpg', credits: 9.0, team: 'RCB', playerType: 'BOWL', rating: 8.7, selectedByPct: 70 },
    { name: 'Yash Dayal', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Yash_Dayal.jpg', credits: 8.0, team: 'RCB', playerType: 'BOWL', rating: 7.8, selectedByPct: 55 },
    { name: 'Rasikh Salam', role: 'Bowler', cost: 10, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rasikh_Salam.jpg', credits: 7.5, team: 'RCB', playerType: 'BOWL', rating: 7.2, selectedByPct: 32 },
    { name: 'Suyash Sharma', role: 'Bowler', cost: 10, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Suyash_Sharma.jpg', credits: 7.5, team: 'RCB', playerType: 'BOWL', rating: 7.4, selectedByPct: 35 },
    { name: 'Swapnil Singh', role: 'All-Rounder', cost: 10, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Swapnil_Singh.jpg', credits: 7.5, team: 'RCB', playerType: 'AR', rating: 7.1, selectedByPct: 30 },
    { name: 'Devdutt Padikkal', role: 'Batsman', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Devdutt_Padikkal.jpg', credits: 8.0, team: 'RCB', playerType: 'BAT', rating: 7.4, selectedByPct: 42 },
    { name: 'Manoj Bhandage', role: 'All-Rounder', cost: 8, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Manoj_Bhandage.jpg', credits: 7.0, team: 'RCB', playerType: 'AR', rating: 6.8, selectedByPct: 15 },
    { name: 'Bhuvneshwar Kumar', role: 'Bowler', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Bhuvneshwar_Kumar_in_2018.jpg', credits: 8.5, team: 'RCB', playerType: 'BOWL', rating: 8.4, selectedByPct: 60 },
    { name: 'Tim David', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Tim_David.jpg', credits: 8.2, team: 'RCB', playerType: 'AR', rating: 8.1, selectedByPct: 50 },

    // IND (India National Team)
    { name: 'Rohit Sharma', role: 'Batsman', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Rohit_Sharma_November_2016.jpg', credits: 9.5, team: 'IND', playerType: 'BAT', rating: 9.2, selectedByPct: 88 },
    { name: 'Shubman Gill', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Shubman_Gill_2023.jpg', credits: 9.0, team: 'IND', playerType: 'BAT', rating: 8.6, selectedByPct: 74 },
    { name: 'Yashasvi Jaiswal', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Yashasvi_Jaiswal.jpg', credits: 9.0, team: 'IND', playerType: 'BAT', rating: 9.0, selectedByPct: 80 },
    { name: 'Suryakumar Yadav', role: 'Batsman', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Suryakumar_Yadav_2023.jpg', credits: 9.5, team: 'IND', playerType: 'BAT', rating: 9.4, selectedByPct: 86 },
    { name: 'Hardik Pandya', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Hardik_Pandya.jpg', credits: 9.0, team: 'IND', playerType: 'AR', rating: 8.9, selectedByPct: 79 },
    { name: 'Rishabh Pant', role: 'Wicketkeeper', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Rishabh_Pant.jpg', credits: 9.0, team: 'IND', playerType: 'WK', rating: 8.7, selectedByPct: 75 },
    { name: 'Sanju Samson', role: 'Wicketkeeper', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Sanju.Samson.jpg', credits: 8.5, team: 'IND', playerType: 'WK', rating: 8.2, selectedByPct: 58 },
    { name: 'Jasprit Bumrah', role: 'Bowler', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Jasprit_Bumrah_training_session.jpg', credits: 10.0, team: 'IND', playerType: 'BOWL', rating: 9.9, selectedByPct: 96 },
    { name: 'Mohammed Siraj', role: 'Bowler', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mohammed.siraj.jpg', credits: 8.5, team: 'IND', playerType: 'BOWL', rating: 8.0, selectedByPct: 62 },
    { name: 'Kuldeep Yadav', role: 'Bowler', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Kuldeep_Yadav.jpg', credits: 8.5, team: 'IND', playerType: 'BOWL', rating: 8.6, selectedByPct: 68 },
    { name: 'Axar Patel', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Axar_Patel_2018.jpg', credits: 8.5, team: 'IND', playerType: 'AR', rating: 8.4, selectedByPct: 72 },
    { name: 'Arshdeep Singh', role: 'Bowler', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Arshdeep_Singh.jpg', credits: 8.5, team: 'IND', playerType: 'BOWL', rating: 8.3, selectedByPct: 60 },
    { name: 'Rinku Singh', role: 'Batsman', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rinku_Singh.jpg', credits: 8.0, team: 'IND', playerType: 'BAT', rating: 8.1, selectedByPct: 50 },
    { name: 'Washington Sundar', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Washington_Sundar.jpg', credits: 8.5, team: 'IND', playerType: 'AR', rating: 8.3, selectedByPct: 55 },
    { name: 'Yuzvendra Chahal', role: 'Bowler', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yuzvendra_Chahal_2018.jpg', credits: 8.5, team: 'IND', playerType: 'BOWL', rating: 8.0, selectedByPct: 45 },

    // AUS (Australia National Team)
    { name: 'Travis Head', role: 'Batsman', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Travis_Head_in_2022.jpg', credits: 9.5, team: 'AUS', playerType: 'BAT', rating: 9.2, selectedByPct: 86 },
    { name: 'Mitchell Marsh', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Mitchell_Marsh_in_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'AR', rating: 8.5, selectedByPct: 70 },
    { name: 'Glenn Maxwell', role: 'All-Rounder', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Glenn_Maxwell_SCG_Jan_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'AR', rating: 8.6, selectedByPct: 78 },
    { name: 'Marcus Stoinis', role: 'All-Rounder', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Marcus_Stoinis_in_2022.jpg', credits: 8.5, team: 'AUS', playerType: 'AR', rating: 8.2, selectedByPct: 62 },
    { name: 'Tim David', role: 'Batsman', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Tim_David.jpg', credits: 8.0, team: 'AUS', playerType: 'BAT', rating: 7.8, selectedByPct: 48 },
    { name: 'Jake Fraser-McGurk', role: 'Batsman', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Jake_Fraser-McGurk.jpg', credits: 8.5, team: 'AUS', playerType: 'BAT', rating: 8.4, selectedByPct: 65 },
    { name: 'Josh Inglis', role: 'Wicketkeeper', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Josh_Inglis.jpg', credits: 8.5, team: 'AUS', playerType: 'WK', rating: 8.1, selectedByPct: 52 },
    { name: 'Pat Cummins', role: 'Bowler', cost: 18, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Pat_Cummins_in_2022.jpg', credits: 9.5, team: 'AUS', playerType: 'BOWL', rating: 9.3, selectedByPct: 82 },
    { name: 'Mitchell Starc', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Mitchell_Starc_in_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'BOWL', rating: 8.8, selectedByPct: 72 },
    { name: 'Josh Hazlewood', role: 'Bowler', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Josh_Hazlewood_in_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'BOWL', rating: 8.7, selectedByPct: 68 },
    { name: 'Adam Zampa', role: 'Bowler', cost: 14, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Adam_Zampa_in_2022.jpg', credits: 8.5, team: 'AUS', playerType: 'BOWL', rating: 8.4, selectedByPct: 66 },
    { name: 'Steve Smith', role: 'Batsman', cost: 16, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Steve_Smith_at_SCG_in_2022.jpg', credits: 9.0, team: 'AUS', playerType: 'BAT', rating: 8.5, selectedByPct: 60 },
    { name: 'Cameron Green', role: 'All-Rounder', cost: 15, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Cameron_Green_in_2022.jpg', credits: 8.5, team: 'AUS', playerType: 'AR', rating: 8.2, selectedByPct: 55 },
    { name: 'Nathan Ellis', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Nathan_Ellis.jpg', credits: 8.0, team: 'AUS', playerType: 'BOWL', rating: 7.7, selectedByPct: 30 },
    { name: 'Xavier Bartlett', role: 'Bowler', cost: 12, theme: 'cricket', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Xavier_Bartlett.jpg', credits: 8.0, team: 'AUS', playerType: 'BOWL', rating: 8.0, selectedByPct: 40 }
  ];

  // ===================================
  // FOOTBALL ROSTERS (15 players/team)
  // ===================================
  const footballPlayers = [
    // Manchester City
    { name: 'Erling Haaland', role: 'Forward', cost: 20, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Erling_Haaland_2023.jpg', credits: 10.5, team: 'Man City', playerType: 'FWD', rating: 9.8, selectedByPct: 95 },
    { name: 'Kevin De Bruyne', role: 'Midfielder', cost: 18, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Kevin_De_Bruyne_in_2018.jpg', credits: 10.0, team: 'Man City', playerType: 'MID', rating: 9.5, selectedByPct: 88 },
    { name: 'Phil Foden', role: 'Midfielder', cost: 16, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Phil_Foden_2020.jpg', credits: 9.5, team: 'Man City', playerType: 'MID', rating: 9.0, selectedByPct: 78 },
    { name: 'Bernardo Silva', role: 'Midfielder', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Bernardo_Silva_2018.jpg', credits: 9.0, team: 'Man City', playerType: 'MID', rating: 8.8, selectedByPct: 72 },
    { name: 'Rodri', role: 'Midfielder', cost: 17, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Rodrigo_Hern%C3%A1ndez_Cascante_2022.jpg', credits: 9.5, team: 'Man City', playerType: 'MID', rating: 9.7, selectedByPct: 85 },
    { name: 'Jeremy Doku', role: 'Forward', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/J%C3%A9r%C3%A9my_Doku_2021.jpg', credits: 8.5, team: 'Man City', playerType: 'FWD', rating: 8.1, selectedByPct: 40 },
    { name: 'Savinho', role: 'Forward', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Savinho.jpg', credits: 9.0, team: 'Man City', playerType: 'FWD', rating: 8.7, selectedByPct: 64 },
    { name: 'Ruben Dias', role: 'Defender', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/R%C3%BAben_Dias_2021.jpg', credits: 9.0, team: 'Man City', playerType: 'DEF', rating: 8.5, selectedByPct: 62 },
    { name: 'John Stones', role: 'Defender', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/John_Stones_2018.jpg', credits: 8.5, team: 'Man City', playerType: 'DEF', rating: 8.4, selectedByPct: 50 },
    { name: 'Kyle Walker', role: 'Defender', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Kyle_Walker_2018.jpg', credits: 8.5, team: 'Man City', playerType: 'DEF', rating: 8.3, selectedByPct: 54 },
    { name: 'Josko Gvardiol', role: 'Defender', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Jo%C5%A1ko_Gvardiol_2022.jpg', credits: 9.0, team: 'Man City', playerType: 'DEF', rating: 8.6, selectedByPct: 60 },
    { name: 'Nathan Ake', role: 'Defender', cost: 12, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Nathan_Ak%C3%A9_2018.jpg', credits: 8.0, team: 'Man City', playerType: 'DEF', rating: 8.1, selectedByPct: 42 },
    { name: 'Ederson', role: 'Goalkeeper', cost: 12, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ederson_Moraes_2018.jpg', credits: 8.5, team: 'Man City', playerType: 'GK', rating: 8.0, selectedByPct: 55 },
    { name: 'Stefan Ortega', role: 'Goalkeeper', cost: 10, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Stefan_Ortega.jpg', credits: 7.5, team: 'Man City', playerType: 'GK', rating: 7.9, selectedByPct: 20 },
    { name: 'Mateo Kovacic', role: 'Midfielder', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Mateo_Kova%C4%8Di%C3%A5_2018.jpg', credits: 8.0, team: 'Man City', playerType: 'MID', rating: 8.0, selectedByPct: 38 },

    // Liverpool
    { name: 'Mohamed Salah', role: 'Forward', cost: 19, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Mohamed_Salah_2018.jpg', credits: 10.0, team: 'Liverpool', playerType: 'FWD', rating: 9.5, selectedByPct: 90 },
    { name: 'Luis Diaz', role: 'Forward', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Luis_D%C3%ADaz_%28portrait%29.jpg', credits: 8.5, team: 'Liverpool', playerType: 'FWD', rating: 8.2, selectedByPct: 58 },
    { name: 'Cody Gakpo', role: 'Forward', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Cody_Gakpo_2022.jpg', credits: 8.5, team: 'Liverpool', playerType: 'FWD', rating: 8.3, selectedByPct: 45 },
    { name: 'Diogo Jota', role: 'Forward', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Diogo_Jota_2020.jpg', credits: 9.0, team: 'Liverpool', playerType: 'FWD', rating: 8.5, selectedByPct: 52 },
    { name: 'Alexis Mac Allister', role: 'Midfielder', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Alexis_Mac_Allister_2022.jpg', credits: 9.0, team: 'Liverpool', playerType: 'MID', rating: 8.8, selectedByPct: 76 },
    { name: 'Dominik Szoboszlai', role: 'Midfielder', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Dominik_Szoboszlai_2023.jpg', credits: 9.0, team: 'Liverpool', playerType: 'MID', rating: 8.6, selectedByPct: 70 },
    { name: 'Ryan Gravenberch', role: 'Midfielder', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Ryan_Gravenberch.jpg', credits: 9.0, team: 'Liverpool', playerType: 'MID', rating: 8.9, selectedByPct: 78 },
    { name: 'Curtis Jones', role: 'Midfielder', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Curtis_Jones.jpg', credits: 8.0, team: 'Liverpool', playerType: 'MID', rating: 8.0, selectedByPct: 40 },
    { name: 'Virgil van Dijk', role: 'Defender', cost: 15, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Virgil_van_Dijk_2018.jpg', credits: 9.0, team: 'Liverpool', playerType: 'DEF', rating: 8.8, selectedByPct: 72 },
    { name: 'Trent Alexander-Arnold', role: 'Defender', cost: 14, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Trent_Alexander-Arnold_2021.jpg', credits: 9.0, team: 'Liverpool', playerType: 'DEF', rating: 8.5, selectedByPct: 70 },
    { name: 'Ibrahima Konate', role: 'Defender', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ibrahima_Konat%C3%A9_2021.jpg', credits: 8.5, team: 'Liverpool', playerType: 'DEF', rating: 8.4, selectedByPct: 54 },
    { name: 'Andrew Robertson', role: 'Defender', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Andrew_Robertson_2019.jpg', credits: 8.5, team: 'Liverpool', playerType: 'DEF', rating: 8.2, selectedByPct: 56 },
    { name: 'Joe Gomez', role: 'Defender', cost: 12, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Joe_Gomez_2018.jpg', credits: 8.0, team: 'Liverpool', playerType: 'DEF', rating: 7.9, selectedByPct: 30 },
    { name: 'Alisson Becker', role: 'Goalkeeper', cost: 13, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Alisson_Becker_2018.jpg', credits: 9.0, team: 'Liverpool', playerType: 'GK', rating: 8.8, selectedByPct: 68 },
    { name: 'Caoimhin Kelleher', role: 'Goalkeeper', cost: 11, theme: 'football', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Caoimhin_Kelleher_2022.jpg', credits: 8.0, team: 'Liverpool', playerType: 'GK', rating: 8.2, selectedByPct: 25 }
  ];

  // ===================================
  // FORMULA 1 GRID (Complete 20 drivers)
  // ===================================
  const f1Players = [
    // Red Bull Racing
    { name: 'Max Verstappen', role: 'Driver', cost: 25, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Max_Verstappen_2019_FIA_Prize_Giving_cropped.jpg', credits: 10.5, team: 'Red Bull', playerType: 'DRV', rating: 9.9, selectedByPct: 95 },
    { name: 'Yuki Tsunoda', role: 'Driver', cost: 13, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Yuki_Tsunoda_2023.jpg', credits: 8.0, team: 'Red Bull', playerType: 'DRV', rating: 8.1, selectedByPct: 48 },

    // Scuderia Ferrari
    { name: 'Lewis Hamilton', role: 'Driver', cost: 22, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Lewis_Hamilton_2021_cropped.jpg', credits: 10.0, team: 'Ferrari', playerType: 'DRV', rating: 9.3, selectedByPct: 85 },
    { name: 'Charles Leclerc', role: 'Driver', cost: 20, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Charles_Leclerc_2019.jpg', credits: 9.5, team: 'Ferrari', playerType: 'DRV', rating: 9.1, selectedByPct: 80 },

    // McLaren Formula 1 Team
    { name: 'Lando Norris', role: 'Driver', cost: 20, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Lando_Norris_F1_driver.jpg', credits: 9.5, team: 'McLaren', playerType: 'DRV', rating: 9.2, selectedByPct: 78 },
    { name: 'Oscar Piastri', role: 'Driver', cost: 18, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Oscar_Piastri_2023.jpg', credits: 9.0, team: 'McLaren', playerType: 'DRV', rating: 8.8, selectedByPct: 70 },

    // Mercedes-AMG Petronas
    { name: 'George Russell', role: 'Driver', cost: 16, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/George_Russell_2019.jpg', credits: 9.0, team: 'Mercedes', playerType: 'DRV', rating: 8.5, selectedByPct: 62 },
    { name: 'Kimi Antonelli', role: 'Driver', cost: 12, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Kimi_Antonelli.jpg', credits: 7.5, team: 'Mercedes', playerType: 'DRV', rating: 7.6, selectedByPct: 30 },

    // Aston Martin Cognizant
    { name: 'Fernando Alonso', role: 'Driver', cost: 15, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Fernando_Alonso_2023.jpg', credits: 8.5, team: 'Aston Martin', playerType: 'DRV', rating: 8.2, selectedByPct: 52 },
    { name: 'Lance Stroll', role: 'Driver', cost: 10, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Lance_Stroll_2019.jpg', credits: 7.0, team: 'Aston Martin', playerType: 'DRV', rating: 7.0, selectedByPct: 15 },

    // BWT Alpine F1 Team
    { name: 'Pierre Gasly', role: 'Driver', cost: 13, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Pierre_Gasly_2019.jpg', credits: 8.0, team: 'Alpine', playerType: 'DRV', rating: 7.9, selectedByPct: 40 },
    { name: 'Jack Doohan', role: 'Driver', cost: 10, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Jack_Doohan_2023.jpg', credits: 7.0, team: 'Alpine', playerType: 'DRV', rating: 7.1, selectedByPct: 22 },

    // Williams Racing
    { name: 'Alex Albon', role: 'Driver', cost: 14, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Alexander_Albon_2019.jpg', credits: 8.0, team: 'Williams', playerType: 'DRV', rating: 8.0, selectedByPct: 45 },
    { name: 'Carlos Sainz', role: 'Driver', cost: 16, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Carlos_Sainz_Jr._2019.jpg', credits: 8.5, team: 'Williams', playerType: 'DRV', rating: 8.4, selectedByPct: 58 },

    // MoneyGram Haas F1 Team
    { name: 'Esteban Ocon', role: 'Driver', cost: 13, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Esteban_Ocon_2019.jpg', credits: 8.0, team: 'Haas', playerType: 'DRV', rating: 7.8, selectedByPct: 35 },
    { name: 'Oliver Bearman', role: 'Driver', cost: 11, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Oliver_Bearman_2023.jpg', credits: 7.5, team: 'Haas', playerType: 'DRV', rating: 7.6, selectedByPct: 28 },

    // Stake F1 Team Kick Sauber
    { name: 'Nico Hulkenberg', role: 'Driver', cost: 12, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Nico_H%C3%BClkenberg_2019.jpg', credits: 8.0, team: 'Kick Sauber', playerType: 'DRV', rating: 7.7, selectedByPct: 30 },
    { name: 'Gabriel Bortoleto', role: 'Driver', cost: 10, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Gabriel_Bortoleto.jpg', credits: 7.0, team: 'Kick Sauber', playerType: 'DRV', rating: 7.3, selectedByPct: 25 },

    // Visa Cash App RB
    { name: 'Liam Lawson', role: 'Driver', cost: 12, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Liam_Lawson_2023.jpg', credits: 7.5, team: 'RB', playerType: 'DRV', rating: 7.8, selectedByPct: 38 },
    { name: 'Isack Hadjar', role: 'Driver', cost: 10, theme: 'f1', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Isack_Hadjar.jpg', credits: 7.0, team: 'RB', playerType: 'DRV', rating: 7.2, selectedByPct: 18 }
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
