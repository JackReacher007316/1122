// Football match schedule — 2026/27 season, Oct–Dec 2026 (updated 21 Oct 2026)
// streamUrl points to harborfreight22.com (ColaTV) for live viewing
// Sportsurge links are centralised in ./sportsurgeLinks.js (re-exported below)

import { getSportsurgeFootballUrl } from './sportsurgeLinks';

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
  // ─── 2026/27 SEASON — Latest fixtures (updated 21 Oct 2026) ─────
  // Premier League MW8–12 · Champions League MD3–5 · La Liga El Clásico
  { id: 'ucl-1', league: 'ucl', home: 'Bayern München', away: 'Arsenal', date: '2026-10-21T20:00', venue: 'Allianz Arena', round: 'MD 3', status: 'upcoming', featured: true },
  { id: 'ucl-2', league: 'ucl', home: 'Real Madrid', away: 'Leipzig', date: '2026-10-21T20:00', venue: 'Bernabéu', round: 'MD 3', status: 'upcoming' },
  { id: 'ucl-3', league: 'ucl', home: 'Inter', away: 'Shakhtar Donetsk', date: '2026-10-21T20:00', venue: 'San Siro', round: 'MD 3', status: 'upcoming' },
  { id: 'pl-1', league: 'pl', home: 'Ipswich Town', away: 'Nottingham Forest', date: '2026-10-23T20:00', venue: 'Portman Road', round: 'MW 8', status: 'upcoming' },
  { id: 'pl-2', league: 'pl', home: 'Aston Villa', away: 'Man City', date: '2026-10-24T12:30', venue: 'Villa Park', round: 'MW 8', status: 'upcoming', featured: true },
  { id: 'pl-3', league: 'pl', home: 'Arsenal', away: 'Everton', date: '2026-10-24T15:00', venue: 'Emirates Stadium', round: 'MW 8', status: 'upcoming' },
  { id: 'pl-4', league: 'pl', home: 'Coventry City', away: 'Fulham', date: '2026-10-24T15:00', venue: 'Coventry Building Society Arena', round: 'MW 8', status: 'upcoming' },
  { id: 'pl-5', league: 'pl', home: 'Chelsea', away: 'Tottenham', date: '2026-10-24T17:30', venue: 'Stamford Bridge', round: 'MW 8', status: 'upcoming', featured: true },
  { id: 'pl-6', league: 'pl', home: 'Crystal Palace', away: 'Newcastle', date: '2026-10-25T15:00', venue: 'Selhurst Park', round: 'MW 8', status: 'upcoming' },
  { id: 'pl-7', league: 'pl', home: 'Liverpool', away: 'Brighton', date: '2026-10-25T15:00', venue: 'Anfield', round: 'MW 8', status: 'upcoming' },
  { id: 'll-1', league: 'laliga', home: 'Barcelona', away: 'Real Madrid', date: '2026-10-25T20:00', venue: 'Camp Nou', round: 'El Clásico · MD 10', status: 'upcoming', featured: true },
  { id: 'pl-8', league: 'pl', home: 'Chelsea', away: 'Man United', date: '2026-10-31T12:30', venue: 'Stamford Bridge', round: 'MW 9', status: 'upcoming', featured: true },
  { id: 'pl-9', league: 'pl', home: 'Man City', away: 'Brighton', date: '2026-10-31T15:00', venue: 'Etihad Stadium', round: 'MW 9', status: 'upcoming' },
  { id: 'pl-10', league: 'pl', home: 'Tottenham', away: 'Crystal Palace', date: '2026-10-31T17:30', venue: 'Tottenham Hotspur Stadium', round: 'MW 9', status: 'upcoming' },
  { id: 'pl-11', league: 'pl', home: 'Liverpool', away: 'Arsenal', date: '2026-11-01T16:30', venue: 'Anfield', round: 'MW 9', status: 'upcoming', featured: true },
  { id: 'pl-12', league: 'pl', home: 'Newcastle', away: 'Everton', date: '2026-11-02T20:00', venue: "St James' Park", round: 'MW 9', status: 'upcoming' },
  { id: 'ucl-4', league: 'ucl', home: 'Barcelona', away: 'Aston Villa', date: '2026-11-03T20:00', venue: 'Camp Nou', round: 'MD 4', status: 'upcoming' },
  { id: 'ucl-5', league: 'ucl', home: 'Atlético de Madrid', away: 'Bayern München', date: '2026-11-03T20:00', venue: 'Metropolitano', round: 'MD 4', status: 'upcoming' },
  { id: 'ucl-6', league: 'ucl', home: 'Fenerbahçe', away: 'Liverpool', date: '2026-11-04T17:45', venue: 'Şükrü Saracoğlu', round: 'MD 4', status: 'upcoming' },
  { id: 'ucl-7', league: 'ucl', home: 'Leipzig', away: 'Manchester City', date: '2026-11-04T20:00', venue: 'Red Bull Arena', round: 'MD 4', status: 'upcoming' },
  { id: 'pl-13', league: 'pl', home: 'Crystal Palace', away: 'Liverpool', date: '2026-11-08T14:00', venue: 'Selhurst Park', round: 'MW 10', status: 'upcoming' },
  { id: 'pl-14', league: 'pl', home: 'Man United', away: 'Aston Villa', date: '2026-11-08T16:30', venue: 'Old Trafford', round: 'MW 10', status: 'upcoming', featured: true },
  { id: 'pl-15', league: 'pl', home: 'Manchester City', away: 'Fulham', date: '2026-11-21T12:30', venue: 'Etihad Stadium', round: 'MW 11', status: 'upcoming' },
  { id: 'pl-16', league: 'pl', home: 'Chelsea', away: 'Leeds United', date: '2026-11-21T15:00', venue: 'Stamford Bridge', round: 'MW 11', status: 'upcoming' },
  { id: 'pl-17', league: 'pl', home: 'Liverpool', away: 'Man United', date: '2026-11-22T16:30', venue: 'Anfield', round: 'MW 11', status: 'upcoming', featured: true },
  { id: 'ucl-8', league: 'ucl', home: 'Arsenal', away: 'Borussia Dortmund', date: '2026-11-24T20:00', venue: 'Emirates Stadium', round: 'MD 5', status: 'upcoming' },
  { id: 'ucl-9', league: 'ucl', home: 'Real Madrid', away: 'PSV Eindhoven', date: '2026-11-24T20:00', venue: 'Bernabéu', round: 'MD 5', status: 'upcoming' },
  { id: 'pl-18', league: 'pl', home: 'Nottingham Forest', away: 'Chelsea', date: '2026-11-27T20:00', venue: 'City Ground', round: 'MW 12', status: 'upcoming' },
  { id: 'pl-19', league: 'pl', home: 'Everton', away: 'Liverpool', date: '2026-11-29T12:00', venue: 'Hill Dickinson Stadium', round: 'MW 12', status: 'upcoming', featured: true },
  { id: 'pl-20', league: 'pl', home: 'Sunderland', away: 'Tottenham', date: '2026-11-29T15:00', venue: 'Stadium of Light', round: 'MW 12', status: 'upcoming' },
];

export function getStreamUrl() {
  return STREAM_BASE;
}

/** Sportsurge link for one football match (hub pre-searched for the teams). */
export function getSportsurgeStreamUrl(match) {
  return getSportsurgeFootballUrl(match);
}

export { getSportsurgeFootballUrl };

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
