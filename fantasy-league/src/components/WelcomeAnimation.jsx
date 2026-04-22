import React, { useState, useEffect } from 'react';

const WelcomeAnimation = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading out after 4 seconds to give time to read the note
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Completely remove from DOM after 5 seconds
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`welcome-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="welcome-content">
        <img 
          src="https://www.govtjobsblog.in/wp-content/uploads/2022/04/IIIT-Nagpur.png" 
          alt="IIITN Logo" 
          style={{ width: '150px', height: '150px', marginBottom: '24px', animation: 'zoomIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
        />
        
        <h1 className="heading-gradient" style={{ fontSize: '6rem', margin: '0 0 16px 0', animation: 'zoomIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both' }}>IIITN</h1>
        
        <p style={{ color: 'var(--neon-pink)', textTransform: 'uppercase', letterSpacing: '8px', fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 32px 0', animation: 'fadeInUp 1s ease 0.6s both' }}>
          Streaming Platform
        </p>

        <div style={{ 
          maxWidth: '600px', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeInUp 1s ease 1s both'
        }}>
          <p style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
            "Step into the future of sports. Draft your ultimate team, experience immersive watch parties, and rise to the top of the leaderboard. The arena awaits you."
          </p>
        </div>
      </div>
      <style>{`
        .welcome-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #05050A; /* Deep Neo-Tokyo Indigo */
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: opacity 1s ease-in-out;
        }

        .welcome-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .welcome-screen.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        @keyframes zoomIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;
