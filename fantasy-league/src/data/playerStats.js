// Player stats with faces — season snapshot (updated Oct 2026).
// Faces are local files in /public/players (no hot-link breakage);
// PlayerFace falls back to initials if an image ever fails to load.

const base = import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL : '/';
export const face = (file) => `${base}players/${file}`;

export const PLAYER_STATS = [
  /* ---------------- Football 2026/27 ---------------- */
  { id: 'haaland', sport: 'football', name: 'Erling Haaland', team: 'Manchester City', country: 'Norway', role: 'Striker', img: face('erling_haaland.png'), rating: 9.4,
    stats: { Goals: 11, Assists: 2, 'Shots / game': 4.6, 'Match rating': 8.1 } },
  { id: 'salah', sport: 'football', name: 'Mohamed Salah', team: 'Liverpool', country: 'Egypt', role: 'Right Winger', img: face('mohamed_salah.png'), rating: 9.1,
    stats: { Goals: 7, Assists: 5, 'Key passes / game': 2.8, 'Match rating': 7.9 } },
  { id: 'messi', sport: 'football', name: 'Lionel Messi', team: 'Inter Miami', country: 'Argentina', role: 'Forward', img: face('lionel_messi.png'), rating: 9.6,
    stats: { Goals: 18, Assists: 11, 'Chances created': 64, 'Match rating': 8.6 } },
  { id: 'ronaldo', sport: 'football', name: 'Cristiano Ronaldo', team: 'Al-Nassr', country: 'Portugal', role: 'Striker', img: face('cristiano_ronaldo.png'), rating: 9.3,
    stats: { Goals: 15, Assists: 3, 'Shots / game': 5.1, 'Match rating': 8.2 } },

  /* ---------------- Cricket 2026 ---------------- */
  { id: 'Kohli', sport: 'cricket', name: 'Virat Kohli', team: 'India / RCB', country: 'India', role: 'Batter', img: face('virat_kohli.png'), rating: 9.8,
    stats: { Runs: 1240, Average: 52.4, 'Strike rate': 138.2, Centuries: 3 } },
  { id: 'Rohit', sport: 'cricket', name: 'Rohit Sharma', team: 'India / MI', country: 'India', role: 'Opener', img: face('rohit_sharma.png'), rating: 9.2,
    stats: { Runs: 980, Average: 44.6, 'Strike rate': 142.7, Sixes: 48 } },
  { id: 'Dhoni', sport: 'cricket', name: 'MS Dhoni', team: 'CSK', country: 'India', role: 'Wicket-keeper', img: face('ms_dhoni.png'), rating: 8.9,
    stats: { Runs: 420, 'Strike rate': 156.3, Dismissals: 18, 'Finisher rating': 9.1 } },

  /* ---------------- Formula 1 2026 ---------------- */
  { id: 'Verstappen', sport: 'f1', name: 'Max Verstappen', team: 'Red Bull Racing', country: 'Netherlands', role: 'Driver', img: face('max_verstappen.png'), rating: 9.7,
    stats: { Wins: 6, Podiums: 12, Poles: 5, Points: 312 } },
  { id: 'Leclerc', sport: 'f1', name: 'Charles Leclerc', team: 'Ferrari', country: 'Monaco', role: 'Driver', img: face('charles_leclerc.png'), rating: 9.2,
    stats: { Wins: 3, Podiums: 10, Poles: 4, Points: 268 } },
  { id: 'Hamilton', sport: 'f1', name: 'Lewis Hamilton', team: 'Ferrari', country: 'Great Britain', role: 'Driver', img: face('lewis_hamilton.png'), rating: 9.1,
    stats: { Wins: 2, Podiums: 9, Poles: 2, Points: 244 } },
];

export const STAT_SPORTS = [
  { id: 'all', label: 'All Players' },
  { id: 'football', label: '⚽ Football' },
  { id: 'cricket', label: '🏏 Cricket' },
  { id: 'f1', label: '🏎️ Formula 1' },
];
