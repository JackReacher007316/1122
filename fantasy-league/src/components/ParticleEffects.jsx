import React, { useState } from 'react';

const ParticleEffects = ({ type = 'sakura' }) => {
  const [particles] = useState(() => {
    // Generate 30 random particles
    const particleCount = 30;
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // random x position (vw)
      animationDuration: 10 + Math.random() * 15, // between 10s and 25s
      animationDelay: Math.random() * 10, // staggered start
      size: 10 + Math.random() * 15, // 10px to 25px
      opacity: 0.3 + Math.random() * 0.5,
    }));
  });

  return (
    <div className="particle-container">
      {particles.map((p) => (
        <div 
          key={p.id}
          className={`particle ${type}`}
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${type === 'sakura' ? p.size * 0.8 : p.size}px`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `-${p.animationDelay}s`,
            opacity: p.opacity
          }}
        />
      ))}
      <style>{`
        .particle-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          top: -50px;
          border-radius: 50%;
          animation: fall linear infinite;
        }

        /* Sakura Petals */
        .particle.sakura {
          background: linear-gradient(135deg, #FFB7C5 0%, #FF6B8B 100%);
          border-radius: 10px 0 10px 0; /* Petal shape */
          box-shadow: 0 0 10px rgba(255, 183, 197, 0.4);
        }

        /* Cyber Sparks */
        .particle.sparks {
          background: var(--neon-red);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--neon-red);
        }

        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg) translateX(0);
          }
          100% {
            transform: translateY(110vh) rotate(720deg) translateX(100px);
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleEffects;
