import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { getNextEvents, countdownLabel, CALENDAR_UPDATED } from '../data/latestCalendars';
import { fetchUpcomingFixtures, getScoreSummary } from '../data/liveSports';

/**
 * Live & Upcoming — keeps itself updated:
 * 1) ESPN next-14-days football fixtures (live fetch), plus
 * 2) the latest F1 / cricket / football calendar snapshot.
 * Re-fetches every 30 seconds; shows last-updated time.
 */
export default function UpcomingFixtures({ limit = 10 }) {
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = () => fetchUpcomingFixtures(14)
      .then((f) => { if (mounted) { setLiveFixtures(f); setLastUpdated(new Date()); } })
      .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const snapshot = getNextEvents(limit);
  const liveByTitle = new Map(liveFixtures.map((f) => [`${f.home} vs ${f.away}`.toLowerCase(), f]));

  return (
    <section>
      <div className="section-head" style={{ marginBottom: 10 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarClock size={19} color="#20df7f" /> Live &amp; Upcoming Matches
        </h2>
        <span className="section-note" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={12} /> Auto-updates every 30s
          {lastUpdated ? ` • ${lastUpdated.toLocaleTimeString()}` : ''} • Calendars: {CALENDAR_UPDATED}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
        {snapshot.map((e) => {
          const live = liveByTitle.get(e.title.toLowerCase());
          const isLive = live?.statusState === 'in';
          return (
            <Link key={`${e.sport}-${e.title}-${e.date}`} to={live ? `/live/${live.sportId}` : e.link}
              style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ padding: '16px 18px', height: '100%', borderLeft: `3px solid ${e.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: 1, color: e.color }}>{e.sportLabel.toUpperCase()} • {e.competition}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: isLive ? 'rgba(255,46,85,0.15)' : 'rgba(255,255,255,0.06)', color: isLive ? '#ff2e55' : 'var(--muted)' }}>
                    {isLive ? '● LIVE' : countdownLabel(e.date)}
                  </span>
                </div>
                <strong style={{ display: 'block', margin: '8px 0 4px', fontSize: '0.98rem' }}>
                  {e.title}{live ? ` — ${getScoreSummary(live)}` : ''}
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{e.dateLabel} • {e.venue}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
