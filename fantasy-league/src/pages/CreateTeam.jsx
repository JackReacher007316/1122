import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Star, ChevronRight, AlertCircle } from 'lucide-react';

const ROLE_CONFIG = {
  cricket: {
    roles: ['WK', 'BAT', 'AR', 'BOWL'],
    labels: { WK: 'Wicketkeeper', BAT: 'Batsman', AR: 'All-Rounder', BOWL: 'Bowler' },
    min: { WK: 1, BAT: 3, AR: 1, BOWL: 3 },
    max: { WK: 4, BAT: 6, AR: 4, BOWL: 6 },
    total: 11,
  },
  football: {
    roles: ['GK', 'DEF', 'MID', 'FWD'],
    labels: { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' },
    min: { GK: 1, DEF: 3, MID: 3, FWD: 1 },
    max: { GK: 1, DEF: 5, MID: 5, FWD: 3 },
    total: 11,
  },
  f1: {
    roles: ['DRV'],
    labels: { DRV: 'Driver' },
    min: { DRV: 11 },
    max: { DRV: 11 },
    total: 11,
  }
};

const PlayerAvatar = ({ player, size = '40px' }) => {
  const [error, setError] = useState(false);
  const isUrl = player.img && (player.img.startsWith('http') || player.img.startsWith('/')) && !error;

  if (isUrl) {
    return (
      <img
        src={player.img}
        alt={player.name}
        onError={() => setError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'block'
        }}
      />
    );
  }

  const initials = player.name 
    ? player.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : '👤';

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.15)',
      color: '#e5e5e5',
      fontSize: size === '40px' ? '0.8rem' : '0.7rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
    }}>
      {initials}
    </div>
  );
};

const CreateTeam = ({ activeSport }) => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeRole, setActiveRole] = useState('all');
  const [step, setStep] = useState(1); // 1=select, 2=captain, 3=confirm
  const [captainId, setCaptainId] = useState(null);
  const [vcId, setVcId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('My Team');

  const TOTAL_CREDITS = 100;
  const usedCredits = selected.reduce((sum, p) => sum + p.credits, 0);
  const remainingCredits = TOTAL_CREDITS - usedCredits;

  useEffect(() => {
    if (matchId) {
      Promise.all([
        fetch(`/api/matches/${matchId}`).then(r => r.json()),
        fetch(`/api/matches/${matchId}/players`).then(r => r.json()),
      ]).then(([m, p]) => { setMatch(m); setAllPlayers(p); setLoading(false); }).catch(() => setLoading(false));
    } else {
      fetch(`/api/players?sport=${activeSport === 'all' ? 'cricket' : activeSport}`)
        .then(r => r.json())
        .then(p => { setAllPlayers(p); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [matchId, activeSport]);

  const sport = match?.sport || (activeSport === 'all' ? 'cricket' : activeSport);
  const config = ROLE_CONFIG[sport] || ROLE_CONFIG.cricket;

  const roleCount = useMemo(() => {
    const counts = {};
    config.roles.forEach(r => counts[r] = 0);
    selected.forEach(p => { if (counts[p.playerType] !== undefined) counts[p.playerType]++; });
    return counts;
  }, [selected, config]);

  const teamCount = useMemo(() => {
    const counts = {};
    selected.forEach(p => { counts[p.team] = (counts[p.team] || 0) + 1; });
    return counts;
  }, [selected]);

  const filteredPlayers = activeRole === 'all' ? allPlayers : allPlayers.filter(p => p.playerType === activeRole);

  const canSelect = (player) => {
    if (selected.find(p => p.id === player.id)) return true; // can deselect
    if (selected.length >= config.total) return false;
    if (player.credits > remainingCredits) return false;
    const roleMax = config.max[player.playerType] || config.total;
    if ((roleCount[player.playerType] || 0) >= roleMax) return false;
    // Max 7 from one team
    if ((teamCount[player.team] || 0) >= 7) return false;
    return true;
  };

  const togglePlayer = (player) => {
    if (selected.find(p => p.id === player.id)) {
      setSelected(selected.filter(p => p.id !== player.id));
      if (captainId === player.id) setCaptainId(null);
      if (vcId === player.id) setVcId(null);
    } else if (canSelect(player)) {
      setSelected([...selected, player]);
    }
  };

  const isValid = selected.length === config.total && Object.keys(config.min).every(role => (roleCount[role] || 0) >= config.min[role]);

  const lockTeam = async () => {
    if (!captainId || !vcId) { alert('Select both Captain and Vice-Captain'); return; }
    const token = localStorage.getItem('fantasy_token');
    if (!token) { navigate('/auth'); return; }
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          theme: sport, budget: remainingCredits, matchId: matchId ? parseInt(matchId) : null,
          teamName, captainId, vcId,
          players: selected.map(p => ({ id: p.id }))
        })
      });
      const data = await res.json();
      if (data.success) {
        if (matchId) navigate(`/match/${matchId}`);
        else navigate('/');
      } else { alert(data.error || 'Error creating team'); }
    } catch (e) { alert('Error connecting to server'); }
  };

  const getSportColor = () => {
    const c = { cricket: '#FFD700', football: '#00ff87', f1: '#ff2800' };
    return c[sport] || 'var(--neon-pink)';
  };

  const color = getSportColor();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.2)', borderTopColor: 'var(--neon-pink)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  // STEP 2: Captain/VC Selection
  if (step === 2) {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease', paddingBottom: '80px' }}>
        <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem' }}>
          <ArrowLeft size={16} /> BACK TO PLAYERS
        </button>

        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Choose <span className="heading-gradient">Captain & VC</span></h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Captain gets <strong>2x</strong> points • Vice-Captain gets <strong>1.5x</strong> points</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selected.map(player => (
            <div key={player.id} className="glass-panel" style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: captainId === player.id ? '4px solid #FFD700' : vcId === player.id ? '4px solid #c0c0c0' : '4px solid transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <PlayerAvatar player={player} size="40px" />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{player.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{player.team} • {player.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setCaptainId(player.id); if (vcId === player.id) setVcId(null); }} style={{
                  width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                  background: captainId === player.id ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,215,0,0.1)',
                  color: captainId === player.id ? '#000' : '#FFD700',
                  border: '2px solid #FFD700', transition: 'all 0.3s',
                  boxShadow: captainId === player.id ? '0 0 20px rgba(255,215,0,0.4)' : 'none'
                }}>C</button>
                <button onClick={() => { setVcId(player.id); if (captainId === player.id) setCaptainId(null); }} style={{
                  width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                  background: vcId === player.id ? 'linear-gradient(135deg, #c0c0c0, #888)' : 'rgba(192,192,192,0.1)',
                  color: vcId === player.id ? '#000' : '#c0c0c0',
                  border: '2px solid #c0c0c0', transition: 'all 0.3s',
                  boxShadow: vcId === player.id ? '0 0 20px rgba(192,192,192,0.3)' : 'none'
                }}>VC</button>
              </div>
            </div>
          ))}
        </div>

        {captainId && vcId && (
          <button onClick={() => setStep(3)} className="btn-primary" style={{
            width: '100%', padding: '16px', marginTop: '24px', fontSize: '0.9rem', letterSpacing: '2px'
          }}>
            CONTINUE <ChevronRight size={18} style={{ display: 'inline' }} />
          </button>
        )}
      </div>
    );
  }

  // STEP 3: Confirm & Lock
  if (step === 3) {
    const captain = selected.find(p => p.id === captainId);
    const vc = selected.find(p => p.id === vcId);
    return (
      <div style={{ animation: 'fadeIn 0.4s ease', paddingBottom: '80px' }}>
        <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem' }}>
          <ArrowLeft size={16} /> BACK
        </button>

        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Confirm <span className="heading-gradient">Your Team</span></h1>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team Name" style={{
              flex: 1, padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-body)', outline: 'none'
            }} />
          </div>

          {/* Captain & VC highlight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '12px', textAlign: 'center' }}>
              <Crown size={20} color="#FFD700" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>CAPTAIN (2x)</div>
              <div style={{ fontWeight: 'bold', color: '#FFD700' }}>{captain?.name}</div>
            </div>
            <div style={{ padding: '14px', background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.3)', borderRadius: '12px', textAlign: 'center' }}>
              <Star size={20} color="#c0c0c0" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>VICE-CAPTAIN (1.5x)</div>
              <div style={{ fontWeight: 'bold', color: '#c0c0c0' }}>{vc?.name}</div>
            </div>
          </div>

          {/* Team List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selected.map(p => (
              <span key={p.id} style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem',
                background: p.id === captainId ? 'rgba(255,215,0,0.15)' : p.id === vcId ? 'rgba(192,192,192,0.15)' : 'rgba(255,255,255,0.05)',
                border: p.id === captainId ? '1px solid rgba(255,215,0,0.4)' : p.id === vcId ? '1px solid rgba(192,192,192,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff'
              }}>{p.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({p.team})</span></span>
            ))}
          </div>
        </div>

        <button onClick={lockTeam} className="btn-primary" style={{
          width: '100%', padding: '16px', fontSize: '1rem', letterSpacing: '2px'
        }}>
          🔒 LOCK TEAM
        </button>
      </div>
    );
  }

  // STEP 1: Player Selection
  return (
    <div style={{ animation: 'fadeIn 0.4s ease', paddingBottom: '100px' }}>
      {/* Header */}
      <button onClick={() => matchId ? navigate(`/match/${matchId}`) : navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
        color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '16px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem'
      }}>
        <ArrowLeft size={16} /> {matchId ? 'BACK TO MATCH' : 'BACK'}
      </button>

      <h1 style={{ fontSize: '2rem', margin: '0 0 4px 0' }}>
        Create <span className="heading-gradient">Dream Team</span>
      </h1>
      {match && <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>{match.teamA} vs {match.teamB}</p>}

      {/* Credit Bar (sticky) */}
      <div className="glass-panel" style={{ position: 'sticky', top: '0', zIndex: 100, marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>PLAYERS</span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 900 }}>
                <span style={{ color }}>{selected.length}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/{config.total}</span>
              </div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>CREDITS LEFT</span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 900, color: remainingCredits < 15 ? '#ff2800' : '#00ff87' }}>
                {remainingCredits.toFixed(1)}
              </div>
            </div>
          </div>
          {/* Role requirement badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {config.roles.map(role => {
              const count = roleCount[role] || 0;
              const min = config.min[role];
              const met = count >= min;
              return (
                <span key={role} style={{
                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem',
                  fontFamily: 'var(--font-heading)', letterSpacing: '0.5px',
                  background: met ? `${color}15` : 'rgba(255,40,0,0.1)',
                  color: met ? color : '#ff2800',
                  border: `1px solid ${met ? `${color}40` : 'rgba(255,40,0,0.3)'}`
                }}>
                  {role} {count}/{min}+
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${(selected.length / config.total) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${color}, var(--neon-pink))`, transition: 'width 0.3s ease', borderRadius: '2px' }} />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setActiveRole('all')} style={{
          padding: '8px 16px', borderRadius: '8px', border: activeRole === 'all' ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
          background: activeRole === 'all' ? `${color}20` : 'transparent', color: activeRole === 'all' ? '#fff' : 'var(--text-muted)',
          cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', whiteSpace: 'nowrap'
        }}>ALL ({allPlayers.length})</button>
        {config.roles.map(role => (
          <button key={role} onClick={() => setActiveRole(role)} style={{
            padding: '8px 16px', borderRadius: '8px',
            border: activeRole === role ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
            background: activeRole === role ? `${color}20` : 'transparent',
            color: activeRole === role ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', whiteSpace: 'nowrap'
          }}>{config.labels[role] || role} ({allPlayers.filter(p => p.playerType === role).length})</button>
        ))}
      </div>

      {/* Player List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Spotify-style Header Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '40px 2fr 1fr 0.8fr 0.8fr 60px', 
          padding: '12px 16px', 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          fontFamily: 'var(--font-heading)', 
          letterSpacing: '1px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '8px'
        }}>
          <span style={{ textAlign: 'center' }}>#</span>
          <span>PLAYER</span>
          <span>TEAM</span>
          <span style={{ textAlign: 'center' }}>PTS</span>
          <span style={{ textAlign: 'center' }}>CR</span>
          <span />
        </div>

        {filteredPlayers.map((player, i) => {
          const isSelected = selected.find(p => p.id === player.id);
          const canPick = canSelect(player);
          return (
            <div 
              key={player.id} 
              onClick={() => canPick && togglePlayer(player)} 
              style={{
                display: 'grid', 
                gridTemplateColumns: '40px 2fr 1fr 0.8fr 0.8fr 60px',
                padding: '10px 16px', 
                borderRadius: '6px', 
                alignItems: 'center',
                background: isSelected ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
                cursor: canPick ? 'pointer' : 'not-allowed', 
                opacity: !canPick && !isSelected ? 0.4 : 1,
                transition: 'all 0.2s', 
                animation: `slideInUp 0.3s ease ${0.03 * i}s both`,
              }}
              onMouseEnter={e => { if (canPick) e.currentTarget.style.background = isSelected ? 'rgba(29, 185, 84, 0.15)' : 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(29, 185, 84, 0.1)' : 'transparent'; }}
            >
              <div style={{ textAlign: 'center', color: isSelected ? 'var(--spotify-green)' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                {i + 1}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PlayerAvatar player={player} size="36px" />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isSelected ? 'var(--spotify-green)' : '#fff' }}>{player.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{player.role} • {player.selectedByPct}% sel</div>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{player.team}</span>
              <span style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--neon-blue)', fontWeight: 600 }}>{player.points}</span>
              <span style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 'bold' }}>{player.credits}</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  border: isSelected ? '2px solid var(--spotify-green)' : '2px solid rgba(255,255,255,0.2)',
                  background: isSelected ? 'var(--spotify-green)' : 'transparent',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {isSelected && <Check size={12} color="#000000" strokeWidth={4} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Bottom CTA */}
      {selected.length > 0 && (
        <div className="create-team-cta-bar">
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontSize: '0.8rem' }}>
            {selected.length}/{config.total} selected
            {!isValid && <span style={{ color: '#ff2800', marginLeft: '12px' }}><AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Complete role requirements</span>}
          </span>
          <button onClick={() => isValid && setStep(2)} disabled={!isValid} className="btn-primary" style={{
            padding: '14px 32px', fontSize: '0.85rem', opacity: isValid ? 1 : 0.5, cursor: isValid ? 'pointer' : 'not-allowed'
          }}>
            NEXT: CHOOSE C/VC <ChevronRight size={16} style={{ display: 'inline' }} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CreateTeam;
