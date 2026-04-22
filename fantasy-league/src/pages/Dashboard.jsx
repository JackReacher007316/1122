import React, { useState, useEffect } from 'react';
import SportTabs from '../components/SportTabs';

const Dashboard = ({ activeSport, setActiveSport }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setAllEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
        setLoading(false);
      });
  }, []);

  const filteredEvents = activeSport === 'all' 
    ? allEvents 
    : allEvents.filter(e => e.theme === activeSport);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', margin: 0, textShadow: 'var(--shadow-3d)' }}>
            Welcome back, <span className="heading-gradient">Manager</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>
            Your squad is currently ranked #42. Draft wisely for the upcoming events.
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Points</div>
            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: 'var(--gold)', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>1,240</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Global Rank</div>
            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>#42</div>
          </div>
        </div>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <section className="scene-3d">
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', background: 'var(--neon-green)', borderRadius: '2px' }}></div>
          {activeSport === 'all' ? 'Featured Events' : `Featured ${activeSport.toUpperCase()} Events`}
        </h2>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading events...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {filteredEvents.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>No upcoming events for this category.</p>
            )}
            {filteredEvents.map(event => (
              <div 
                key={event.id} 
                className={`card-3d glass-panel ${event.theme === 'f1' ? 'f1-theme' : ''}`}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '32px 24px',
                  borderTop: event.theme === 'football' ? '2px solid var(--neon-green)' : event.theme === 'f1' ? '2px solid var(--neon-red)' : '2px solid var(--neon-blue)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%', left: '-50%',
                  width: '200%', height: '200%',
                  background: event.theme === 'football' ? 'radial-gradient(circle, rgba(0,255,135,0.05) 0%, transparent 50%)' :
                              event.theme === 'f1' ? 'radial-gradient(circle, rgba(255,40,0,0.05) 0%, transparent 50%)' :
                              'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 50%)',
                  pointerEvents: 'none',
                  zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <span className="badge" style={{ 
                      background: event.theme === 'football' ? 'rgba(0,255,135,0.1)' : event.theme === 'f1' ? 'rgba(255,40,0,0.1)' : 'rgba(0,229,255,0.1)',
                      color: event.theme === 'football' ? 'var(--neon-green)' : event.theme === 'f1' ? 'var(--neon-red)' : 'var(--neon-blue)',
                      border: `1px solid ${event.theme === 'football' ? 'var(--neon-green)' : event.theme === 'f1' ? 'var(--neon-red)' : 'var(--neon-blue)'}`
                    }}>
                      {event.type}
                    </span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontFamily: 'var(--font-heading)',
                      color: event.status === 'LIVE' ? 'var(--neon-green)' : 'var(--text-muted)',
                      animation: event.status === 'LIVE' ? 'pulse 2s infinite' : 'none'
                    }}>
                      {event.status}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', lineHeight: 1.2 }}>{event.title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontFamily: 'var(--font-subheading)', fontSize: '1.1rem' }}>{event.teams}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{event.date}</span>
                    <button className={`btn-primary ${event.theme === 'f1' ? 'f1' : ''}`} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      View Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
