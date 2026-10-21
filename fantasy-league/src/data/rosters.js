// Updated team rosters — 2026/27 football, IPL/international cricket, F1 2026 grid.
// `img` = real photo (bundled local face for stars, Wikimedia photo otherwise).
// PlayerFace falls back to initials if any remote photo fails.
import { PLAYER_STATS } from './playerStats';

const localFace = Object.fromEntries(PLAYER_STATS.map((p) => [p.name, p.img]));
const W = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;

export const ROSTERS = [
  /* ---------------- Football ---------------- */
  { team: 'Man City', aliases: ['Manchester City', 'Man City'], sport: 'football', league: 'Premier League', color: '#6cabdd', players: [
    ['Erling Haaland', 'Striker', localFace['Erling Haaland']], ['Phil Foden', 'Midfielder', W('5/53/Phil_Foden_2020.jpg')],
    ['Rodri', 'Midfielder', W('c/c5/Rodrigo_Hern%C3%A1ndez_Cascante_2022.jpg')], ['Jeremy Doku', 'Winger', W('e/ee/J%C3%A9r%C3%A9my_Doku_2021.jpg')],
    ['Ruben Dias', 'Defender', W('b/b3/R%C3%BAben_Dias_2021.jpg')], ['Josko Gvardiol', 'Defender', W('5/5a/Jo%C5%A1ko_Gvardiol_2022.jpg')],
    ['Bernardo Silva', 'Midfielder', W('1/1a/Bernardo_Silva_2018.jpg')], ['Ederson', 'Goalkeeper', W('e/eb/Ederson_Moraes_2018.jpg')],
  ]},
  { team: 'Liverpool', aliases: ['Liverpool'], sport: 'football', league: 'Premier League', color: '#c8102e', players: [
    ['Mohamed Salah', 'Forward', localFace['Mohamed Salah']], ['Florian Wirtz', 'Midfielder', null],
    ['Alexander Isak', 'Striker', null], ['Hugo Ekitike', 'Forward', null],
    ['Alexis Mac Allister', 'Midfielder', W('c/c2/Alexis_Mac_Allister_2022.jpg')], ['Cody Gakpo', 'Forward', W('5/5a/Cody_Gakpo_2022.jpg')],
    ['Virgil van Dijk', 'Defender', null], ['Alisson Becker', 'Goalkeeper', null],
  ]},
  { team: 'Arsenal', aliases: ['Arsenal'], sport: 'football', league: 'Premier League', color: '#ef0107', players: [
    ['Bukayo Saka', 'Winger', null], ['Viktor Gyökeres', 'Striker', null], ['Martin Ødegaard', 'Midfielder', null],
    ['Declan Rice', 'Midfielder', null], ['Eberechi Eze', 'Midfielder', null], ['Gabriel Magalhães', 'Defender', null],
    ['William Saliba', 'Defender', null], ['David Raya', 'Goalkeeper', null],
  ]},
  { team: 'Barcelona', aliases: ['Barcelona', 'FC Barcelona'], sport: 'football', league: 'La Liga', color: '#a50044', players: [
    ['Lamine Yamal', 'Winger', null], ['Robert Lewandowski', 'Striker', null], ['Pedri', 'Midfielder', null],
    ['Frenkie de Jong', 'Midfielder', null], ['Raphinha', 'Winger', null], ['Dani Olmo', 'Midfielder', null],
    ['Pau Cubarsí', 'Defender', null], ['Jules Koundé', 'Defender', null],
  ]},
  { team: 'Real Madrid', aliases: ['Real Madrid'], sport: 'football', league: 'La Liga', color: '#febe10', players: [
    ['Kylian Mbappé', 'Forward', null], ['Vinícius Júnior', 'Winger', null], ['Jude Bellingham', 'Midfielder', null],
    ['Federico Valverde', 'Midfielder', null], ['Trent Alexander-Arnold', 'Defender', null], ['Rodrygo', 'Forward', null],
    ['Antonio Rüdiger', 'Defender', null], ['Thibaut Courtois', 'Goalkeeper', null],
  ]},
  { team: 'Inter Miami', aliases: ['Inter Miami'], sport: 'football', league: 'MLS', color: '#f5b6cd', players: [
    ['Lionel Messi', 'Forward', localFace['Lionel Messi']], ['Luis Suárez', 'Striker', null], ['Sergio Busquets', 'Midfielder', null],
  ]},
  { team: 'Al-Nassr', aliases: ['Al-Nassr'], sport: 'football', league: 'Saudi Pro League', color: '#ffed00', players: [
    ['Cristiano Ronaldo', 'Striker', localFace['Cristiano Ronaldo']], ['Sadio Mané', 'Winger', null],
  ]},

  /* ---------------- Cricket ---------------- */
  { team: 'IND', aliases: ['India', 'IND'], sport: 'cricket', league: 'International', color: '#2563eb', players: [
    ['Virat Kohli', 'Batter', localFace['Virat Kohli']], ['Rohit Sharma', 'Opener', localFace['Rohit Sharma']],
    ['Shubman Gill', 'Batter', W('2/28/Shubman_Gill_2023.jpg')], ['Jasprit Bumrah', 'Bowler', W('d/df/Jasprit_Bumrah_training_session.jpg')],
    ['Hardik Pandya', 'All-Rounder', W('3/30/Hardik_Pandya.jpg')], ['Rishabh Pant', 'Wicket-keeper', W('f/fb/Rishabh_Pant.jpg')],
    ['Suryakumar Yadav', 'Batter', W('5/5a/Suryakumar_Yadav_2023.jpg')], ['Kuldeep Yadav', 'Bowler', W('7/75/Kuldeep_Yadav.jpg')],
  ]},
  { team: 'CSK', aliases: ['Chennai Super Kings', 'CSK'], sport: 'cricket', league: 'IPL 2026', color: '#f9cd05', players: [
    ['MS Dhoni', 'Wicket-keeper', localFace['MS Dhoni']], ['Ruturaj Gaikwad', 'Batter', W('8/87/Ruturaj_Gaikwad.jpg')],
    ['Ravindra Jadeja', 'All-Rounder', W('2/23/Ravindra_Jadeja_in_2018.jpg')], ['Sanju Samson', 'Wicket-keeper', W('e/e0/Sanju.Samson.jpg')],
    ['Shivam Dube', 'All-Rounder', W('e/ee/Shivam_Dube.jpg')], ['Matheesha Pathirana', 'Bowler', W('b/ba/Matheesha_Pathirana_2023.jpg')],
  ]},
  { team: 'RCB', aliases: ['Royal Challengers Bengaluru', 'RCB'], sport: 'cricket', league: 'IPL 2026', color: '#ec1c24', players: [
    ['Virat Kohli', 'Batter', localFace['Virat Kohli']], ['Rajat Patidar', 'Batter', W('d/df/Rajat_Patidar.jpg')],
    ['Phil Salt', 'Wicket-keeper', W('c/c8/Phil_Salt_2022.jpg')], ['Krunal Pandya', 'All-Rounder', W('0/02/Krunal_Pandya.jpg')],
    ['Josh Hazlewood', 'Bowler', W('f/ff/Josh_Hazlewood_in_2022.jpg')], ['Tim David', 'All-Rounder', W('b/ba/Tim_David.jpg')],
  ]},
  { team: 'AUS', aliases: ['Australia', 'AUS'], sport: 'cricket', league: 'International', color: '#f5c518', players: [
    ['Travis Head', 'Batter', W('e/e0/Travis_Head_in_2022.jpg')], ['Pat Cummins', 'Bowler', W('5/52/Pat_Cummins_in_2022.jpg')],
    ['Steve Smith', 'Batter', W('d/d4/Steve_Smith_at_SCG_in_2022.jpg')], ['Mitchell Starc', 'Bowler', W('5/54/Mitchell_Starc_in_2022.jpg')],
    ['Glenn Maxwell', 'All-Rounder', W('4/4b/Glenn_Maxwell_SCG_Jan_2022.jpg')], ['Adam Zampa', 'Bowler', W('2/2e/Adam_Zampa_in_2022.jpg')],
  ]},

  /* ---------------- Formula 1 2026 grid ---------------- */
  { team: 'Red Bull', aliases: ['Red Bull Racing', 'Red Bull'], sport: 'f1', league: 'F1 2026', color: '#3671c6', players: [
    ['Max Verstappen', 'Driver', localFace['Max Verstappen']], ['Isack Hadjar', 'Driver', null],
  ]},
  { team: 'Ferrari', aliases: ['Ferrari', 'Scuderia Ferrari'], sport: 'f1', league: 'F1 2026', color: '#e8002d', players: [
    ['Charles Leclerc', 'Driver', localFace['Charles Leclerc']], ['Lewis Hamilton', 'Driver', localFace['Lewis Hamilton']],
  ]},
  { team: 'McLaren', aliases: ['McLaren'], sport: 'f1', league: 'F1 2026', color: '#ff8000', players: [
    ['Lando Norris', 'Driver', W('c/c8/Lando_Norris_F1_driver.jpg')], ['Oscar Piastri', 'Driver', W('6/6c/Oscar_Piastri_2023.jpg')],
  ]},
  { team: 'Mercedes', aliases: ['Mercedes'], sport: 'f1', league: 'F1 2026', color: '#27f4d2', players: [
    ['George Russell', 'Driver', W('a/ae/George_Russell_2019.jpg')], ['Kimi Antonelli', 'Driver', W('e/e0/Kimi_Antonelli.jpg')],
  ]},
  { team: 'Aston Martin', aliases: ['Aston Martin'], sport: 'f1', league: 'F1 2026', color: '#229971', players: [
    ['Fernando Alonso', 'Driver', W('5/55/Fernando_Alonso_2023.jpg')], ['Lance Stroll', 'Driver', W('0/0d/Lance_Stroll_2019.jpg')],
  ]},
  { team: 'Williams', aliases: ['Williams'], sport: 'f1', league: 'F1 2026', color: '#64c4ff', players: [
    ['Alexander Albon', 'Driver', null], ['Carlos Sainz', 'Driver', null],
  ]},
  { team: 'Audi', aliases: ['Audi', 'Kick Sauber'], sport: 'f1', league: 'F1 2026 (new works team)', color: '#bb0a30', players: [
    ['Nico Hülkenberg', 'Driver', null], ['Gabriel Bortoleto', 'Driver', null],
  ]},
  { team: 'Cadillac', aliases: ['Cadillac'], sport: 'f1', league: 'F1 2026 (new team)', color: '#c8a24a', players: [
    ['Sergio Pérez', 'Driver', null], ['Valtteri Bottas', 'Driver', null],
  ]},
].map((r) => ({
  ...r,
  players: r.players.map(([name, role, img]) => ({ name, role, img: img || null })),
}));

const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function getRosterForTeam(teamName) {
  const key = normalize(teamName);
  return ROSTERS.find((r) => [r.team, ...r.aliases].some((a) => {
    const aKey = normalize(a);
    return aKey === key || key.includes(aKey) || aKey.includes(key);
  })) || null;
}

export function getMatchRosters(teamA, teamB, sport) {
  const a = getRosterForTeam(teamA);
  const b = getRosterForTeam(teamB);
  if (a || b) return [a, b].filter(Boolean);
  // Generic fallback: all rosters for that sport, so the roster tab is never empty
  return ROSTERS.filter((r) => r.sport === sport).slice(0, 2);
}
