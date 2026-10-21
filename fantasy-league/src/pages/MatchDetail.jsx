import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, ArrowLeft, Star, Zap, Crown, ChevronRight } from 'lucide-react';

const TeamBadge = ({ teamName, sport, size = '80px' }) => {
  const getSportColor = (s) => {
    const c = { cricket: '#FFD700', football: '#00ff87', f1: '#ff2800' };
    return c[s] || 'var(--neon-pink)';
  };

  const color = getSportColor(sport);
  const initials = teamName ? teamName.substring(0, 2).toUpperCase() : 'TM';
  const getEmoji = (s) => {
    if (s === 'f1') return '🏎️';
    if (s === 'cricket') return '🏏';
    if (s === 'football') return '⚽';
    return '🏆';
  };

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(20,20,20,0.9), rgba(5,5,5,0.95))',
      border: `2px solid ${color}`,
      boxShadow: `0 0 16px ${color}33, inset 0 0 8px rgba(255,255,255,0.05)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      margin: '0 auto 10px',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 60%)`,
        pointerEvents: 'none'
      }} />
      <span style={{ 
        fontFamily: 'var(--font-heading)', 
        fontSize: '1.6rem', 
        fontWeight: 900, 
        color: '#fff', 
        letterSpacing: '1px',
        textShadow: `0 0 8px ${color}60`
      }}>
        {initials}
      </span>
      <span style={{ 
        fontSize: '0.85rem',
        marginTop: '2px'
      }}>
        {getEmoji(sport)}
      </span>
    </div>
  );
};

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [contests, setContests] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('contests');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('fantasy_token');

  useEffect(() => {
    Promise.all([
      fetch(`/api/matches/${id}`).then(r => r.json()),
      fetch(`/api/matches/${id}/contests`).then(r => r.json()),
    ]).then(([matchData, contestData]) => {
      setMatch(matchData);
      setContests(contestData);
      setLoading(false);
    }).catch(() => setLoading(false));

    if (token) {
      fetch('/api/my-teams', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(teams => {
          const matchTeams = teams.filter(t => t.matchId === parseInt(id));
          setMyTeams(matchTeams);
        }).catch(() => {});
    }
  }, [id, token]);

  const getSportColor = (sport) => {
    const c = { cricket: '#FFD700', football: '#00ff87', f1: '#ff2800' };
    return c[sport] || 'var(--neon-pink)';
  };

  const joinContest = async (contestId) => {
    if (!token) { navigate('/auth'); return; }
    if (myTeams.length === 0) {
      navigate(`/create-team?matchId=${id}`);
      return;
    }
    try {
      const res = await fetch(`/api/contests/${contestId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamId: myTeams[0].id })
      });
      const data = await res.json();
      if (data.success) alert('Successfully joined contest! 🎉');
      else alert(data.error || 'Failed to join');
    } catch (e) { alert('Error joining contest'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.2)', borderTopColor: 'var(--neon-pink)', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '3px' }}>LOADING MATCH...</span>
    </div>
  );

  if (!match) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Match not found</div>;

  const color = getSportColor(match.sport);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '80px' }}>
      {/* Back button */}
      <button onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
        color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px', fontFamily: 'var(--font-heading)',
        fontSize: '0.8rem', letterSpacing: '1px', padding: '8px 0'
      }}>
        <ArrowLeft size={16} /> BACK TO MATCHES
      </button>

      {/* Match Header Card */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderTop: `3px solid ${color}`, marginBottom: '32px' }}>
        <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 0%, ${color}08 0%, transparent 60%)`, pointerEvents: 'none' }} />

          <div style={{ textAlign: 'center', flex: 1, zIndex: 1 }}>
            <TeamBadge teamName={match.teamA} sport={match.sport} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 900, letterSpacing: '2px' }}>{match.teamA}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '0 24px', zIndex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#fff',
              padding: '8px 20px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,16,122,0.2), rgba(168,85,247,0.2))',
              border: '1px solid rgba(255,16,122,0.3)', letterSpacing: '3px'
            }}>VS</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', textAlign: 'center', maxWidth: '200px' }}>
              {match.venue}
            </div>
            <div style={{ fontSize: '0.75rem', color: match.status === 'LIVE' ? '#ff2800' : 'var(--neon-blue)', fontFamily: 'var(--font-heading)' }}>
              {match.matchTime}
            </div>
            {match.status === 'LIVE' && <span className="live-badge" style={{ fontSize: '0.6rem' }}>LIVE</span>}
          </div>

          <div style={{ textAlign: 'center', flex: 1, zIndex: 1 }}>
            <TeamBadge teamName={match.teamB} sport={match.sport} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 900, letterSpacing: '2px' }}>{match.teamB}</div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ padding: '16px 32px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>PRIZE POOL</div><div style={{ color: '#FFD700', fontFamily: 'var(--font-heading)', fontWeight: 900 }}>{match.prize}</div></div>
            <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>CONTESTS</div><div style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 900 }}>{contests.length}</div></div>
            <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>MY TEAMS</div><div style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 900 }}>{myTeams.length}</div></div>
          </div>
          <button onClick={() => navigate(`/create-team?matchId=${match.id}`)} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.75rem' }}>
            + CREATE TEAM
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-panel" style={{ display: 'flex', gap: '0', marginBottom: '24px', padding: '4px', borderRadius: '12px' }}>
        {['contests', 'my-teams', 'leaderboard'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '1px',
            background: activeTab === tab ? `${color}20` : 'transparent',
            color: activeTab === tab ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s', textTransform: 'uppercase',
            boxShadow: activeTab === tab ? `0 0 15px ${color}20` : 'none',
            border: activeTab === tab ? `1px solid ${color}40` : '1px solid transparent'
          }}>{tab.replace('-', ' ')}</button>
        ))}
      </div>

      {/* Contests Tab */}
      {activeTab === 'contests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {contests.map((contest, i) => (
            <div key={contest.id} className="glass-panel" style={{
              padding: 0, overflow: 'hidden', animation: `slideInUp 0.3s ease ${0.08 * i}s both`
            }}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {contest.contestType === 'mega' && <Crown size={16} color="#FFD700" />}
                      {contest.contestType === 'h2h' && <Users size={16} color="#00e5ff" />}
                      {contest.contestType === 'practice' && <Star size={16} color="#00ff87" />}
                      {contest.contestType === 'winner-takes-all' && <Zap size={16} color="#ff2800" />}
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{contest.name}</h3>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {contest.contestType === 'practice' ? 'Free Entry' : `Entry: ₹${contest.entryFee}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>PRIZE POOL</div>
                    <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#FFD700' }}>{contest.prizePool}</div>
                  </div>
                </div>

                {/* Spots Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '6px' }}>
                    <span style={{ color: '#ff2800' }}>{contest.spotsLeft} spots left</span>
                    <span style={{ color: 'var(--text-muted)' }}>{contest.maxEntries} total</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${((contest.maxEntries - contest.spotsLeft) / contest.maxEntries) * 100}%`,
                      height: '100%', borderRadius: '3px',
                      background: `linear-gradient(90deg, ${color}, #ff2800)`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                <button onClick={() => joinContest(contest.id)} style={{
                  width: '100%', padding: '12px', border: `1px solid ${color}50`,
                  background: `${color}15`, color, borderRadius: '10px', cursor: 'pointer',
                  fontFamily: 'var(--font-heading)', fontSize: '0.8rem', letterSpacing: '1px',
                  transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; e.currentTarget.style.boxShadow = `0 0 20px ${color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {contest.entryFee === 0 ? 'JOIN FREE' : `JOIN ₹${contest.entryFee}`} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Teams Tab */}
      {activeTab === 'my-teams' && (
        <div>
          {myTeams.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏏</div>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>No teams created yet</h3>
              <button onClick={() => navigate(`/create-team?matchId=${match.id}`)} className="btn-primary" style={{ padding: '12px 32px' }}>
                CREATE YOUR FIRST TEAM
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myTeams.map((team, i) => (
                <div key={team.id} className="glass-panel" style={{ padding: '20px', animation: `slideInUp 0.3s ease ${0.1 * i}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>{team.teamName}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {team.members.length} players • {team.budget} credits left
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {team.members.map(m => (
                      <span key={m.id} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem',
                        background: m.teamRole === 'C' ? 'rgba(255,215,0,0.15)' : m.teamRole === 'VC' ? 'rgba(192,192,192,0.15)' : 'rgba(255,255,255,0.05)',
                        border: m.teamRole === 'C' ? '1px solid rgba(255,215,0,0.4)' : m.teamRole === 'VC' ? '1px solid rgba(192,192,192,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        color: m.teamRole === 'C' ? '#FFD700' : m.teamRole === 'VC' ? '#c0c0c0' : '#fff'
                      }}>
                        {m.teamRole && <span style={{ fontWeight: 'bold', marginRight: '4px' }}>{m.teamRole}</span>}
                        {m.player.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
          <Trophy size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>Leaderboard will be available once the match starts</h3>
        </div>
      )}

      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MatchDetail;
