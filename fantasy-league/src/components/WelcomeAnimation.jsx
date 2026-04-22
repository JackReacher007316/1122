import React, { useState, useEffect } from 'react';

const WelcomeAnimation = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [phase, setPhase] = useState(0); // 0: glitch, 1: logo, 2: text, 3: quote

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const fadeTimer = setTimeout(() => setFadeOut(true), 5000);
    const removeTimer = setTimeout(() => setShow(false), 6000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  if (!show) return null;

  return (
    <div className={`welcome-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Animated grid background */}
      <div className="welcome-grid" />
      
      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="welcome-particle" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
        }} />
      ))}

      {/* Radial glow orbs */}
      <div className="welcome-orb orb-1" />
      <div className="welcome-orb orb-2" />
      <div className="welcome-orb orb-3" />

      {/* Scanlines */}
      <div className="welcome-scanlines" />

      <div className="welcome-content">
        {/* Glitch Line */}
        <div className={`welcome-glitch-line ${phase >= 0 ? 'visible' : ''}`} />

        {/* Logo with 3D entrance */}
        <div className={`welcome-logo-container ${phase >= 1 ? 'visible' : ''}`}>
          <img 
            src="https://www.govtjobsblog.in/wp-content/uploads/2022/04/IIIT-Nagpur.png" 
            alt="IIITN Logo" 
            className="welcome-logo"
          />
          <div className="welcome-logo-ring" />
          <div className="welcome-logo-ring ring-2" />
        </div>
        
        {/* Title with holographic effect */}
        <div className={`welcome-title-group ${phase >= 2 ? 'visible' : ''}`}>
          <h1 className="welcome-title">
            <span className="welcome-title-letter">I</span>
            <span className="welcome-title-letter">I</span>
            <span className="welcome-title-letter">I</span>
            <span className="welcome-title-letter">T</span>
            <span className="welcome-title-letter">N</span>
          </h1>
          <div className="welcome-subtitle-container">
            <div className="welcome-subtitle-line" />
            <p className="welcome-subtitle">Streaming Platform</p>
            <div className="welcome-subtitle-line" />
          </div>
        </div>

        {/* Quote with glass panel */}
        <div className={`welcome-quote ${phase >= 3 ? 'visible' : ''}`}>
          <p>
            "Step into the future of sports. Draft your ultimate team, experience immersive watch parties, and rise to the top."
          </p>
          <div className="welcome-loading">
            <div className="welcome-loading-bar" />
            <span>INITIALIZING NEURAL LINK...</span>
          </div>
        </div>
      </div>

      <style>{`
        .welcome-screen {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: #020206;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: opacity 1s ease-in-out;
          overflow: hidden;
        }

        .welcome-screen.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        /* Grid Background */
        .welcome-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,16,122,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,16,122,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          perspective: 500px;
          transform: perspective(500px) rotateX(60deg) translateY(-50%);
          transform-origin: center center;
          opacity: 0.6;
        }

        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }

        /* Floating Particles */
        .welcome-particle {
          position: absolute;
          background: var(--neon-pink);
          border-radius: 50%;
          opacity: 0;
          animation: welcomeParticleFloat ease-in-out infinite;
          box-shadow: 0 0 10px var(--neon-pink);
        }

        @keyframes welcomeParticleFloat {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 0.8; transform: translateY(-30px) scale(1); }
        }

        /* Orbs */
        .welcome-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: morphBg 8s ease-in-out infinite;
        }
        .orb-1 {
          top: 20%; left: 20%; width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(255,16,122,0.3), transparent);
          animation-delay: 0s;
        }
        .orb-2 {
          bottom: 20%; right: 15%; width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(0,229,255,0.2), transparent);
          animation-delay: 2s;
        }
        .orb-3 {
          top: 50%; left: 60%; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(168,85,247,0.2), transparent);
          animation-delay: 4s;
        }

        /* Scanlines */
        .welcome-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            transparent 0px,
            transparent 2px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 10;
        }

        /* Content */
        .welcome-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 5;
        }

        /* Glitch Line */
        .welcome-glitch-line {
          width: 200px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--neon-pink), transparent);
          margin-bottom: 32px;
          opacity: 0;
          transform: scaleX(0);
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .welcome-glitch-line.visible {
          opacity: 1;
          transform: scaleX(1);
        }

        /* Logo */
        .welcome-logo-container {
          position: relative;
          margin-bottom: 24px;
          opacity: 0;
          transform: scale(0.3) rotateY(90deg);
          transition: all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .welcome-logo-container.visible {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
        }
        .welcome-logo {
          width: 120px; height: 120px;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 30px rgba(255,16,122,0.5));
        }
        .welcome-logo-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 160px; height: 160px;
          border: 1px solid rgba(255,16,122,0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: spin 10s linear infinite;
          box-shadow: 0 0 20px rgba(255,16,122,0.1);
        }
        .welcome-logo-ring.ring-2 {
          width: 190px; height: 190px;
          border-color: rgba(0,229,255,0.2);
          animation-direction: reverse;
          animation-duration: 15s;
          box-shadow: 0 0 20px rgba(0,229,255,0.1);
        }

        /* Title */
        .welcome-title-group {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .welcome-title-group.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .welcome-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 7rem;
          font-weight: 900;
          letter-spacing: 15px;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #FFB7C5, #FF107A, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 40px rgba(255,16,122,0.5));
          display: flex;
          gap: 4px;
        }
        .welcome-title-letter {
          display: inline-block;
          animation: letterBounce 0.6s ease both;
        }
        .welcome-title-group.visible .welcome-title-letter:nth-child(1) { animation-delay: 0s; }
        .welcome-title-group.visible .welcome-title-letter:nth-child(2) { animation-delay: 0.1s; }
        .welcome-title-group.visible .welcome-title-letter:nth-child(3) { animation-delay: 0.2s; }
        .welcome-title-group.visible .welcome-title-letter:nth-child(4) { animation-delay: 0.3s; }
        .welcome-title-group.visible .welcome-title-letter:nth-child(5) { animation-delay: 0.4s; }

        @keyframes letterBounce {
          0% { opacity: 0; transform: translateY(40px) scale(0.5); }
          60% { transform: translateY(-10px) scale(1.1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .welcome-subtitle-container {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .welcome-subtitle-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,16,122,0.5), transparent);
        }
        .welcome-subtitle {
          color: var(--neon-pink);
          text-transform: uppercase;
          letter-spacing: 8px;
          font-size: 1.4rem;
          font-weight: bold;
          margin: 0;
          font-family: 'Orbitron', sans-serif;
          text-shadow: 0 0 20px rgba(255,16,122,0.5);
        }

        /* Quote */
        .welcome-quote {
          max-width: 550px;
          padding: 24px 32px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }
        .welcome-quote.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .welcome-quote p {
          color: rgba(255,255,255,0.7);
          font-size: 1rem;
          line-height: 1.7;
          margin: 0 0 20px 0;
          font-style: italic;
          font-family: 'Noto Sans JP', sans-serif;
        }

        /* Loading bar */
        .welcome-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .welcome-loading-bar {
          width: 200px;
          height: 2px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .welcome-loading-bar::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, var(--neon-pink), var(--neon-blue));
          animation: loadingProgress 2.5s ease-in-out forwards;
          border-radius: 2px;
          box-shadow: 0 0 10px var(--neon-pink);
        }
        @keyframes loadingProgress {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .welcome-loading span {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 3px;
          color: var(--text-muted);
          animation: neonFlicker 3s infinite;
        }
        
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
          20%, 24%, 55% { opacity: 0.4; }
        }

        @keyframes morphBg {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        @keyframes spin {
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;
