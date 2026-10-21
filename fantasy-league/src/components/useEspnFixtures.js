import { useEffect, useState } from 'react';
import { fetchFootballFixtures, fetchF1Schedule } from '../data/liveSports';

/**
 * Latest football fixtures straight from ESPN (all major leagues).
 * Auto-refreshes every 60s. `fixtures` is the raw ESPN score shape;
 * callers map it to their card shape. Empty array = ESPN unreachable,
 * use the static calendar fallback.
 */
export function useFootballFixtures({ daysPast = 2, daysAhead = 21, refreshMs = 60000 } = {}) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = () => fetchFootballFixtures({ daysPast, daysAhead })
      .then((f) => { if (mounted) { setFixtures(f); setLastUpdated(new Date()); } })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    load();
    const id = refreshMs ? setInterval(load, refreshMs) : null;
    return () => { mounted = false; if (id) clearInterval(id); };
  }, [daysPast, daysAhead, refreshMs]);

  return { fixtures, loading, lastUpdated, fromEspn: fixtures.length > 0 };
}

/** F1 Grand Prix schedule (event level) from ESPN racing scoreboard. */
export function useF1Schedule({ refreshMs = 300000 } = {}) {
  const [events, setEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = () => fetchF1Schedule()
      .then((e) => { if (mounted) { setEvents(e); setLastUpdated(new Date()); } })
      .catch(() => {});
    load();
    const id = refreshMs ? setInterval(load, refreshMs) : null;
    return () => { mounted = false; if (id) clearInterval(id); };
  }, [refreshMs]);

  return { events, lastUpdated, fromEspn: events.length > 0 };
}

/** Map an ESPN football score to the static MATCHES card shape. */
export function espnToMatch(score) {
  return {
    id: score.id,
    league: score.leagueId || 'pl',
    home: score.home,
    away: score.away,
    date: score.date || new Date().toISOString(),
    venue: score.venue || '',
    round: score.competition || '',
    status: score.statusState === 'post' ? 'completed' : score.statusState === 'in' ? 'live' : 'upcoming',
    statusState: score.statusState,
    statusText: score.statusText,
    homeScore: score.homeScore,
    awayScore: score.awayScore,
    homeLogo: score.homeLogo,
    awayLogo: score.awayLogo,
    featured: score.statusState === 'in',
  };
}
