import React, { useState } from 'react';

const ParticleEffects = ({ type = 'sakura' }) => {
  const [particles] = useState(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 18,
      animationDelay: Math.random() * 15,
      size: 6 + Math.random() * 18,
      opacity: 0.2 + Math.random() * 0.5,
      drift: -50 + Math.random() * 100,
      rotateSpeed: 5 + Math.random() * 10,
    }));
  });

  const [glowOrbs] = useState(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      size: 100 + Math.random() * 200,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
    }));
  });

  return (
    <div className="particle-container">
      {/* Ambient glow orbs */}
      {glowOrbs.map((orb) => (
        <div
          key={`orb-${orb.id}`}
          className="ambient-orb"
          style={{
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animationDuration: `${orb.duration}s`,
            animationDelay: `-${orb.delay}s`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <div 
          key={p.id}
          className={`particle ${type}`}
          style={{
            '--drift': `${p.drift}px`,
            '--rotate-speed': `${p.rotateSpeed}s`,
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${type === 'sakura' ? p.size * 0.7 : p.size}px`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `-${p.animationDelay}s`,
            opacity: p.opacity
          }}
        />
      ))}

      {/* Horizontal light streaks */}
      {type === 'sparks' && Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`streak-${i}`}
          className="light-streak"
          style={{
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: 0.1 + Math.random() * 0.2,
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

        /* Ambient Glow Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orbFloat ease-in-out infinite;
          opacity: 0.08;
        }

        .particle.sakura ~ .ambient-orb,
        .ambient-orb {
          background: radial-gradient(circle, rgba(255, 183, 197, 0.4), transparent);
        }

        .particle.sparks ~ .ambient-orb {
          background: radial-gradient(circle, rgba(229, 9, 20, 0.4), transparent);
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
          25% { transform: translate(30px, -20px) scale(1.1); opacity: 0.12; }
          50% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.06; }
          75% { transform: translate(10px, 10px) scale(1.05); opacity: 0.1; }
        }

        /* Particles */
        .particle {
          position: absolute;
          top: -50px;
          animation: particleFall linear infinite;
        }

        /* Sakura Petals - Enhanced */
        .particle.sakura {
          background: linear-gradient(135deg, #FFB7C5 0%, #FF8CAE 50%, #FF6B8B 100%);
          border-radius: 50% 0 50% 0;
          box-shadow: 
            0 0 10px rgba(255, 183, 197, 0.4),
            0 0 20px rgba(255, 107, 139, 0.2);
          filter: blur(0.5px);
        }

        /* Cyber Sparks - Enhanced */
        .particle.sparks {
          background: radial-gradient(circle, #fff 20%, var(--neon-red) 60%, transparent 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 8px var(--neon-red),
            0 0 20px var(--neon-red),
            0 0 40px rgba(229, 9, 20, 0.3);
        }

        /* Light Streaks */
        .light-streak {
          position: absolute;
          left: -100%;
          width: 40%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--neon-red), transparent);
          animation: streakMove linear infinite;
          box-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
        }

        @keyframes particleFall {
          0% {
            transform: translateY(-50px) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) translateX(var(--drift, 80px));
            opacity: 0;
          }
        }

        @keyframes streakMove {
          0% {
            left: -40%;
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            left: 140%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleEffects;
