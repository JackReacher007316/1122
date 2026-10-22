import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Search, Star, TrendingUp } from 'lucide-react';
import { PLAYER_STATS, STAT_SPORTS } from '../data/playerStats';
import PlayerFace from '../components/PlayerFace';
import { ROSTERS } from '../data/rosters';

const SPORT_COLOR = { football: '#20df7f', cricket: '#f2c94c', f1: '#ff314a' };

function StatBar({ label, value, max }) {
  const pct = Math.min(100, (Number(value) / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)' }}>
        <span>{label}</span><strong style={{ color: 'var(--text)' }}>{value}</strong>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 4 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#ff4b44,#20df7f)' }} />
      </div>
    </div>
  );
}

export default function PlayerStats() {
  const [sport, setSport] = useState('all');
  const [query, setQuery] = useState('');

  const players = useMemo(() => PLAYER_STATS.filter((p) =>
    (sport === 'all' || p.sport === sport) &&
    `${p.name} ${p.team} ${p.role}`.toLowerCase().includes(query.toLowerCase()),
  ), [sport, query]);

  return (
    <div className="page-shell" style={{ paddingBottom: '100px' }}>
      <Link to="/" className="ghost-button" style={{ marginBottom: 14, display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to arena
      </Link>
      <div className="eyebrow" style={{ color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c12' }}>
        <BarChart3 size={12} /> Player Stats & Faces
      </div>
      <h1 className="hero-title" style={{ fontSize: '2.6rem', margin: '10px 0' }}>
        Star Players <span>2026 Season Stats</span>
      </h1>
      <p className="hero-copy" style={{ maxWidth: 720 }}>
        Faces, teams, ratings and season numbers for the biggest names in football,
        cricket and Formula 1 — updated Oct 2026. For entertainment & info only:
        this site has no betting, entry fees or cash prizes.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0', alignItems: 'center' }}>
        {STAT_SPORTS.map((t) => (
          <button key={t.id} onClick={() => setSport(t.id)} style={{
            padding: '9px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 750, fontSize: '0.82rem',
            border: `1px solid ${sport === t.id ? '#f2c94c' : 'rgba(255,255,255,0.1)'}`,
            background: sport === t.id ? 'rgba(242,201,76,0.14)' : 'rgba(255,255,255,0.03)',
            color: sport === t.id ? '#f2c94c' : 'var(--muted)',
          }}>{t.label}</button>
        ))}
        <div style={{ position: 'relative', marginLeft: 'auto', minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search player or team…"
            style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {players.map((p) => {
          const color = SPORT_COLOR[p.sport];
          const maxByLabel = Math.max(...Object.values(p.stats).map(Number));
          return (
            <article key={p.id} className="glass-panel" style={{ padding: 20, borderTop: `3px solid ${color}` }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <PlayerFace name={p.name} img={p.img} size={76} color={color} />
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{p.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 3 }}>{p.team} • {p.country}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, color, border: `1px solid ${color}55`, background: `${color}14` }}>{p.role}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, color: '#ffd700', border: '1px solid rgba(255,215,0,0.35)', background: 'rgba(255,215,0,0.08)' }}>
                      <Star size={10} /> {p.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                {Object.entries(p.stats).map(([label, value]) => (
                  <StatBar key={label} label={label} value={value} max={label.includes('rating') || label.includes('Average') ? 60 : maxByLabel} />
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', gap: 5, alignItems: 'center' }}>
                <TrendingUp size={12} /> Season snapshot • Oct 2026
              </div>
            </article>
          );
        })}
      </div>
      {!players.length && <div className="empty-state">No players match your search.</div>}

      {/* Full updated rosters with real photos */}
      <h2 style={{ marginTop: 36, fontSize: '1.3rem' }}>Updated Team Rosters — 2026/27</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Every big team's key players with real photos. Use the sport filter above — rosters follow it too.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
        {ROSTERS.filter((r) => sport === 'all' || r.sport === sport).map((r) => (
          <div key={r.team} className="glass-panel" style={{ padding: 18, borderTop: `3px solid ${r.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{r.team}</strong>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: r.color }}>{r.league}</span>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {r.players.map((pl) => (
                <div key={pl.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PlayerFace name={pl.name} img={pl.img} size={40} color={r.color} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 650 }}>{pl.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--muted)' }}>{pl.role}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
