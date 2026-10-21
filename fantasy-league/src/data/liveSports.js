export const SPORT_CATALOG = [
  {
    id: 'football',
    label: 'Football',
    short: 'FTB',
    shape: 'football',
    color: '#20df7f',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
    sourceLabel: 'ESPN football',
  },
  {
    id: 'basketball',
    label: 'Basketball',
    short: 'BKB',
    shape: 'basketball',
    color: '#ff8a1c',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    sourceLabel: 'ESPN NBA',
  },
  {
    id: 'cricket',
    label: 'Cricket',
    short: 'CRK',
    shape: 'cricket',
    color: '#f2c94c',
    endpoint: '/api/live/cricket',
    sourceLabel: 'Cricket API',
  },
  {
    id: 'f1',
    label: 'Formula 1',
    short: 'F1',
    shape: 'f1',
    color: '#ff314a',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
    sourceLabel: 'ESPN Formula 1',
  },
  {
    id: 'tennis',
    label: 'Tennis',
    short: 'TNS',
    shape: 'tennis',
    color: '#b7f34b',
    endpoint: 'demo',
    sourceLabel: 'Live simulation',
  },
  {
    id: 'baseball',
    label: 'Baseball',
    short: 'MLB',
    shape: 'baseball',
    color: '#4bb7ff',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
    sourceLabel: 'ESPN MLB',
  },
  {
    id: 'hockey',
    label: 'Hockey',
    short: 'HKY',
    shape: 'hockey',
    color: '#9b7bff',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    sourceLabel: 'ESPN NHL',
  },
  {
    id: 'american-football',
    label: 'American Football',
    short: 'NFL',
    shape: 'shield',
    color: '#ff4f86',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    sourceLabel: 'ESPN NFL',
  },
];

const fallbackTeams = {
  football: [
    ['Mumbai Strikers', 'Delhi United'],
    ['FOFA Wolves', 'Nagpur City'],
    ['Goa Tide', 'Chennai Coast'],
  ],
  basketball: [
    ['Raptors', 'Heat'],
    ['Lakers', 'Suns'],
    ['Celtics', 'Warriors'],
  ],
  cricket: [
    ['CSK', 'RCB'],
    ['India', 'Australia'],
    ['MI', 'DC'],
  ],
  f1: [
    ['Verstappen', 'Norris'],
    ['Leclerc', 'Hamilton'],
    ['Piastri', 'Russell'],
  ],
  tennis: [
    ['Alcaraz', 'Sinner'],
    ['Swiatek', 'Gauff'],
    ['Djokovic', 'Medvedev'],
  ],
  baseball: [
    ['Yankees', 'Mets'],
    ['Dodgers', 'Giants'],
    ['Cubs', 'Cardinals'],
  ],
  hockey: [
    ['Rangers', 'Bruins'],
    ['Maple Leafs', 'Canadiens'],
    ['Oilers', 'Jets'],
  ],
  'american-football': [
    ['Chiefs', 'Bills'],
    ['Cowboys', 'Eagles'],
    ['49ers', 'Rams'],
  ],
};

const statusCycle = ['in', 'pre', 'post'];

export function getSportById(id) {
  return SPORT_CATALOG.find((sport) => sport.id === id) || SPORT_CATALOG[0];
}

export function getPlayableSports() {
  return SPORT_CATALOG;
}

export function getScoreSummary(score) {
  if (!score) return '-';
  if (score.scoreText) return score.scoreText;
  return `${score.homeScore ?? '-'} - ${score.awayScore ?? '-'}`;
}

export function getStatusLabel(state) {
  if (state === 'in') return 'Live';
  if (state === 'post') return 'Final';
  return 'Upcoming';
}

function seededNumber(seed, max, offset = 0) {
  const bucket = Math.floor(Date.now() / 30000);
  return Math.abs((seed * 37 + bucket * 11 + offset * 17) % max);
}

function makeFallbackScores(sport) {
  const pairs = fallbackTeams[sport.id] || fallbackTeams.football;
  return pairs.map(([home, away], index) => {
    const state = statusCycle[(index + seededNumber(index + sport.id.length, 3)) % 3];
    const homeScore = state === 'pre' ? '-' : seededNumber(index + 1, sport.id === 'basketball' ? 120 : 7, 2);
    const awayScore = state === 'pre' ? '-' : seededNumber(index + 3, sport.id === 'basketball' ? 120 : 7, 5);

    return {
      id: `${sport.id}-fallback-${index}`,
      sportId: sport.id,
      sportLabel: sport.label,
      source: 'demo',
      competition: sport.label === 'Formula 1' ? 'Grand Prix Standings' : `${sport.label} Arena`,
      home,
      away,
      homeScore,
      awayScore,
      scoreText: sport.id === 'f1' && state !== 'pre' ? `P${index + 1} vs P${index + 2}` : null,
      venue: ['Central Arena', 'Floodlight Dome', 'City Sports Park'][index % 3],
      statusState: state,
      statusText: state === 'in' ? `Live ${48 + seededNumber(index, 35)}'` : state === 'post' ? 'Final' : 'Starts soon',
      clock: state === 'in' ? `${48 + seededNumber(index, 35)}'` : '',
      updatedAt: new Date().toISOString(),
      color: sport.color,
    };
  });
}

function parseEspnScoreboard(data, sport) {
  if (!Array.isArray(data?.events)) return [];

  return data.events.map((event) => {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    const home = competitors.find((team) => team.homeAway === 'home') || competitors[0] || {};
    const away = competitors.find((team) => team.homeAway === 'away') || competitors[1] || {};
    const status = competition?.status?.type || event.status?.type || {};

    return {
      id: `${sport.id}-${event.id}`,
      sportId: sport.id,
      sportLabel: sport.label,
      source: 'live',
      competition: event.league?.name || competition?.league?.name || sport.label,
      home: home.team?.shortDisplayName || home.team?.displayName || 'Home',
      away: away.team?.shortDisplayName || away.team?.displayName || 'Away',
      homeLogo: home.team?.logo || '',
      awayLogo: away.team?.logo || '',
      homeScore: home.score || (status.state === 'pre' ? '-' : '0'),
      awayScore: away.score || (status.state === 'pre' ? '-' : '0'),
      venue: competition?.venue?.fullName || '',
      statusState: status.state || 'pre',
      statusText: status.shortDetail || status.detail || 'Scheduled',
      clock: competition?.status?.displayClock || '',
      date: event.date || '',
      updatedAt: new Date().toISOString(),
      color: sport.color,
    };
  });
}

function parseCricket(data, sport) {
  const matches = Array.isArray(data?.matches) ? data.matches : [];
  return matches.map((match, index) => {
    const teams = match.teams || match.name?.split(' vs ') || ['Team A', 'Team B'];
    const firstScore = match.score?.[0];
    const secondScore = match.score?.[1];
    const state = match.matchEnded ? 'post' : match.matchStarted ? 'in' : 'pre';

    const homeScoreStr = firstScore && firstScore.r !== '-' ? `${firstScore.r}/${firstScore.w}` : '-';
    const awayScoreStr = secondScore && secondScore.r !== '-' ? `${secondScore.r}/${secondScore.w}` : '-';
    let scoreText = null;
    if (firstScore && firstScore.r !== '-' && secondScore && secondScore.r !== '-') {
      scoreText = `${homeScoreStr} vs ${awayScoreStr}`;
    } else if (firstScore && firstScore.r !== '-') {
      scoreText = `${homeScoreStr} (${firstScore.o || '0 ov'})`;
    }

    return {
      id: `${sport.id}-${match.id || index}`,
      sportId: sport.id,
      sportLabel: sport.label,
      source: data.source === 'live' ? 'live' : 'demo',
      competition: match.matchType ? `${match.matchType.toUpperCase()} Cricket` : sport.label,
      home: teams[0] || 'Team A',
      away: teams[1] || 'Team B',
      homeScore: homeScoreStr,
      awayScore: awayScoreStr,
      scoreText,
      venue: match.venue || '',
      statusState: state,
      statusText: match.status || getStatusLabel(state),
      innings: match.score || [],
      updatedAt: new Date().toISOString(),
      color: sport.color,
    };
  });
}

function parseF1(data, sport) {
  if (!Array.isArray(data?.events)) return [];

  return data.events.flatMap((event) => {
    const competitions = event.competitions || [];
    
    return competitions.map((comp) => {
      const status = comp.status?.type || {};
      const date = comp.date || event.date || '';
      
      let state = 'pre';
      if (status.state === 'in') state = 'in';
      else if (status.state === 'post') state = 'post';

      return {
        id: `f1-session-${comp.id}`,
        sportId: sport.id,
        sportLabel: sport.label,
        source: 'live',
        competition: event.name || sport.label,
        home: comp.type?.shortName || comp.type?.name || 'Session',
        away: event.circuit?.fullName || 'Circuit',
        homeScore: comp.type?.abbreviation || comp.type?.shortName || 'GP',
        awayScore: state === 'post' ? 'Finished' : state === 'in' ? 'LIVE' : 'Scheduled',
        scoreText: comp.type?.abbreviation || 'GP',
        venue: event.circuit?.address ? `${event.circuit.address.city || ''}, ${event.circuit.address.country || ''}` : '',
        statusState: state,
        statusText: status.shortDetail || status.detail || 'Scheduled',
        clock: comp.status?.displayClock || '',
        date,
        updatedAt: new Date().toISOString(),
        color: sport.color,
      };
    });
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to fetch ${url}`);
  return response.json();
}

export async function fetchSportScores(sportId) {
  const sport = getSportById(sportId);

  try {
    if (sport.endpoint === 'demo') {
      return {
        sport,
        scores: makeFallbackScores(sport),
        source: 'demo',
        updatedAt: new Date(),
      };
    }

    // Football = every major league from ESPN (not just Premier League)
    if (sport.id === 'football') {
      const fixtures = await fetchFootballFixtures({ daysPast: 2, daysAhead: 21 });
      if (fixtures.length) {
        return { sport, scores: fixtures, source: 'live', updatedAt: new Date() };
      }
    }

    const data = await fetchJson(sport.endpoint);
    let scores = [];

    if (sport.id === 'cricket') scores = parseCricket(data, sport);
    else if (sport.id === 'f1') scores = parseF1(data, sport);
    else scores = parseEspnScoreboard(data, sport);

    if (!scores.length) scores = makeFallbackScores(sport);

    return {
      sport,
      scores,
      source: scores.some((score) => score.source === 'live') ? 'live' : 'demo',
      updatedAt: new Date(),
    };
  } catch {
    return {
      sport,
      scores: makeFallbackScores(sport),
      source: 'demo',
      updatedAt: new Date(),
    };
  }
}

export async function fetchAllScores() {
  const results = await Promise.allSettled(SPORT_CATALOG.map((sport) => fetchSportScores(sport.id)));

  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}

/* ------------------------------------------------------------------
   ALL MATCH FIXTURES FROM ESPN — the single source of truth.
   Football: ESPN scoreboards for every major league, queried with a
   date range (dates=YYYYMMDD-YYYYMMDD) so we get past results, live
   games and upcoming fixtures in one call. F1: ESPN racing scoreboard
   directly (same feed the backend proxy used). Other sports: ESPN
   scoreboards in SPORT_CATALOG. Pages re-poll every 30–60s, so
   fixtures/scores update themselves with zero manual edits.
   Static calendars in footballSchedule/latestCalendars are only an
   offline fallback if ESPN is unreachable.
   ------------------------------------------------------------------ */
export const FOOTBALL_LEAGUES = [
  { slug: 'eng.1', id: 'pl', label: 'Premier League' },
  { slug: 'uefa.champions', id: 'ucl', label: 'Champions League' },
  { slug: 'esp.1', id: 'laliga', label: 'La Liga' },
  { slug: 'ita.1', id: 'seriea', label: 'Serie A' },
  { slug: 'ger.1', id: 'bundesliga', label: 'Bundesliga' },
  { slug: 'fra.1', id: 'ligue1', label: 'Ligue 1' },
  { slug: 'uefa.europa', id: 'uel', label: 'Europa League' },
  { slug: 'por.1', id: 'primeira', label: 'Primeira Liga' },
  { slug: 'ned.1', id: 'eredivisie', label: 'Eredivisie' },
  { slug: 'usa.1', id: 'mls', label: 'MLS' },
];

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');

export const espnDatesRange = (daysPast = 2, daysAhead = 21) =>
  `${ymd(new Date(Date.now() - daysPast * 86400000))}-${ymd(new Date(Date.now() + daysAhead * 86400000))}`;

/** Parse helper exposed for reuse: attach league info to parsed ESPN events. */
function withLeague(scores, league) {
  return scores.map((score) => ({
    ...score,
    leagueSlug: league.slug,
    leagueId: league.id,
    competition: league.label,
  }));
}

/**
 * Latest football fixtures from ESPN across all major leagues.
 * Includes live + upcoming + recent results, sorted live first,
 * then soonest kick-off. Returns [] if ESPN is unreachable (callers
 * fall back to the static calendar snapshot).
 */
export async function fetchFootballFixtures({ daysPast = 2, daysAhead = 21 } = {}) {
  const range = espnDatesRange(daysPast, daysAhead);
  const football = getSportById('football');

  const perLeague = await Promise.allSettled(
    FOOTBALL_LEAGUES.map(async (league) => {
      const data = await fetchJson(
        `${ESPN_BASE}/soccer/${league.slug}/scoreboard?dates=${range}&limit=100`,
      );
      return withLeague(parseEspnScoreboard(data, football), league);
    }),
  );

  const seen = new Set();
  const order = { in: 0, pre: 1, post: 2 };
  return perLeague
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((score) => {
      if (seen.has(score.id)) return false;
      seen.add(score.id);
      return true;
    })
    .sort((a, b) =>
      (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1) ||
      new Date(a.date || 0) - new Date(b.date || 0));
}

/** Backwards-compatible: next-N-days upcoming/live football from ESPN. */
export async function fetchUpcomingFixtures(days = 14) {
  const all = await fetchFootballFixtures({ daysPast: 0, daysAhead: days });
  return all.filter((s) => s.statusState === 'pre' || s.statusState === 'in');
}

/** Latest F1 sessions/races from ESPN's racing scoreboard (direct). */
export async function fetchF1Fixtures() {
  const sport = getSportById('f1');
  try {
    const data = await fetchJson(sport.endpoint);
    const scores = parseF1(data, sport);
    const order = { in: 0, pre: 1, post: 2 };
    return scores.sort((a, b) =>
      (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1) ||
      new Date(a.date || 0) - new Date(b.date || 0));
  } catch {
    return [];
  }
}

/** F1 Grand Prix list (event level) from ESPN, for calendar pages. */
export async function fetchF1Schedule() {
  try {
    const data = await fetchJson(`${ESPN_BASE}/racing/f1/scoreboard`);
    if (!Array.isArray(data?.events)) return [];
    return data.events.map((event) => ({
      id: event.id,
      gp: event.name || 'Grand Prix',
      date: event.date || event.competitions?.[0]?.date || '',
      circuit: event.circuit?.fullName || '',
      venue: event.circuit?.address
        ? `${event.circuit.address.city || ''}, ${event.circuit.address.country || ''}`
        : '',
      sessions: (event.competitions || []).map((c) => ({
        name: c.type?.shortName || c.type?.name || 'Session',
        date: c.date || '',
        state: c.status?.type?.state || 'pre',
      })),
    })).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  } catch {
    return [];
  }
}

/** Live scores + upcoming fixtures merged, live first then soonest. */
export async function fetchLiveAndUpcoming() {
  const [groups, upcoming, f1] = await Promise.allSettled([
    fetchAllScores(), fetchUpcomingFixtures(), fetchF1Fixtures(),
  ]);
  const scores = groups.status === 'fulfilled' ? groups.value.flatMap((g) => g.scores) : [];
  const upcomingScores = upcoming.status === 'fulfilled' ? upcoming.value : [];
  const f1Scores = f1.status === 'fulfilled' ? f1.value : [];

  const byId = new Map();
  [...scores, ...upcomingScores, ...f1Scores].forEach((score) => {
    if (!byId.has(score.id)) byId.set(score.id, score);
  });
  const order = { in: 0, pre: 1, post: 2 };
  return [...byId.values()].sort((a, b) =>
    (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1) ||
    new Date(a.date || 0) - new Date(b.date || 0));
}
