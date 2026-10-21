// Player stats with faces — season snapshot (updated Oct 2026).
// Faces are BUNDLED by Vite (src/assets/players) so the URL is hashed and
// respects the deploy base path (/1122/, /fofa-arena/, /) automatically —
// this fixes faces failing to load on GitHub Pages. PlayerFace also falls
// back to initials if an image ever fails.
import haalandImg from '../assets/players/erling_haaland.png';
import salahImg from '../assets/players/mohamed_salah.png';
import messiImg from '../assets/players/lionel_messi.png';
import ronaldoImg from '../assets/players/cristiano_ronaldo.png';
import kohliImg from '../assets/players/virat_kohli.png';
import rohitImg from '../assets/players/rohit_sharma.png';
import dhoniImg from '../assets/players/ms_dhoni.png';
import verstappenImg from '../assets/players/max_verstappen.png';
import leclercImg from '../assets/players/charles_leclerc.png';
import hamiltonImg from '../assets/players/lewis_hamilton.png';

export const PLAYER_FACES = {
  haaland: haalandImg, salah: salahImg, messi: messiImg, ronaldo: ronaldoImg,
  Kohli: kohliImg, Rohit: rohitImg, Dhoni: dhoniImg,
  Verstappen: verstappenImg, Leclerc: leclercImg, Hamilton: hamiltonImg,
};
export const face = (_file) => _file; // legacy helper, kept for compatibility

export const PLAYER_STATS = [
  /* ---------------- Football 2026/27 ---------------- */
  { id: 'haaland', sport: 'football', name: 'Erling Haaland', team: 'Manchester City', country: 'Norway', role: 'Striker', img: haalandImg, rating: 9.4,
    stats: { Goals: 11, Assists: 2, 'Shots / game': 4.6, 'Match rating': 8.1 } },
  { id: 'salah', sport: 'football', name: 'Mohamed Salah', team: 'Liverpool', country: 'Egypt', role: 'Right Winger', img: salahImg, rating: 9.1,
    stats: { Goals: 7, Assists: 5, 'Key passes / game': 2.8, 'Match rating': 7.9 } },
  { id: 'messi', sport: 'football', name: 'Lionel Messi', team: 'Inter Miami', country: 'Argentina', role: 'Forward', img: messiImg, rating: 9.6,
    stats: { Goals: 18, Assists: 11, 'Chances created': 64, 'Match rating': 8.6 } },
  { id: 'ronaldo', sport: 'football', name: 'Cristiano Ronaldo', team: 'Al-Nassr', country: 'Portugal', role: 'Striker', img: ronaldoImg, rating: 9.3,
    stats: { Goals: 15, Assists: 3, 'Shots / game': 5.1, 'Match rating': 8.2 } },

  /* ---------------- Cricket 2026 ---------------- */
  { id: 'Kohli', sport: 'cricket', name: 'Virat Kohli', team: 'India / RCB', country: 'India', role: 'Batter', img: kohliImg, rating: 9.8,
    stats: { Runs: 1240, Average: 52.4, 'Strike rate': 138.2, Centuries: 3 } },
  { id: 'Rohit', sport: 'cricket', name: 'Rohit Sharma', team: 'India / MI', country: 'India', role: 'Opener', img: rohitImg, rating: 9.2,
    stats: { Runs: 980, Average: 44.6, 'Strike rate': 142.7, Sixes: 48 } },
  { id: 'Dhoni', sport: 'cricket', name: 'MS Dhoni', team: 'CSK', country: 'India', role: 'Wicket-keeper', img: dhoniImg, rating: 8.9,
    stats: { Runs: 420, 'Strike rate': 156.3, Dismissals: 18, 'Finisher rating': 9.1 } },

  /* ---------------- Formula 1 2026 ---------------- */
  { id: 'Verstappen', sport: 'f1', name: 'Max Verstappen', team: 'Red Bull Racing', country: 'Netherlands', role: 'Driver', img: verstappenImg, rating: 9.7,
    stats: { Wins: 6, Podiums: 12, Poles: 5, Points: 312 } },
  { id: 'Leclerc', sport: 'f1', name: 'Charles Leclerc', team: 'Ferrari', country: 'Monaco', role: 'Driver', img: leclercImg, rating: 9.2,
    stats: { Wins: 3, Podiums: 10, Poles: 4, Points: 268 } },
  { id: 'Hamilton', sport: 'f1', name: 'Lewis Hamilton', team: 'Ferrari', country: 'Great Britain', role: 'Driver', img: hamiltonImg, rating: 9.1,
    stats: { Wins: 2, Podiums: 9, Poles: 2, Points: 244 } },
];

export const STAT_SPORTS = [
  { id: 'all', label: 'All Players' },
  { id: 'football', label: '⚽ Football' },
  { id: 'cricket', label: '🏏 Cricket' },
  { id: 'f1', label: '🏎️ Formula 1' },
];
