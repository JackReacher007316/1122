// Football match schedule — May to August 2026
// streamUrl points to harborfreight22.com (ColaTV) for live viewing

const STREAM_BASE = 'https://harborfreight22.com';

export const LEAGUES = [
  { id: 'all', label: 'All Matches', color: '#20df7f' },
  { id: 'pl', label: 'Premier League', color: '#3d195b' },
  { id: 'ucl', label: 'Champions League', color: '#0a1929' },
  { id: 'laliga', label: 'La Liga', color: '#ee8707' },
  { id: 'seriea', label: 'Serie A', color: '#024494' },
  { id: 'bundesliga', label: 'Bundesliga', color: '#d20515' },
  { id: 'worldcup', label: 'FIFA World Cup 2026', color: '#56042c' },
  { id: 'copa', label: 'Copa América', color: '#1a3c6e' },
];

export const MATCHES = [
  // ─── PREMIER LEAGUE — Final Matchdays (May 2026) ──────────────────
  { id: 'pl-1', league: 'pl', home: 'Arsenal', away: 'Newcastle', date: '2026-05-09T19:30', venue: 'Emirates Stadium', round: 'MD 36', status: 'upcoming' },
  { id: 'pl-2', league: 'pl', home: 'Liverpool', away: 'Chelsea', date: '2026-05-09T17:00', venue: 'Anfield', round: 'MD 36', status: 'upcoming' },
  { id: 'pl-3', league: 'pl', home: 'Man City', away: 'Tottenham', date: '2026-05-10T16:00', venue: 'Etihad Stadium', round: 'MD 36', status: 'upcoming' },
  { id: 'pl-4', league: 'pl', home: 'Man United', away: 'Aston Villa', date: '2026-05-10T14:00', venue: 'Old Trafford', round: 'MD 36', status: 'upcoming' },
  { id: 'pl-5', league: 'pl', home: 'Brighton', away: 'West Ham', date: '2026-05-10T14:00', venue: 'Amex Stadium', round: 'MD 36', status: 'upcoming' },
  { id: 'pl-6', league: 'pl', home: 'Chelsea', away: 'Arsenal', date: '2026-05-16T19:30', venue: 'Stamford Bridge', round: 'MD 37', status: 'upcoming' },
  { id: 'pl-7', league: 'pl', home: 'Tottenham', away: 'Liverpool', date: '2026-05-16T17:00', venue: 'Tottenham Stadium', round: 'MD 37', status: 'upcoming' },
  { id: 'pl-8', league: 'pl', home: 'Newcastle', away: 'Man City', date: '2026-05-17T16:00', venue: "St James' Park", round: 'MD 37', status: 'upcoming' },
  { id: 'pl-9', league: 'pl', home: 'Aston Villa', away: 'Brighton', date: '2026-05-17T14:00', venue: 'Villa Park', round: 'MD 37', status: 'upcoming' },
  { id: 'pl-10', league: 'pl', home: 'Arsenal', away: 'Man United', date: '2026-05-24T16:00', venue: 'Emirates Stadium', round: 'MD 38 (Final)', status: 'upcoming' },
  { id: 'pl-11', league: 'pl', home: 'Liverpool', away: 'Crystal Palace', date: '2026-05-24T16:00', venue: 'Anfield', round: 'MD 38 (Final)', status: 'upcoming' },
  { id: 'pl-12', league: 'pl', home: 'Man City', away: 'Everton', date: '2026-05-24T16:00', venue: 'Etihad Stadium', round: 'MD 38 (Final)', status: 'upcoming' },
  { id: 'pl-13', league: 'pl', home: 'Chelsea', away: 'Bournemouth', date: '2026-05-24T16:00', venue: 'Stamford Bridge', round: 'MD 38 (Final)', status: 'upcoming' },

  // ─── UEFA CHAMPIONS LEAGUE FINAL ──────────────────────────────────
  { id: 'ucl-1', league: 'ucl', home: 'Paris Saint-Germain', away: 'Arsenal', date: '2026-05-30T20:00', venue: 'Puskás Aréna, Budapest', round: 'FINAL', status: 'upcoming', featured: true },

  // ─── LA LIGA — Final Rounds (May 2026) ────────────────────────────
  { id: 'll-1', league: 'laliga', home: 'Real Madrid', away: 'Barcelona', date: '2026-05-10T20:00', venue: 'Santiago Bernabéu', round: 'MD 35', status: 'upcoming', featured: true },
  { id: 'll-2', league: 'laliga', home: 'Atlético Madrid', away: 'Real Sociedad', date: '2026-05-10T17:30', venue: 'Metropolitano', round: 'MD 35', status: 'upcoming' },
  { id: 'll-3', league: 'laliga', home: 'Barcelona', away: 'Sevilla', date: '2026-05-13T20:00', venue: 'Camp Nou', round: 'MD 36', status: 'upcoming' },
  { id: 'll-4', league: 'laliga', home: 'Real Madrid', away: 'Villarreal', date: '2026-05-17T20:00', venue: 'Santiago Bernabéu', round: 'MD 37', status: 'upcoming' },
  { id: 'll-5', league: 'laliga', home: 'Athletic Bilbao', away: 'Barcelona', date: '2026-05-24T18:00', venue: 'San Mamés', round: 'MD 38 (Final)', status: 'upcoming' },
  { id: 'll-6', league: 'laliga', home: 'Atlético Madrid', away: 'Real Madrid', date: '2026-05-24T18:00', venue: 'Metropolitano', round: 'MD 38 (Final)', status: 'upcoming' },

  // ─── SERIE A — Final Rounds ───────────────────────────────────────
  { id: 'sa-1', league: 'seriea', home: 'Inter Milan', away: 'AC Milan', date: '2026-05-10T19:45', venue: 'San Siro', round: 'MD 36', status: 'upcoming', featured: true },
  { id: 'sa-2', league: 'seriea', home: 'Juventus', away: 'Napoli', date: '2026-05-10T17:00', venue: 'Allianz Stadium', round: 'MD 36', status: 'upcoming' },
  { id: 'sa-3', league: 'seriea', home: 'AC Milan', away: 'Roma', date: '2026-05-17T19:45', venue: 'San Siro', round: 'MD 37', status: 'upcoming' },
  { id: 'sa-4', league: 'seriea', home: 'Napoli', away: 'Inter Milan', date: '2026-05-24T19:45', venue: 'Diego Maradona', round: 'MD 38 (Final)', status: 'upcoming' },

  // ─── BUNDESLIGA — Final Matchday ──────────────────────────────────
  { id: 'bl-1', league: 'bundesliga', home: 'Bayern Munich', away: 'Dortmund', date: '2026-05-09T17:30', venue: 'Allianz Arena', round: 'MD 33', status: 'upcoming', featured: true },
  { id: 'bl-2', league: 'bundesliga', home: 'RB Leipzig', away: 'Leverkusen', date: '2026-05-09T15:30', venue: 'Red Bull Arena', round: 'MD 33', status: 'upcoming' },
  { id: 'bl-3', league: 'bundesliga', home: 'Dortmund', away: 'Bayern Munich', date: '2026-05-16T15:30', venue: 'Signal Iduna Park', round: 'MD 34 (Final)', status: 'upcoming' },
  { id: 'bl-4', league: 'bundesliga', home: 'Leverkusen', away: 'Stuttgart', date: '2026-05-16T15:30', venue: 'BayArena', round: 'MD 34 (Final)', status: 'upcoming' },

  // ─── FIFA WORLD CUP 2026 — Group Stage ────────────────────────────
  { id: 'wc-1', league: 'worldcup', home: 'Mexico', away: 'TBD', date: '2026-06-11T19:00', venue: 'Estadio Azteca, Mexico City', round: 'Opening Match', status: 'upcoming', featured: true },
  { id: 'wc-2', league: 'worldcup', home: 'USA', away: 'TBD', date: '2026-06-12T20:00', venue: 'SoFi Stadium, Los Angeles', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-3', league: 'worldcup', home: 'Canada', away: 'TBD', date: '2026-06-12T17:00', venue: 'BMO Field, Toronto', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-4', league: 'worldcup', home: 'Brazil', away: 'TBD', date: '2026-06-13T20:00', venue: 'MetLife Stadium, New York', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-5', league: 'worldcup', home: 'Argentina', away: 'TBD', date: '2026-06-13T17:00', venue: 'Hard Rock Stadium, Miami', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-6', league: 'worldcup', home: 'France', away: 'TBD', date: '2026-06-14T20:00', venue: 'AT&T Stadium, Dallas', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-7', league: 'worldcup', home: 'Germany', away: 'TBD', date: '2026-06-14T14:00', venue: 'Lincoln Financial Field, Philadelphia', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-8', league: 'worldcup', home: 'England', away: 'TBD', date: '2026-06-15T20:00', venue: 'MetLife Stadium, New York', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-9', league: 'worldcup', home: 'Spain', away: 'TBD', date: '2026-06-15T17:00', venue: 'Mercedes-Benz Stadium, Atlanta', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-10', league: 'worldcup', home: 'Portugal', away: 'TBD', date: '2026-06-16T20:00', venue: 'Gillette Stadium, Boston', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-11', league: 'worldcup', home: 'India', away: 'TBD', date: '2026-06-16T14:00', venue: 'BC Place, Vancouver', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-12', league: 'worldcup', home: 'Italy', away: 'TBD', date: '2026-06-17T20:00', venue: 'Lumen Field, Seattle', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-13', league: 'worldcup', home: 'Netherlands', away: 'TBD', date: '2026-06-17T14:00', venue: 'NRG Stadium, Houston', round: 'Group Stage', status: 'upcoming' },
  { id: 'wc-14', league: 'worldcup', home: 'Japan', away: 'TBD', date: '2026-06-18T20:00', venue: 'Levi\'s Stadium, San Francisco', round: 'Group Stage', status: 'upcoming' },
  // Group stage continues through June 27
  { id: 'wc-15', league: 'worldcup', home: 'Group Stage', away: 'Matches Continue', date: '2026-06-18T00:00', venue: 'Various Venues across USA, Mexico, Canada', round: 'Jun 18–27', status: 'upcoming' },

  // ─── FIFA WORLD CUP 2026 — Knockout Rounds ───────────────────────
  { id: 'wc-r32-1', league: 'worldcup', home: 'Round of 32', away: 'Match 1', date: '2026-06-28T18:00', venue: 'TBD', round: 'Round of 32', status: 'upcoming' },
  { id: 'wc-r32-2', league: 'worldcup', home: 'Round of 32', away: 'Match 2', date: '2026-06-28T21:00', venue: 'TBD', round: 'Round of 32', status: 'upcoming' },
  { id: 'wc-r32-3', league: 'worldcup', home: 'Round of 32', away: 'Matches', date: '2026-06-29T00:00', venue: 'Various Venues', round: 'Jun 28 – Jul 3', status: 'upcoming' },
  { id: 'wc-r16-1', league: 'worldcup', home: 'Round of 16', away: 'Matches', date: '2026-07-04T00:00', venue: 'Various Venues', round: 'Jul 4–7', status: 'upcoming' },
  { id: 'wc-qf', league: 'worldcup', home: 'Quarterfinals', away: '4 Matches', date: '2026-07-09T00:00', venue: 'Various Venues', round: 'Jul 9–11', status: 'upcoming' },
  { id: 'wc-sf', league: 'worldcup', home: 'Semifinals', away: '2 Matches', date: '2026-07-14T00:00', venue: 'TBD', round: 'Jul 14–15', status: 'upcoming', featured: true },
  { id: 'wc-3rd', league: 'worldcup', home: 'Third Place', away: 'Match', date: '2026-07-18T18:00', venue: 'TBD', round: 'Bronze Medal', status: 'upcoming' },
  { id: 'wc-final', league: 'worldcup', home: 'World Cup Final', away: '', date: '2026-07-19T18:00', venue: 'MetLife Stadium, New York/New Jersey', round: 'FINAL', status: 'upcoming', featured: true },

  // ─── PRE-SEASON / August 2026 ─────────────────────────────────────
  { id: 'ps-1', league: 'pl', home: 'Premier League 2026-27', away: 'Season Opener', date: '2026-08-22T15:00', venue: 'Various Venues', round: 'MD 1', status: 'upcoming', featured: true },
  { id: 'ps-2', league: 'laliga', home: 'La Liga 2026-27', away: 'Season Opener', date: '2026-08-15T20:00', venue: 'Various Venues', round: 'MD 1', status: 'upcoming' },
  { id: 'ps-3', league: 'seriea', home: 'Serie A 2026-27', away: 'Season Opener', date: '2026-08-22T18:30', venue: 'Various Venues', round: 'MD 1', status: 'upcoming' },
  { id: 'ps-4', league: 'bundesliga', home: 'Bundesliga 2026-27', away: 'Season Opener', date: '2026-08-14T20:30', venue: 'Various Venues', round: 'MD 1', status: 'upcoming' },
];

export function getStreamUrl() {
  return STREAM_BASE;
}

export function getLeagueById(id) {
  return LEAGUES.find(l => l.id === id) || LEAGUES[0];
}

export function getMatchesByLeague(leagueId) {
  if (leagueId === 'all') return MATCHES;
  return MATCHES.filter(m => m.league === leagueId);
}

export function getFeaturedMatches() {
  return MATCHES.filter(m => m.featured);
}

export function getUpcomingMatches() {
  const now = new Date();
  return MATCHES.filter(m => new Date(m.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
}
