import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Zap, MonitorPlay } from 'lucide-react';
import {
  SPORTSURGE_QUICK_LINKS,
  getSportsurgeUrlForSport,
} from '../data/sportsurgeLinks';

const SPORT_COLOR = { football: '#20df7f', f1: '#ff314a', all: '#ff8a1c' };

/**
 * Single Sportsurge button for one match / race.
 * Opens Sportsurge in a new tab (Sportsurge often blocks iframing, so the
 * external link is the reliable path; in-app viewing lives on /sportsurge).
 */
export function SportsurgeButton({ sport = 'football', match, label, style }) {
  const color = SPORT_COLOR[sport] || SPORT_COLOR.all;
  const text =
    label ||
    (sport === 'f1' ? 'Sportsurge F1' : sport === 'football' ? 'Sportsurge' : 'Sportsurge Live');
  return (
    <a
      href={getSportsurgeUrlForSport(sport, match)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${text} — find this match on Sportsurge (opens in new tab)`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '999px', whiteSpace: 'nowrap',
        border: `1px solid ${color}55`, background: `${color}14`, color,
        fontSize: '0.78rem', fontWeight: 750, textDecoration: 'none', cursor: 'pointer',
        ...style,
      }}
    >
      <Zap size={14} /> {text} <ExternalLink size={12} />
    </a>
  );
}

/**
 * Quick-links bar: Sportsurge Live (all) + Football + F1 hubs,
 * plus a link to the in-site /sportsurge live page.
 */
export default function SportsurgeLinks({ style }) {
  return (
    <div
      style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
        padding: '14px 16px', borderRadius: '14px',
        border: '1px solid rgba(255,138,28,0.25)', background: 'rgba(255,138,28,0.05)',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.82rem' }}>
        <Zap size={15} color="#ff8a1c" /> Sportsurge
      </span>
      {SPORTSURGE_QUICK_LINKS.map((l) => (
        <a
          key={l.id}
          href={l.getUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '999px', textDecoration: 'none',
            border: `1px solid ${l.color}44`, background: `${l.color}12`, color: l.color,
            fontSize: '0.75rem', fontWeight: 700,
          }}
        >
          {l.label} <ExternalLink size={11} />
        </a>
      ))}
      <Link
        to="/sportsurge"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto',
          padding: '7px 12px', borderRadius: '999px', textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
          color: 'var(--text)', fontSize: '0.75rem', fontWeight: 700,
        }}
      >
        <MonitorPlay size={13} /> Open inside FOFA Arena
      </Link>
    </div>
  );
}
