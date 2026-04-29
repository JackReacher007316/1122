import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, Zap, ChevronRight, Star, TrendingUp } from 'lucide-react';
import SportTabs from '../components/SportTabs';

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('STARTED'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);
  return <span>{timeLeft}</span>;
};

const Dashboard = ({ activeSport, setActiveSport }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => { setMatches(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeSport === 'all' ? matches : matches.filter(m => m.sport === activeSport);
  const liveMatches = filtered.filter(m => m.status === 'LIVE');
  const upcomingMatches = filtered.filter(m => m.status === 'UPCOMING');
  const completedMatches = filtered.filter(m => m.status === 'COMPLETED');

  const getSportColor = (sport) => {
    const colors = { cricket: '#FFD700', football: '#00ff87', f1: '#ff2800', hackathon: '#00e5ff' };
    return colors[sport] || 'var(--neon-pink)';
  };

  const getSportIcon = (sport) => {
    const icons = { cricket: '🏏', football: '⚽', f1: '🏎️', hackathon: '💻' };
    return icons[sport] || '🎮';
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '80px' }}>
      {/* Hero Header */}
      <header style={{ marginBottom: '32px', animation: 'fadeIn 0.6s ease both' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', letterSpacing: '4px', marginBottom: '8px' }}>
          ⬡ FANTASY ARENA
        </div>
        <h1 style={{ fontSize: '2.8rem', margin: 0, lineHeight: 1.1 }}>
          Choose Your <span className="heading-gradient" style={{ filter: 'drop-shadow(0 0 20px rgba(255,16,122,0.4))' }}>Battle</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
          Select a match, build your dream team of 11, and compete for glory.
        </p>
      </header>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Live Matches', value: liveMatches.length, icon: <Zap size={18} />, color: '#ff2800', glow: 'rgba(255,40,0,0.2)' },
          { label: 'Upcoming', value: upcomingMatches.length, icon: <Clock size={18} />, color: '#00e5ff', glow: 'rgba(0,229,255,0.2)' },
          { label: 'Total Contests', value: matches.reduce((a, m) => a + (m.contestCount || 0), 0), icon: <Trophy size={18} />, color: '#FFD700', glow: 'rgba(255,215,0,0.2)' },
          { label: 'Prize Pools', value: '₹1.5L+', icon: <Star size={18} />, color: '#00ff87', glow: 'rgba(0,255,135,0.2)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '20px', display: 'flex', alignItems: 'center', gap: '14px',
            animation: `slideInUp 0.4s ease ${0.1 * i}s both`
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: `${stat.color}15`, border: `1px solid ${stat.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color, boxShadow: `0 0 20px ${stat.glow}`
            }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* LIVE Matches */}
      {liveMatches.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="live-badge" style={{ fontSize: '0.6rem' }}>LIVE NOW</div>
            Live Matches
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {liveMatches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} navigate={navigate} getSportColor={getSportColor} getSportIcon={getSportIcon} isLive />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING Matches */}
      {upcomingMatches.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={18} color="var(--neon-blue)" /> Upcoming Matches
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0,229,255,0.3), transparent)' }} />
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {upcomingMatches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} navigate={navigate} getSportColor={getSportColor} getSportIcon={getSportIcon} />
            ))}
          </div>
        </section>
      )}

      {/* COMPLETED Matches */}
      {completedMatches.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy size={18} color="var(--text-muted)" /> Completed
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {completedMatches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} navigate={navigate} getSportColor={getSportColor} getSportIcon={getSportIcon} completed />
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.2)', borderTopColor: 'var(--neon-pink)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '3px' }}>LOADING MATCHES...</span>
        </div>
      )}

      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

// Match Card Component (Dream11-style)
const MatchCard = ({ match, index, navigate, getSportColor, getSportIcon, isLive, completed }) => {
  const color = getSportColor(match.sport);

  return (
    <div
      className="glass-panel"
      onClick={() => navigate(`/match/${match.id}`)}
      style={{
        padding: 0, overflow: 'hidden', cursor: 'pointer',
        borderTop: `3px solid ${isLive ? '#ff2800' : color}`,
        animation: `slideInUp 0.4s ease ${0.08 * index}s both`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        opacity: completed ? 0.7 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Header with sport badge */}
      <div style={{ padding: '14px 20px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', color, letterSpacing: '1px', padding: '2px 8px', background: `${color}15`, borderRadius: '4px', border: `1px solid ${color}40` }}>
            {match.sport.toUpperCase()}
          </span>
          {isLive && <span className="live-badge" style={{ fontSize: '0.55rem', padding: '2px 8px' }}>LIVE</span>}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>
          {match.contestCount} contests
        </span>
      </div>

      {/* Teams Face-off */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Team A */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '8px', filter: `drop-shadow(0 0 10px ${color}40)` }}>{match.teamALogo}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 900, letterSpacing: '1px' }}>{match.teamA}</div>
        </div>

        {/* VS Separator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '0 16px' }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--text-muted)',
            padding: '6px 14px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            letterSpacing: '2px'
          }}>VS</div>
          {!completed && (
            <div style={{ fontSize: '0.65rem', color: isLive ? '#ff2800' : 'var(--neon-blue)', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>
              {isLive ? '⚡ LIVE' : <CountdownTimer deadline={match.deadline} />}
            </div>
          )}
        </div>

        {/* Team B */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '8px', filter: `drop-shadow(0 0 10px ${color}40)` }}>{match.teamBLogo}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 900, letterSpacing: '1px' }}>{match.teamB}</div>
        </div>
      </div>

      {/* Footer with prize and CTA */}
      <div style={{
        padding: '14px 20px', background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>MEGA PRIZE</div>
          <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#FFD700', filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.3))' }}>{match.prize}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Users size={12} /> {match._count?.teams || 0} teams
        </div>
        {!completed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px',
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `1px solid ${color}50`, borderRadius: '8px',
            color, fontFamily: 'var(--font-heading)', fontSize: '0.7rem',
            letterSpacing: '1px', cursor: 'pointer'
          }}>
            {isLive ? 'VIEW' : 'PLAY'} <ChevronRight size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
