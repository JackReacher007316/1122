import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { getNextEvents, countdownLabel, CALENDAR_UPDATED } from '../data/latestCalendars';
import { fetchLiveAndUpcoming, getScoreSummary } from '../data/liveSports';

/**
 * Live & Upcoming — ALL fixtures from ESPN (every major football league +
 * F1 sessions + today's other sports), re-fetched every 30 seconds.
 * The researched F1/cricket calendar snapshot below only fills in events
 * further than ~2 weeks out (and is the offline fallback).
 */
export default function UpcomingFixtures({ limit = 10 }) {
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = () => fetchLiveAndUpcoming()
      .then((f) => { if (mounted) { setLiveFixtures(f); setLastUpdated(new Date()); } })
      .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const espnItems = liveFixtures.filter((f) => f.source === 'live' && (f.statusState === 'in' || f.statusState === 'pre')).slice(0, limit);
  const espnTitles = new Set(espnItems.map((f) => `${f.home} vs ${f.away}`.toLowerCase()));
  const snapshot = getNextEvents(limit).filter((e) => !espnTitles.has(e.title.toLowerCase()));
  const liveByTitle = new Map(liveFixtures.map((f) => [`${f.home} vs ${f.away}`.toLowerCase(), f]));

  return (
    <section>
      <div className="section-head" style={{ marginBottom: 10 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarClock size={19} color="#20df7f" /> Live &amp; Upcoming Matches
        </h2>
        <span className="section-note" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={12} /> Fixtures: ESPN • auto-updates every 30s
          {lastUpdated ? ` • ${lastUpdated.toLocaleTimeString()}` : ''} • Long-range calendar: {CALENDAR_UPDATED}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
        {espnItems.map((f) => (
          <Link key={f.id} to={`/live/${f.sportId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-panel" style={{ padding: '16px 18px', height: '100%', borderLeft: `3px solid ${f.color || '#ff4b44'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: 1, color: f.color || '#ff4b44' }}>{(f.sportLabel || '').toUpperCase()} • {f.competition} • ESPN</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: f.statusState === 'in' ? 'rgba(255,46,85,0.15)' : 'rgba(255,255,255,0.06)', color: f.statusState === 'in' ? '#ff2e55' : 'var(--muted)' }}>
                  {f.statusState === 'in' ? '● LIVE' : f.date ? new Date(f.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'UPCOMING'}
                </span>
              </div>
              <strong style={{ display: 'block', margin: '8px 0 4px', fontSize: '0.98rem' }}>
                {f.home} vs {f.away}{f.statusState === 'in' ? ` — ${getScoreSummary(f)}` : ''}
              </strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                {f.date ? new Date(f.date).toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}{f.venue ? ` • ${f.venue}` : ''}
              </div>
            </div>
          </Link>
        ))}
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
