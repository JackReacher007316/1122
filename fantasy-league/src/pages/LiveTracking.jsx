import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, RefreshCw } from 'lucide-react';
import SportTabs from '../components/SportTabs';

const LiveTracking = ({ activeSport, setActiveSport }) => {
  const navigate = useNavigate();
  const [cricketData, setCricketData] = useState(null);
  const [f1Data, setF1Data] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/live/cricket').then(r => r.json()),
      fetch('/api/live/f1/standings').then(r => r.json()),
    ]).then(([cricket, f1]) => {
      setCricketData(cricket);
      setF1Data(f1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sportCards = [
    { id: 'cricket', icon: '🏏', title: 'Cricket Live', subtitle: `${cricketData?.matches?.length || 0} matches`, color: '#FFD700', preview: cricketData?.matches?.[0]?.status || 'View live scores' },
    { id: 'football', icon: '⚽', title: 'Football Live', subtitle: 'Highlights & Scores', color: '#00ff87', preview: 'Live match highlights' },
    { id: 'f1', icon: '🏎️', title: 'F1 Championship', subtitle: `${f1Data.length} drivers tracked`, color: '#ff2800', preview: f1Data[0] ? `P1: ${f1Data[0].driver} (${f1Data[0].points} pts)` : 'View standings' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '80px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Live <span className="heading-gradient">Match Center</span></h1>
        <div className="live-badge">LIVE DATA</div>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
        Select a sport to view detailed live scores on a dedicated page.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {sportCards.filter(s => activeSport === 'all' || activeSport === s.id).map((sport, i) => (
          <div key={sport.id} className="glass-panel" onClick={() => navigate(`/live/${sport.id}`)} style={{
            padding: 0, overflow: 'hidden', cursor: 'pointer',
            borderTop: `3px solid ${sport.color}`,
            animation: `slideInUp 0.4s ease ${0.1 * i}s both`,
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,0.4), 0 0 20px ${sport.color}20`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ padding: '32px 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: `radial-gradient(circle, ${sport.color}15, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none' }} />
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{sport.icon}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{sport.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{sport.subtitle}</p>
              <div style={{ fontSize: '0.8rem', color: sport.color, padding: '8px 12px', background: `${sport.color}10`, borderRadius: '8px', border: `1px solid ${sport.color}30` }}>
                {sport.preview}
              </div>
            </div>
            <div style={{ padding: '14px 24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--text-muted)' }}>VIEW FULL SCOREBOARD</span>
              <ChevronRight size={18} color={sport.color} />
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.2)', borderTopColor: 'var(--neon-pink)', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LiveTracking;
