import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, MapPin, Clock, Trophy, Flag } from 'lucide-react';

const LiveScorePage = () => {
  const { sport } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const extractIframeSrc = (embed) => {
    const m = embed.match(/src='([^']+)'/) || embed.match(/src="([^"]+)"/);
    return m ? m[1] : null;
  };

  const fetchData = () => {
    setLoading(true);
    let url = '';
    if (sport === 'cricket') url = '/api/live/cricket';
    else if (sport === 'f1') url = '/api/live/f1/standings';
    else if (sport === 'football') url = 'https://www.scorebat.com/video-api/v3/feed/';

    fetch(url).then(r => r.json()).then(d => {
      setData(d);
      if (sport === 'football' && d?.response?.length > 0 && !selectedMatch) {
        const first = d.response.find(m => m.videos?.length > 0);
        if (first) setSelectedMatch(first);
      }
      setLastUpdated(new Date());
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [sport]);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, sport]);

  const getSportTitle = () => {
    const titles = { cricket: '🏏 Cricket Live Scores', football: '⚽ Football Live', f1: '🏎️ F1 Championship' };
    return titles[sport] || 'Live Scores';
  };

  const getSportColor = () => {
    const c = { cricket: '#FFD700', football: '#00ff87', f1: '#ff2800' };
    return c[sport] || 'var(--neon-pink)';
  };
  const color = getSportColor();

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button onClick={() => navigate('/live')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '12px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem' }}>
            <ArrowLeft size={16} /> BACK TO LIVE CENTER
          </button>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{getSportTitle()}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: `${color}15`,
            border: `1px solid ${color}40`, borderRadius: '8px', color, cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '1px'
          }}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} /> REFRESH
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} style={{ accentColor: color }} />
            AUTO (30s)
          </label>
        </div>
      </div>
      {lastUpdated && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}

      {/* CRICKET */}
      {sport === 'cricket' && data && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', color: data.source === 'live' ? '#00ff87' : '#00e5ff', padding: '3px 10px', background: data.source === 'live' ? 'rgba(0,255,135,0.1)' : 'rgba(0,229,255,0.1)', borderRadius: '4px', border: `1px solid ${data.source === 'live' ? 'rgba(0,255,135,0.3)' : 'rgba(0,229,255,0.3)'}` }}>
              {data.source === 'live' ? '● LIVE API' : '◆ DEMO DATA'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {(data.matches || []).map((match, i) => (
              <div key={match.id || i} className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderTop: `3px solid ${match.matchEnded ? 'rgba(255,255,255,0.2)' : color}`, animation: `slideInUp 0.4s ease ${0.1 * i}s both` }}>
                <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{match.name}</div>
                    {match.venue && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><MapPin size={10} /> {match.venue}</div>}
                  </div>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '1px', padding: '4px 10px', borderRadius: '6px', background: match.matchEnded ? 'rgba(255,255,255,0.05)' : `${color}15`, color: match.matchEnded ? 'var(--text-muted)' : color, border: `1px solid ${match.matchEnded ? 'rgba(255,255,255,0.1)' : `${color}40`}` }}>
                    {match.matchType?.toUpperCase()}
                  </span>
                </div>
                <div style={{ padding: '20px' }}>
                  {match.score?.length > 0 ? match.score.map((s, si) => (
                    <div key={si} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: si < match.score.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: si === 0 ? '#fff' : 'var(--text-muted)' }}>{s.inning}</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: si === 0 ? color : 'var(--text-muted)' }}>
                        {s.r}/{s.w} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({s.o})</span>
                      </span>
                    </div>
                  )) : <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Match yet to start</div>}
                  <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: match.matchEnded ? 'rgba(255,255,255,0.03)' : `${color}08`, border: `1px solid ${match.matchEnded ? 'rgba(255,255,255,0.05)' : `${color}20`}`, fontSize: '0.85rem', color: match.matchEnded ? 'var(--text-muted)' : color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!match.matchEnded && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: 'pulse 2s infinite' }} />}
                    {match.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F1 */}
      {sport === 'f1' && data && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderTop: `3px solid ${color}` }}>
          <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={18} color={color} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Driver Championship Standings</h3>
            <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', color: '#00ff87', padding: '3px 8px', background: 'rgba(0,255,135,0.1)', borderRadius: '4px', border: '1px solid rgba(0,255,135,0.3)' }}>● LIVE API</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>POS</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>DRIVER</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>TEAM</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>PTS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>WINS</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(data) ? data : []).map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', fontSize: '1rem', color: i < 3 ? '#FFD700' : '#fff' }}>{d.position}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{d.driver}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>{d.code}</div>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.team}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 'bold', fontSize: '1rem' }}>{d.points}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-heading)', color: d.wins > 0 ? '#FFD700' : 'var(--text-muted)' }}>{d.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FOOTBALL */}
      {sport === 'football' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(data?.response || []).slice(0, 12).map((match, i) => (
            <div key={i} className="glass-panel" style={{ padding: '16px 20px', animation: `slideInUp 0.3s ease ${0.05 * i}s both`, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{match.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{match.competition}</span>
                {match.videos?.length > 0 && <span style={{ color, fontSize: '0.65rem', fontFamily: 'var(--font-heading)' }}>▶ {match.videos.length} HIGHLIGHTS</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.2)', borderTopColor: color, animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color, fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '2px' }}>FETCHING LIVE DATA...</span>
        </div>
      )}

      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default LiveScorePage;
