import React, { useEffect, useState, useRef } from 'react';
import MercedesStarLogo from './MercedesStarLogo';

export default function WelcomeAnimation() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('arena_intro_seen'));
  const [stage, setStage] = useState('fade-in'); // 'fade-in', 'zoom-in', 'dissolve', 'done'
  const [hasSoundPlayed, setHasSoundPlayed] = useState(false);
  const [showAudioTip, setShowAudioTip] = useState(true);
  const audioCtxRef = useRef(null);

  // Dynamically load Bebas Neue Google Font
  useEffect(() => {
    if (!show) return;
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {}
    };
  }, [show]);

  // Synthesize Netflix "Ta-Dum" Sound
  const playTaDum = () => {
    if (hasSoundPlayed) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Double-strike synth notes: "Ta" then "Dum"
      const now = ctx.currentTime;

      // --- STRIKE 1: "Ta" (low pluck, subtle) ---
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(90, now); // F#2
      osc1.frequency.exponentialRampToValueAtTime(70, now + 0.35);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      // --- STRIKE 2: "Dum" (deep booming sub and mid synth) ---
      const osc2 = ctx.createOscillator(); // Sub frequency
      const osc3 = ctx.createOscillator(); // Mid sawtooth frequency for texture
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(55, now + 0.15); // A1
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.8);

      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(110, now + 0.15); // A2
      osc3.frequency.exponentialRampToValueAtTime(65, now + 0.7);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.001, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.7, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      // Reverb / Shimmer high tail
      const noiseOsc = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noiseOsc.type = 'sawtooth';
      noiseOsc.frequency.setValueAtTime(220, now + 0.18);
      noiseOsc.frequency.setValueAtTime(440, now + 0.3);
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.setValueAtTime(0.001, now + 0.18);
      noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.28);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      // Lowpass Filter to make it warm, dark and cinematic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.9);

      // Connections
      osc1.connect(gain1);
      gain1.connect(filter);

      osc2.connect(gain2);
      osc3.connect(gain2);
      gain2.connect(filter);

      noiseOsc.connect(noiseGain);
      noiseGain.connect(filter);

      filter.connect(ctx.destination);

      // Start oscillators
      osc1.start(now);
      osc1.stop(now + 0.4);

      osc2.start(now + 0.15);
      osc2.stop(now + 1.5);

      osc3.start(now + 0.15);
      osc3.stop(now + 1.5);

      noiseOsc.start(now + 0.18);
      noiseOsc.stop(now + 1.3);

      setHasSoundPlayed(true);
      setShowAudioTip(false);
    } catch (e) {
      console.warn("Web Audio API was blocked or failed:", e);
    }
  };

  useEffect(() => {
    if (!show) return undefined;

    // Attempt autoplay sound (might be blocked by browser)
    const playAttemptTimer = setTimeout(() => {
      playTaDum();
    }, 150);

    // Stage 1: Logo appears and starts zooming (1.2s)
    const zoomTimer = setTimeout(() => {
      setStage('zoom-in');
    }, 1200);

    // Stage 2: Spectrum lines dissolve (2.4s)
    const dissolveTimer = setTimeout(() => {
      setStage('dissolve');
    }, 2400);

    // Stage 3: Transition finishes (3.4s)
    const cleanupTimer = setTimeout(() => {
      sessionStorage.setItem('arena_intro_seen', 'true');
      setShow(false);
      setStage('done');
    }, 3400);

    return () => {
      clearTimeout(playAttemptTimer);
      clearTimeout(zoomTimer);
      clearTimeout(dissolveTimer);
      clearTimeout(cleanupTimer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div 
      className={`netflix-intro-overlay ${stage === 'dissolve' ? 'is-dissolving' : ''}`} 
      onClick={playTaDum}
      role="button"
      tabIndex={0}
      aria-label="FOFA Arena Cinematic Intro"
      style={{ cursor: 'pointer' }}
    >
      <div className="netflix-intro-content">
        {/* Mercedes-style Glowing Star Logo */}
        <div className={`netflix-logo-text ${stage}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <MercedesStarLogo size={150} />
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            letterSpacing: '8px',
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255,255,255,0.6)',
            fontFamily: 'Inter, sans-serif',
            marginTop: '8px',
            textTransform: 'uppercase'
          }}>FOFA ARENA</div>
        </div>

        {/* Exploding vertical spectrum light bars */}
        {stage !== 'fade-in' && (
          <div className="spectrum-bars">
            {Array.from({ length: 42 }).map((_, i) => {
              // Cycle colors of merged giants: Netflix Red, Spotify Green, Prime Blue, Hotstar Gold
              const colors = ['#e50914', '#1db954', '#00a8e1', '#ffcc00'];
              const color = colors[i % colors.length];
              const left = (i * 2.4); // span across screen
              const width = 2 + Math.random() * 5; // varied widths
              const height = 50 + Math.random() * 50; // varied heights
              const delay = Math.random() * 0.25;
              const duration = 0.4 + Math.random() * 0.5;
              return (
                <div 
                  key={i} 
                  className={`spectrum-bar ${stage === 'dissolve' ? 'fade-out' : ''}`}
                  style={{
                    left: `${left}%`,
                    width: `${width}px`,
                    height: `${height}vh`,
                    background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    boxShadow: `0 0 20px ${color}`
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Sub-note overlay prompting user for audio */}
        {showAudioTip && !hasSoundPlayed && (
          <div className="audio-tip">
            Tap anywhere for sound 🔊
          </div>
        )}
      </div>

      <style>{`
        .netflix-intro-overlay {
          position: fixed;
          inset: 0;
          background: #000000;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          user-select: none;
        }

        .netflix-intro-overlay.is-dissolving {
          opacity: 0;
          pointer-events: none;
        }

        .netflix-intro-content {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Bold cinematic flex logo container */
        .netflix-logo-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0;
          z-index: 10;
          transform: scale(0.85);
          opacity: 0;
          filter: blur(10px);
          animation: logoReveal 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @media (max-width: 768px) {
          .netflix-logo-text svg {
            width: 100px;
            height: 100px;
          }
          .netflix-logo-text div {
            font-size: 1.8rem !important;
            letter-spacing: 4px !important;
          }
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
            filter: blur(15px);
            transform: scale(0.75);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: scale(1.0);
          }
        }

        /* Zoom-in stage */
        .netflix-logo-text.zoom-in, .netflix-logo-text.dissolve {
          animation: logoZoom 1.4s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }

        @keyframes logoZoom {
          0% {
            transform: scale(1.0);
            filter: blur(0);
            opacity: 1;
          }
          30% {
            filter: blur(2px);
          }
          100% {
            transform: scale(22);
            filter: blur(18px);
            opacity: 0;
          }
        }

        /* Spectrum lines container */
        .spectrum-bars {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
        }

        /* Single spectrum bar */
        .spectrum-bar {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          mix-blend-mode: screen;
          animation: barFlash 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes barFlash {
          0% {
            opacity: 0;
            transform: translateY(-50%) scaleY(0.05);
          }
          55% {
            opacity: 0.95;
            transform: translateY(-50%) scaleY(1.3);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) scaleY(1.0);
          }
        }

        .spectrum-bar.fade-out {
          animation: barFade 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes barFade {
          0% {
            opacity: 1;
            transform: translateY(-50%) scaleY(1.0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) scaleY(0.01) scaleX(0.1);
            filter: blur(10px);
          }
        }

        /* Audio tip overlay at the bottom */
        .audio-tip {
          position: absolute;
          bottom: 12vh;
          left: 50%;
          transform: translateX(-50%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 2px;
          text-transform: uppercase;
          z-index: 20;
          animation: pulseTip 2s infinite ease-in-out;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          pointer-events: none;
        }

        @keyframes pulseTip {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
