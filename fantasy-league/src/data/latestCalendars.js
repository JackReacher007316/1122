// Latest calendars — updated 21 Oct 2026.
// Sources are official/league calendars (Formula1.com, Premier League,
// UEFA, BCCI/ESPNcricinfo). This file is the FALLBACK snapshot: the app
// first tries live ESPN feeds (see liveSports.js, auto-refreshing) and
// merges these upcoming fixtures so there are always next matches to show.

export const CALENDAR_UPDATED = '21 Oct 2026';

/* ---------------- Formula 1 ---------------- */
// 2026 season run-in (Rounds 18–23) + full announced 2027 calendar (24 rounds).
export const F1_REMAINING_2026 = [
  { round: 18, gp: 'United States Grand Prix', circuit: 'Circuit of the Americas, Austin', date: '2026-10-25', dateRange: 'Oct 23–25' },
  { round: 19, gp: 'Mexico City Grand Prix', circuit: 'Autódromo Hermanos Rodríguez', date: '2026-11-01', dateRange: 'Oct 30 – Nov 1' },
  { round: 20, gp: 'São Paulo Grand Prix', circuit: 'Interlagos, São Paulo', date: '2026-11-08', dateRange: 'Nov 6–8' },
  { round: 21, gp: 'Las Vegas Grand Prix', circuit: 'Las Vegas Strip Circuit', date: '2026-11-21', dateRange: 'Nov 19–21' },
  { round: 22, gp: 'Qatar Grand Prix', circuit: 'Lusail International Circuit', date: '2026-11-29', dateRange: 'Nov 27–29', sprint: true },
  { round: 23, gp: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', date: '2026-12-06', dateRange: 'Dec 4–6' },
];

export const F1_CALENDAR_2027 = [
  ['Bahrain Grand Prix', '2027-03-14', 'Bahrain International Circuit, Sakhir', true],
  ['Saudi Arabian Grand Prix', '2027-03-21', 'Jeddah Corniche Circuit', false],
  ['Australian Grand Prix', '2027-04-04', 'Albert Park, Melbourne', true],
  ['Japanese Grand Prix', '2027-04-11', 'Suzuka', true],
  ['Chinese Grand Prix', '2027-04-18', 'Shanghai International Circuit', false],
  ['Miami Grand Prix', '2027-05-02', 'Miami International Autodrome', false],
  ['Canadian Grand Prix', '2027-05-23', 'Circuit Gilles Villeneuve, Montreal', true],
  ['Monaco Grand Prix', '2027-06-06', 'Circuit de Monaco', true],
  ['Portuguese Grand Prix', '2027-06-20', 'Algarve (Portimão)', false],
  ['British Grand Prix', '2027-07-04', 'Silverstone', true],
  ['Austrian Grand Prix', '2027-07-11', 'Red Bull Ring, Spielberg', false],
  ['Belgian Grand Prix', '2027-07-25', 'Spa-Francorchamps', false],
  ['Hungarian Grand Prix', '2027-08-01', 'Hungaroring, Budapest', false],
  ['Italian Grand Prix', '2027-09-05', 'Monza', true],
  ['Spanish Grand Prix', '2027-09-12', 'Madrid (Madring)', false],
  ['Azerbaijan Grand Prix', '2027-09-26', 'Baku City Circuit', false],
  ['Turkish Grand Prix', '2027-10-03', 'Istanbul Park', false],
  ['Singapore Grand Prix', '2027-10-10', 'Marina Bay', false],
  ['United States Grand Prix', '2027-10-24', 'Circuit of the Americas, Austin', false],
  ['Mexico City Grand Prix', '2027-10-31', 'Autódromo Hermanos Rodríguez', false],
  ['São Paulo Grand Prix', '2027-11-07', 'Interlagos, São Paulo', true],
  ['Las Vegas Grand Prix', '2027-11-20', 'Las Vegas Strip Circuit', false],
  ['Qatar Grand Prix', '2027-12-05', 'Lusail International Circuit', true],
  ['Abu Dhabi Grand Prix', '2027-12-12', 'Yas Marina Circuit', true],
].map(([gp, date, circuit, sprint], i) => ({ round: i + 1, gp, date, circuit, sprint }));

/* ---------------- Football ---------------- */
// 2026/27 season — next Premier League, Champions League & La Liga fixtures.
export const FOOTBALL_UPCOMING = [
  { league: 'Champions League', home: 'Bayern München', away: 'Arsenal', date: '2026-10-21T20:00', venue: 'Allianz Arena', round: 'MD 3' },
  { league: 'Champions League', home: 'Real Madrid', away: 'Leipzig', date: '2026-10-21T20:00', venue: 'Bernabéu', round: 'MD 3' },
  { league: 'Champions League', home: 'Inter', away: 'Shakhtar Donetsk', date: '2026-10-21T20:00', venue: 'San Siro', round: 'MD 3' },
  { league: 'Premier League', home: 'Ipswich Town', away: 'Nottingham Forest', date: '2026-10-23T20:00', venue: 'Portman Road', round: 'MW 8' },
  { league: 'Premier League', home: 'Aston Villa', away: 'Man City', date: '2026-10-24T12:30', venue: 'Villa Park', round: 'MW 8' },
  { league: 'Premier League', home: 'Arsenal', away: 'Everton', date: '2026-10-24T15:00', venue: 'Emirates Stadium', round: 'MW 8' },
  { league: 'Premier League', home: 'Chelsea', away: 'Tottenham', date: '2026-10-24T17:30', venue: 'Stamford Bridge', round: 'MW 8' },
  { league: 'Premier League', home: 'Liverpool', away: 'Brighton', date: '2026-10-25T15:00', venue: 'Anfield', round: 'MW 8' },
  { league: 'La Liga', home: 'Barcelona', away: 'Real Madrid', date: '2026-10-25T20:00', venue: 'Camp Nou', round: 'El Clásico · MD 10' },
  { league: 'Premier League', home: 'Chelsea', away: 'Man United', date: '2026-10-31T12:30', venue: 'Stamford Bridge', round: 'MW 9' },
  { league: 'Premier League', home: 'Man City', away: 'Brighton', date: '2026-10-31T15:00', venue: 'Etihad Stadium', round: 'MW 9' },
  { league: 'Premier League', home: 'Liverpool', away: 'Arsenal', date: '2026-11-01T16:30', venue: 'Anfield', round: 'MW 9' },
  { league: 'Champions League', home: 'Barcelona', away: 'Aston Villa', date: '2026-11-03T20:00', venue: 'Camp Nou', round: 'MD 4' },
  { league: 'Champions League', home: 'Fenerbahçe', away: 'Liverpool', date: '2026-11-04T17:45', venue: 'Şükrü Saracoğlu', round: 'MD 4' },
  { league: 'Champions League', home: 'Leipzig', away: 'Manchester City', date: '2026-11-04T20:00', venue: 'Red Bull Arena', round: 'MD 4' },
  { league: 'Premier League', home: 'Man United', away: 'Aston Villa', date: '2026-11-08T16:30', venue: 'Old Trafford', round: 'MW 10' },
  { league: 'Premier League', home: 'Manchester City', away: 'Fulham', date: '2026-11-21T12:30', venue: 'Etihad Stadium', round: 'MW 11' },
  { league: 'Premier League', home: 'Liverpool', away: 'Man United', date: '2026-11-22T16:30', venue: 'Anfield', round: 'MW 11' },
  { league: 'Champions League', home: 'Arsenal', away: 'Borussia Dortmund', date: '2026-11-24T20:00', venue: 'Emirates Stadium', round: 'MD 5' },
  { league: 'Champions League', home: 'Real Madrid', away: 'PSV Eindhoven', date: '2026-11-24T20:00', venue: 'Bernabéu', round: 'MD 5' },
  { league: 'Premier League', home: 'Everton', away: 'Liverpool', date: '2026-11-29T12:00', venue: 'Hill Dickinson Stadium', round: 'MW 12' },
];

/* ---------------- Cricket ---------------- */
// India's 2026–27 international calendar (BCCI) + IPL window.
export const CRICKET_UPCOMING = [
  { series: 'India tour of New Zealand', match: 'NZ vs India — T20I Series (5)', format: 'T20I', date: '2026-10-22', dateRange: 'Oct 22 – Nov 1', venue: 'New Zealand' },
  { series: 'India tour of New Zealand', match: 'NZ vs India — ODI Series (5)', format: 'ODI', date: '2026-11-04', dateRange: 'Nov 4–15', venue: 'New Zealand' },
  { series: 'India tour of New Zealand', match: 'NZ vs India — 1st Test', format: 'Test', date: '2026-11-19', dateRange: 'Nov 19–23', venue: 'Basin Reserve, Wellington' },
  { series: 'India tour of New Zealand', match: 'NZ vs India — 2nd Test', format: 'Test', date: '2026-11-27', dateRange: 'Nov 27 – Dec 1', venue: 'Hagley Oval, Christchurch' },
  { series: 'Sri Lanka tour of India', match: 'India vs Sri Lanka — 1st ODI', format: 'ODI', date: '2026-12-13', dateRange: 'Dec 13', venue: 'Arun Jaitley Stadium, Delhi' },
  { series: 'Sri Lanka tour of India', match: 'India vs Sri Lanka — 2nd ODI', format: 'ODI', date: '2026-12-16', dateRange: 'Dec 16', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  { series: 'Sri Lanka tour of India', match: 'India vs Sri Lanka — 3rd ODI', format: 'ODI', date: '2026-12-19', dateRange: 'Dec 19', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { series: 'Sri Lanka tour of India', match: 'India vs Sri Lanka — T20Is (3)', format: 'T20I', date: '2026-12-22', dateRange: 'Dec 22–27 · Rajkot, Cuttack, Pune', venue: 'India' },
  { series: 'Zimbabwe tour of India', match: 'India vs Zimbabwe — ODIs (3)', format: 'ODI', date: '2027-01-03', dateRange: 'Jan 3–9, 2027', venue: 'Kolkata · Hyderabad · Mumbai' },
  { series: 'Australia tour of India', match: 'India vs Australia — Test Series', format: 'Test', date: '2027-01-21', dateRange: 'Jan 21 – Feb, 2027', venue: 'Nagpur & more' },
  { series: 'IPL 2027', match: 'Indian Premier League 2027', format: 'T20', date: '2027-03-01', dateRange: 'Mar – May 2027 (tentative)', venue: 'India' },
];

/* ---------------- Combined next-up list ---------------- */
export function getNextEvents(limit = 12) {
  const now = Date.now();
  const events = [
    ...FOOTBALL_UPCOMING.map((m) => ({
      sport: 'football', sportLabel: 'Football', color: '#20df7f',
      title: `${m.home} vs ${m.away}`, competition: m.league, venue: m.venue,
      date: new Date(m.date).getTime(), dateLabel: new Date(m.date).toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      link: '/live/football',
    })),
    ...F1_REMAINING_2026.map((r) => ({
      sport: 'f1', sportLabel: 'Formula 1', color: '#ff314a',
      title: r.gp, competition: `Round ${r.round}`, venue: r.circuit,
      date: new Date(`${r.date}T19:00`).getTime(), dateLabel: r.dateRange,
      link: '/f1-calendar',
    })),
    ...CRICKET_UPCOMING.map((m) => ({
      sport: 'cricket', sportLabel: 'Cricket', color: '#f2c94c',
      title: m.match, competition: m.series, venue: m.venue,
      date: new Date(`${m.date}T14:00`).getTime(), dateLabel: m.dateRange,
      link: '/cricket-calendar',
    })),
  ]
    .filter((e) => e.date >= now - 24 * 3600 * 1000)
    .sort((a, b) => a.date - b.date);
  return limit ? events.slice(0, limit) : events;
}

export function countdownLabel(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return 'Live / Today';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return d > 0 ? `in ${d}d ${h}h` : h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}
