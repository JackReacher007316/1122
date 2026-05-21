import React, { useState, useEffect } from 'react';
import { 
  Zap, Trophy, Cpu, Code, Gamepad2, Users, Activity, 
  ChevronRight, ChevronLeft, Layout, Shield, MonitorPlay, Sparkles 
} from 'lucide-react';

const slides = [
  {
    id: 'intro',
    title: 'FOFA FANTASY ARENA',
    subtitle: 'The Future of Multi-Sport Fantasy',
    description: 'A cutting-edge, Neo-Tokyo inspired platform bridging the gap between physical sports and digital excellence.',
    icon: <Zap size={80} />,
    color: 'var(--neon-pink)',
    background: 'linear-gradient(135deg, rgba(255,16,122,0.1), transparent)',
    image: '/cyberpunk_fantasy_sports_intro_1777431060326.png'
  },
  {
    id: 'domains',
    title: 'BEYOND THE FIELD',
    subtitle: 'Multi-Domain Support',
    description: 'From the roar of F1 engines to the silent intensity of Hackathons, we cover it all: Cricket, Football, Racing, and Coding.',
    icon: <Gamepad2 size={80} />,
    color: 'var(--neon-blue)',
    background: 'linear-gradient(135deg, rgba(0,229,255,0.1), transparent)'
  },
  {
    id: 'tech',
    title: 'NEURAL INFRASTRUCTURE',
    subtitle: 'High-Performance Stack',
    description: 'Powered by Vite, React, Node.js, and Prisma. Real-time updates via WebSockets for a seamless, low-latency experience.',
    icon: <Cpu size={80} />,
    color: '#a855f7',
    background: 'linear-gradient(135deg, rgba(168,85,247,0.1), transparent)'
  },
  {
    id: 'ai',
    title: 'CHAMPAK AI',
    subtitle: 'Intelligent Assistance',
    description: 'Your personal AI-driven companion for strategy, stats, and platform navigation. Built-in neural processing for real-time insights.',
    icon: <Activity size={80} />,
    color: '#00ff87',
    background: 'linear-gradient(135deg, rgba(0,255,135,0.1), transparent)'
  },
  {
    id: 'ui',
    title: 'CYBER-PUNK AESTHETIC',
    subtitle: 'Immersive Visuals',
    description: '3D Backgrounds, CSS glassmorphism, and dynamic particle effects. A design that feels alive and responsive to every interaction.',
    icon: <Sparkles size={80} />,
    color: '#FFD700',
    background: 'linear-gradient(135deg, rgba(255,215,0,0.1), transparent)'
  }
];

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="presentation-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: '#0a0814',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: 'var(--font-main)',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: slide.background,
        transition: 'background 1s ease',
        pointerEvents: 'none'
      }} />
      
      {slide.image && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          mixBlendMode: 'overlay',
          transition: 'all 1s ease',
          animation: 'slowZoom 20s linear infinite alternate'
        }} />
      )}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, ${slide.color}15, transparent 70%)`,
        filter: 'blur(60px)',
        transition: 'all 1s ease'
      }} />

      {/* Header */}
      <header style={{
        padding: '30px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${slide.color}, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${slide.color}30`
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', letterSpacing: '2px', fontFamily: 'var(--font-heading)', margin: 0 }}>FOFA ARENA</h1>
            <div style={{ fontSize: '0.6rem', opacity: 0.6, letterSpacing: '1px' }}>SYSTEM PRESENTATION v1.0.4</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {slides.map((_, i) => (
            <div 
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? '30px' : '10px',
                height: '4px',
                background: i === currentSlide ? slide.color : 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: i === currentSlide ? `0 0 10px ${slide.color}` : 'none'
              }}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 100px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          maxWidth: '1200px',
          alignItems: 'center'
        }}>
          <div style={{
            animation: 'fadeInLeft 0.8s ease-out'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: `${slide.color}15`,
              borderLeft: `3px solid ${slide.color}`,
              color: slide.color,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '20px',
              fontFamily: 'var(--font-heading)'
            }}>
              {slide.id}
            </div>
            <h2 style={{
              fontSize: '4.5rem',
              lineHeight: 0.9,
              margin: '0 0 20px 0',
              fontFamily: 'var(--font-heading)',
              background: `linear-gradient(to bottom, #fff, rgba(255,255,255,0.4))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 30px ${slide.color}20`
            }}>
              {slide.title}
            </h2>
            <h3 style={{
              fontSize: '1.8rem',
              color: slide.color,
              margin: '0 0 30px 0',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1px'
            }}>
              {slide.subtitle}
            </h3>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '500px'
            }}>
              {slide.description}
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
              <button 
                onClick={nextSlide}
                style={{
                  padding: '15px 35px',
                  background: slide.color,
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: `0 0 30px ${slide.color}40`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                PROCEED <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeInRight 0.8s ease-out'
          }}>
            <div style={{
              width: '400px',
              height: '400px',
              background: `radial-gradient(circle, ${slide.color}20, transparent 70%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                border: `1px dashed ${slide.color}30`,
                borderRadius: '50%',
                animation: 'spin 20s linear infinite'
              }} />
              <div style={{
                position: 'absolute',
                inset: '30px',
                border: `1px solid ${slide.color}10`,
                borderRadius: '50%',
                animation: 'spin 15s linear infinite reverse'
              }} />
              <div style={{
                color: slide.color,
                filter: `drop-shadow(0 0 20px ${slide.color})`,
                animation: 'float 4s ease-in-out infinite'
              }}>
                {slide.icon}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '40px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>DATA THROUGHPUT</span>
            <span style={{ fontSize: '0.8rem', color: '#00ff87', fontFamily: 'monospace' }}>842.1 GB/S</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>NEURAL SYNC</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--neon-blue)', fontFamily: 'monospace' }}>OPTIMAL</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={prevSlide}
            style={{
              width: '50px', height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            <ChevronLeft />
          </button>
          <button 
            onClick={nextSlide}
            style={{
              width: '50px', height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            <ChevronRight />
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0 30px',
              background: 'transparent',
              border: '1px solid var(--neon-pink)',
              color: 'var(--neon-pink)',
              fontWeight: 'bold',
              borderRadius: '25px',
              cursor: 'pointer',
              letterSpacing: '2px',
              fontSize: '0.7rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--neon-pink)'; e.target.style.color = '#000'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--neon-pink)'; }}
          >
            EXIT TO ARENA
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        
        .presentation-overlay {
          animation: overlayFadeIn 0.5s ease-out;
        }
        
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Presentation;
