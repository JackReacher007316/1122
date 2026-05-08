import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Play, Calendar, Trophy, Tv, ExternalLink, X, ChevronRight, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEAGUES, MATCHES, getStreamUrl, getLeagueById, getFeaturedMatches } from '../data/footballSchedule';

const STREAM_URL = 'https://www.footem.co.in';

function LeagueFilter({ active, onChange }) {
  return (
    <div className="football-league-tabs">
      {LEAGUES.map(l => (
        <button
          key={l.id}
          className={`league-tab ${active === l.id ? 'is-active' : ''}`}
          style={{ '--lc': l.color }}
          onClick={() => onChange(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function MatchRow({ match, onWatch }) {
  const d = new Date(match.date);
  const league = getLeagueById(match.league);
  const isPast = d < new Date();
  const isToday = d.toDateString() === new Date().toDateString();

  return (
    <div className={`ftb-match-row ${match.featured ? 'is-featured' : ''} ${isPast ? 'is-past' : ''}`} style={{ '--lc': league.color }}>
      <div className="ftb-match-date">
        <span className="ftb-day">{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
        <span className="ftb-time">{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        {isToday && <span className="ftb-today-badge">TODAY</span>}
      </div>
      <div className="ftb-match-info">
        <div className="ftb-teams">
          <strong>{match.home}</strong>
          <span className="ftb-vs">vs</span>
          <strong>{match.away}</strong>
        </div>
        <div className="ftb-meta">
          <span className="ftb-league-badge" style={{ background: `${league.color}22`, color: league.color, borderColor: `${league.color}44` }}>{league.label}</span>
          <span>{match.round}</span>
          <span className="ftb-venue">{match.venue}</span>
        </div>
      </div>
      <button className="ftb-watch-btn" onClick={() => onWatch(match)}>
        <Tv size={14} />
        Watch Live
      </button>
    </div>
  );
}

function StreamPlayer({ match, onClose }) {
  return (
    <div className="ftb-stream-overlay">
      <div className="ftb-stream-modal">
        <div className="ftb-stream-header">
          <div>
            <h3>{match ? `${match.home} vs ${match.away}` : 'Football Live Stream'}</h3>
            {match && <span className="ftb-stream-meta">{getLeagueById(match.league).label} • {match.round}</span>}
          </div>
          <div className="ftb-stream-actions">
            <a href={STREAM_URL} target="_blank" rel="noopener noreferrer" className="ftb-external-btn">
              <ExternalLink size={14} /> Open in new tab
            </a>
            <button className="ftb-close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="ftb-stream-player">
          <iframe
            src={STREAM_URL}
            title="Football Live Stream"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}

export default function FootballLive() {
  const navigate = useNavigate();
  const [activeLeague, setActiveLeague] = useState('all');
  const [streamMatch, setStreamMatch] = useState(null);
  const [showStream, setShowStream] = useState(false);
  const [monthFilter, setMonthFilter] = useState('all');

  const months = [
    { id: 'all', label: 'All' },
    { id: '5', label: 'May' },
    { id: '6', label: 'June' },
    { id: '7', label: 'July' },
    { id: '8', label: 'August' },
  ];

  const filtered = useMemo(() => {
    let list = activeLeague === 'all' ? MATCHES : MATCHES.filter(m => m.league === activeLeague);
    if (monthFilter !== 'all') {
      list = list.filter(m => (new Date(m.date).getMonth() + 1).toString() === monthFilter);
    }
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [activeLeague, monthFilter]);

  const featured = useMemo(() => getFeaturedMatches(), []);

  const handleWatch = useCallback((match) => {
    setStreamMatch(match);
    setShowStream(true);
  }, []);

  const openFullStream = useCallback(() => {
    setStreamMatch(null);
    setShowStream(true);
  }, []);

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="ftb-header">
        <button className="ghost-button" onClick={() => navigate('/')} style={{ marginBottom: 14 }}>
          <ArrowLeft size={16} /> Back to arena
        </button>
        <div className="ftb-hero">
          <div className="ftb-hero-text">
            <div className="eyebrow" style={{ color: '#20df7f', borderColor: '#20df7f55', background: '#20df7f16' }}>
              <Radio size={12} /> Live Football Hub
            </div>
            <h1 className="hero-title" style={{ fontSize: '2.8rem' }}>
              Football <span>Schedule & Streaming</span>
            </h1>
            <p className="hero-copy">
              All matches from Premier League, La Liga, Serie A, Bundesliga, Champions League & FIFA World Cup 2026 — with one-click live streaming.
            </p>
            <button className="ftb-stream-big-btn" onClick={openFullStream}>
              <Play size={18} /> Open Live Stream Player
            </button>
          </div>
          <div className="ftb-featured-stack">
            {featured.slice(0, 3).map(m => (
              <div key={m.id} className="ftb-feat-card" onClick={() => handleWatch(m)}>
                <div className="ftb-feat-teams">{m.home} vs {m.away}</div>
                <div className="ftb-feat-detail">
                  <span style={{ color: getLeagueById(m.league).color }}>{getLeagueById(m.league).label}</span>
                  <span>{m.round}</span>
                </div>
                <ChevronRight size={16} className="ftb-feat-arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* League Filter */}
      <LeagueFilter active={activeLeague} onChange={setActiveLeague} />

      {/* Month Filter */}
      <div className="ftb-month-bar">
        <Calendar size={14} style={{ color: 'var(--muted)' }} />
        {months.map(m => (
          <button key={m.id} className={`ftb-month-btn ${monthFilter === m.id ? 'is-active' : ''}`} onClick={() => setMonthFilter(m.id)}>
            {m.label}
          </button>
        ))}
        <span className="ftb-count">{filtered.length} matches</span>
      </div>

      {/* Match List */}
      <div className="ftb-match-list">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>No matches found for this filter. Try a different league or month.</div>
        ) : (
          filtered.map(m => <MatchRow key={m.id} match={m} onWatch={handleWatch} />)
        )}
      </div>

      {/* Stream Player Overlay */}
      {showStream && <StreamPlayer match={streamMatch} onClose={() => setShowStream(false)} />}

      <style>{`
        .ftb-header { margin-bottom: 24px; }
        .ftb-hero { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
        .ftb-hero-text { display: flex; flex-direction: column; gap: 12px; }
        .ftb-stream-big-btn {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 8px;
          padding: 14px 28px; border-radius: 999px; border: none;
          background: linear-gradient(135deg, #20df7f, #0fb86e); color: #06130d;
          font-weight: 850; font-size: 0.95rem; cursor: pointer;
          box-shadow: 0 8px 32px rgba(32,223,127,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          width: fit-content;
        }
        .ftb-stream-big-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 40px rgba(32,223,127,0.35); }
        .ftb-featured-stack { display: flex; flex-direction: column; gap: 10px; }
        .ftb-feat-card {
          padding: 16px 18px; border-radius: 14px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s; display: flex; align-items: center; gap: 12px;
        }
        .ftb-feat-card:hover { background: rgba(32,223,127,0.08); border-color: rgba(32,223,127,0.2); transform: translateX(4px); }
        .ftb-feat-teams { flex: 1; font-weight: 800; font-size: 0.9rem; }
        .ftb-feat-detail { display: flex; flex-direction: column; font-size: 0.72rem; color: var(--muted); gap: 2px; text-align: right; }
        .ftb-feat-arrow { color: var(--muted); flex-shrink: 0; }

        .football-league-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 16px; }
        .league-tab {
          flex-shrink: 0; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: var(--muted); font-size: 0.8rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .league-tab:hover, .league-tab.is-active {
          color: var(--text); background: color-mix(in srgb, var(--lc) 16%, transparent);
          border-color: color-mix(in srgb, var(--lc) 40%, transparent);
        }

        .ftb-month-bar {
          display: flex; align-items: center; gap: 8px; margin-bottom: 18px;
          padding: 8px 14px; border-radius: 14px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .ftb-month-btn {
          padding: 6px 14px; border-radius: 999px; border: none;
          background: transparent; color: var(--muted); font-size: 0.78rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .ftb-month-btn.is-active, .ftb-month-btn:hover { color: var(--text); background: rgba(255,255,255,0.08); }
        .ftb-count { margin-left: auto; color: var(--faint); font-size: 0.75rem; font-weight: 700; }

        .ftb-match-list { display: flex; flex-direction: column; gap: 6px; }
        .ftb-match-row {
          display: grid; grid-template-columns: 100px 1fr auto; gap: 18px; align-items: center;
          padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,17,24,0.6); transition: all 0.2s;
        }
        .ftb-match-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); transform: translateX(3px); }
        .ftb-match-row.is-featured { border-left: 3px solid var(--lc); }
        .ftb-match-row.is-past { opacity: 0.5; }

        .ftb-match-date { display: flex; flex-direction: column; gap: 2px; }
        .ftb-day { font-weight: 800; font-size: 0.85rem; }
        .ftb-time { color: var(--muted); font-size: 0.72rem; }
        .ftb-today-badge {
          display: inline-block; padding: 2px 6px; border-radius: 4px; margin-top: 4px;
          background: rgba(32,223,127,0.15); color: #20df7f; font-size: 0.6rem; font-weight: 900; width: fit-content;
        }

        .ftb-match-info { min-width: 0; }
        .ftb-teams { display: flex; align-items: center; gap: 8px; font-size: 0.92rem; flex-wrap: wrap; }
        .ftb-vs { color: var(--faint); font-weight: 400; font-size: 0.75rem; }
        .ftb-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 0.72rem; color: var(--muted); flex-wrap: wrap; }
        .ftb-league-badge {
          padding: 2px 8px; border-radius: 999px; font-weight: 800;
          border: 1px solid; font-size: 0.65rem;
        }
        .ftb-venue { color: var(--faint); }

        .ftb-watch-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
          border-radius: 999px; border: 1px solid rgba(32,223,127,0.3);
          background: rgba(32,223,127,0.08); color: #20df7f; font-size: 0.78rem;
          font-weight: 750; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .ftb-watch-btn:hover { background: rgba(32,223,127,0.18); border-color: #20df7f; transform: scale(1.05); box-shadow: 0 0 20px rgba(32,223,127,0.15); }

        /* Stream Overlay */
        .ftb-stream-overlay {
          position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          animation: fadeIn 0.2s ease;
        }
        .ftb-stream-modal {
          width: min(95vw, 1200px); height: min(88vh, 740px); border-radius: 20px;
          background: #0b1117; border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6); display: flex; flex-direction: column;
          overflow: hidden; animation: slideInUp 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .ftb-stream-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 22px; border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.3);
        }
        .ftb-stream-header h3 { margin: 0; font-size: 1rem; }
        .ftb-stream-meta { color: var(--muted); font-size: 0.75rem; }
        .ftb-stream-actions { display: flex; align-items: center; gap: 10px; }
        .ftb-external-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
          border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: var(--muted); font-size: 0.75rem; font-weight: 700; text-decoration: none; cursor: pointer;
          transition: all 0.2s;
        }
        .ftb-external-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }
        .ftb-close-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: var(--muted); cursor: pointer;
          display: grid; place-items: center; transition: all 0.2s;
        }
        .ftb-close-btn:hover { background: rgba(255,49,74,0.15); border-color: rgba(255,49,74,0.3); color: #ff314a; }
        .ftb-stream-player { flex: 1; position: relative; }
        .ftb-stream-player iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

        @media (max-width: 768px) {
          .ftb-hero { grid-template-columns: 1fr; }
          .ftb-match-row { grid-template-columns: 80px 1fr; gap: 12px; }
          .ftb-watch-btn { grid-column: 1 / -1; justify-self: start; }
          .ftb-stream-modal { width: 98vw; height: 94vh; border-radius: 14px; }
        }
      `}</style>
    </div>
  );
}
