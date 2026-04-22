import React, { useState, useEffect } from 'react';
import SportTabs from '../components/SportTabs';

const Leaderboard = ({ activeSport, setActiveSport }) => {
  const [topThree, setTopThree] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leaderboard?sport=${activeSport}`)
      .then(res => res.json())
      .then(data => {
        setTopThree(data.topThree);
        setRankings(data.rankings);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setLoading(false);
      });
  }, [activeSport]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>Global <span className="heading-gradient">Standings</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time points based on live event performance.</p>
      </header>

      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '48px' }}>
        <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading rankings...</p>
      ) : (
        <>
          <div className="scene-3d" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', marginBottom: '64px', height: '300px', width: '100%' }}>
            {topThree.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No data available for this category.</p>}
            {topThree.map((user) => (
              <div 
                key={user.rank} 
                className="card-3d"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  width: '120px'
                }}
              >
                <div style={{ 
                  background: 'var(--bg-panel)',
                  border: `2px solid ${user.color}`,
                  borderRadius: '50%',
                  width: '80px', height: '80px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  marginBottom: '16px',
                  boxShadow: `0 0 20px ${user.color}40`,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <span style={{ fontSize: '2rem' }}>{user.theme === 'football' ? '⚽' : user.theme === 'f1' ? '🏎️' : user.theme === 'cricket' ? '🏏' : '💻'}</span>
                  <div style={{
                    position: 'absolute', bottom: '-10px',
                    background: user.color, color: '#000',
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontWeight: 'bold', fontFamily: 'var(--font-heading)'
                  }}>
                    {user.rank}
                  </div>
                </div>
                
                <div style={{ 
                  background: `linear-gradient(to top, ${user.color}40, transparent)`,
                  border: `1px solid ${user.color}`,
                  borderBottom: 'none',
                  width: '100%',
                  height: user.rank === 1 ? '160px' : user.rank === 2 ? '120px' : '90px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px',
                  borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
                  transformStyle: 'preserve-3d',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `linear-gradient(90deg, rgba(255,255,255,0.1), transparent)`,
                    pointerEvents: 'none'
                  }}></div>
                  
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'bold', textShadow: '1px 1px 2px #000', textAlign: 'center', wordBreak: 'break-word', padding: '0 8px' }}>{user.name}</div>
                  <div style={{ color: 'var(--gold)', fontWeight: 'bold', marginTop: '8px' }}>{user.points}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px' }}>
            {rankings.length === 0 && topThree.length === 0 ? null : (
              rankings.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No more rankings available.</p> :
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                    <th style={{ padding: '16px' }}>Rank</th>
                    <th style={{ padding: '16px' }}>Manager</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Points</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map(row => (
                    <tr key={row.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>#{row.rank}</td>
                      <td style={{ padding: '16px' }}>{row.name}</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: 'var(--gold)', fontWeight: 'bold' }}>{row.points}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {row.trend === 'up' && <span style={{ color: 'var(--neon-green)' }}>▲</span>}
                        {row.trend === 'down' && <span style={{ color: 'var(--neon-red)' }}>▼</span>}
                        {row.trend === 'same' && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
