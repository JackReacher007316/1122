import React, { useState, useEffect, useRef } from 'react';
import SportTabs from '../components/SportTabs';

// 3D Tilt Card Component
const TiltCard = ({ children, className = '', style = {}, glowColor = 'rgba(255,16,122,0.15)' }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
    card.style.boxShadow = `0 25px 50px rgba(0,0,0,0.6), 0 0 40px ${glowColor}`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    card.style.boxShadow = '';
  };

  return (
    <div
      ref={cardRef}
      className={`glass-panel holo-card ${className}`}
      style={{
        ...style,
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
        transformStyle: 'preserve-3d',
        cursor: 'pointer'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Floating Orb Component
const FloatingOrbs = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: '20px' }}>
    <div style={{
      position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px',
      background: 'radial-gradient(circle, rgba(255,16,122,0.15) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'morphBg 8s ease-in-out infinite', filter: 'blur(40px)'
    }} />
    <div style={{
      position: 'absolute', bottom: '-20%', left: '-10%', width: '200px', height: '200px',
      background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'morphBg 10s ease-in-out infinite reverse', filter: 'blur(40px)'
    }} />
  </div>
);

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

  const getThemeColor = (theme) => {
    switch(theme) {
      case 'football': return { color: '#00ff87', glow: 'rgba(0,255,135,0.15)', border: '#00ff87' };
      case 'f1': return { color: '#ff2800', glow: 'rgba(255,40,0,0.2)', border: '#ff2800' };
      case 'hackathon': return { color: '#00e5ff', glow: 'rgba(0,229,255,0.15)', border: '#00e5ff' };
      case 'cricket': return { color: '#FFD700', glow: 'rgba(255,215,0,0.15)', border: '#FFD700' };
      default: return { color: 'var(--neon-pink)', glow: 'rgba(255,16,122,0.15)', border: 'var(--neon-pink)' };
    }
  };

  return (
    <div>
      {/* Hero Header with 3D depth */}
      <header style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        animation: 'fadeIn 0.6s ease both'
      }}>
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--neon-pink)', 
            fontFamily: 'var(--font-heading)', 
            letterSpacing: '4px', 
            marginBottom: '8px',
            animation: 'slideInLeft 0.6s ease both'
          }}>
            ⬡ COMMAND CENTER
          </div>
          <h1 style={{ 
            fontSize: '3.2rem', 
            margin: 0, 
            lineHeight: 1.1,
            animation: 'slideInLeft 0.6s ease 0.1s both'
          }}>
            Welcome back, <span className="heading-gradient" style={{ 
              filter: 'drop-shadow(0 0 20px rgba(255,16,122,0.4))' 
            }}>Manager</span>
          </h1>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.05rem', 
            marginTop: '12px',
            animation: 'slideInLeft 0.6s ease 0.2s both',
            maxWidth: '500px'
          }}>
            Your squad is currently ranked <span style={{ color: '#fff', fontWeight: 'bold' }}>#42</span>. 
            Draft wisely for the upcoming events.
          </p>
        </div>

        {/* Stats Panel with 3D effect */}
        <div className="glass-panel" style={{ 
          padding: '20px 28px', 
          display: 'flex', 
          gap: '28px', 
          alignItems: 'center',
          animation: 'slideInRight 0.6s ease 0.3s both',
          position: 'relative'
        }}>
          <FloatingOrbs />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Total Points</div>
            <div className="stat-value" style={{ fontSize: '2rem' }}>
              <AnimatedCounter target={1240} />
            </div>
          </div>
          <div style={{ width: '1px', height: '50px', background: 'linear-gradient(180deg, transparent, rgba(255,16,122,0.5), transparent)', position: 'relative', zIndex: 1 }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Global Rank</div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff', fontWeight: 900, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
              #<AnimatedCounter target={42} duration={1500} />
            </div>
          </div>
          <div style={{ width: '1px', height: '50px', background: 'linear-gradient(180deg, transparent, rgba(0,229,255,0.5), transparent)', position: 'relative', zIndex: 1 }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Win Rate</div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--neon-blue)', fontWeight: 900, filter: 'drop-shadow(0 0 15px rgba(0,229,255,0.4))' }}>
              <AnimatedCounter target={78} suffix="%" duration={1800} />
            </div>
          </div>
        </div>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* Events Grid */}
      <section className="scene-3d" style={{ animation: 'fadeIn 0.6s ease 0.4s both' }}>
        <h2 style={{ 
          marginBottom: '28px', 
          fontSize: '1.4rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <div style={{ 
            width: '14px', height: '14px', 
            background: 'var(--grad-football)', 
            borderRadius: '3px',
            boxShadow: '0 0 15px rgba(255,16,122,0.5)',
            animation: 'pulse 2s infinite'
          }}></div>
          {activeSport === 'all' ? 'Featured Events' : `Featured ${activeSport.toUpperCase()} Events`}
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,16,122,0.3), transparent)', marginLeft: '12px' }}></div>
        </h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.2)', borderTopColor: 'var(--neon-pink)', animation: 'spin 0.8s linear infinite' }}></div>
            <span style={{ color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '3px' }}>LOADING DATA...</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {filteredEvents.length === 0 && (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No upcoming events for this category.</p>
            )}
            {filteredEvents.map((event, index) => {
              const theme = getThemeColor(event.theme);
              return (
                <TiltCard
                  key={event.id}
                  glowColor={theme.glow}
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    animation: `slideInUp 0.5s ease ${0.1 * index}s both`
                  }}
                >
                  {/* Top accent bar with animated gradient */}
                  <div style={{
                    height: '3px',
                    background: `linear-gradient(90deg, ${theme.border}, transparent, ${theme.border})`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s linear infinite'
                  }} />

                  <div style={{ padding: '28px 24px', position: 'relative' }}>
                    {/* Background glow */}
                    <div style={{
                      position: 'absolute', top: '-50%', right: '-30%',
                      width: '200px', height: '200px',
                      background: `radial-gradient(circle, ${theme.glow} 0%, transparent 60%)`,
                      filter: 'blur(40px)', pointerEvents: 'none'
                    }}></div>

                    {/* Scanline effect */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                      background: `linear-gradient(90deg, transparent, ${theme.color}40, transparent)`,
                      animation: 'scanline 4s linear infinite', pointerEvents: 'none', opacity: 0.5
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span className="badge" style={{ 
                          background: `${theme.color}15`,
                          color: theme.color,
                          border: `1px solid ${theme.color}60`,
                          boxShadow: `0 0 15px ${theme.color}20`
                        }}>
                          {event.type}
                        </span>
                        {event.status === 'LIVE' ? (
                          <span className="live-badge">LIVE</span>
                        ) : (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-muted)',
                            letterSpacing: '1px'
                          }}>
                            {event.status}
                          </span>
                        )}
                      </div>
                      
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        marginBottom: '8px', 
                        lineHeight: 1.2,
                        textShadow: `0 0 30px ${theme.color}20`
                      }}>{event.title}</h3>
                      <p style={{ 
                        color: 'var(--text-muted)', 
                        marginBottom: '24px', 
                        fontFamily: 'var(--font-subheading)', 
                        fontSize: '1rem' 
                      }}>{event.teams}</p>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        borderTop: '1px solid rgba(255,255,255,0.07)', 
                        paddingTop: '16px' 
                      }}>
                        <span style={{ fontSize: '0.85rem', color: '#666', fontFamily: 'var(--font-body)' }}>{event.date}</span>
                        <button className={`btn-primary ${event.theme === 'f1' ? 'f1' : ''}`} style={{ padding: '10px 20px', fontSize: '0.75rem' }}>
                          View Event
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
