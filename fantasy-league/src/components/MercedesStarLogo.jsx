import React from 'react';

export default function MercedesStarLogo({ size = 28, glow = true }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle',
        filter: glow ? 'drop-shadow(0 0 8px rgba(31, 128, 224, 0.35))' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'pointer'
      }}
      className="mercedes-star-logo"
    >
      {/* Outer tech HUD orbits */}
      <circle cx="50" cy="50" r="47" stroke="url(#tech-orbit-1)" strokeWidth="0.75" strokeDasharray="5 12 18 6" opacity="0.4" />
      <circle cx="50" cy="50" r="44" stroke="url(#tech-orbit-2)" strokeWidth="0.75" strokeDasharray="30 8 10 12" opacity="0.5" />
      
      {/* Glowing metallic main ring */}
      <circle cx="50" cy="50" r="39" stroke="url(#chrome-metallic)" strokeWidth="3.5" fill="url(#logo-dark-bg)" />
      <circle cx="50" cy="50" r="39" stroke="url(#neon-ring-glow)" strokeWidth="1" strokeDasharray="120 120" opacity="0.8" />

      {/* Dynamic Sports indicator notches on the outer ring */}
      {/* F1: Red indicator at the top (12 o'clock) */}
      <path d="M50 4 L50 9" stroke="#e50914" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="4" r="1.5" fill="#e50914" style={{ filter: 'drop-shadow(0 0 4px #e50914)' }} />
      
      {/* Cricket: Gold indicator at bottom-left (7:20 o'clock) */}
      <path d="M10 73 L14 70" stroke="#ffcc00" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="10" cy="73" r="1.5" fill="#ffcc00" style={{ filter: 'drop-shadow(0 0 4px #ffcc00)' }} />

      {/* Football: Green indicator at bottom-right (4:40 o'clock) */}
      <path d="M90 73 L86 70" stroke="#1db954" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="90" cy="73" r="1.5" fill="#1db954" style={{ filter: 'drop-shadow(0 0 4px #1db954)' }} />

      {/* Mercedes-style three-pointed star */}
      {/* Top Arm */}
      <path d="M50 50 L50 14 L44 48 Z" fill="url(#metal-light)" />
      <path d="M50 50 L50 14 L56 48 Z" fill="url(#metal-dark)" />
      
      {/* Bottom Left Arm */}
      <path d="M50 50 L19 68 L24 61 Z" fill="url(#metal-light)" />
      <path d="M50 50 L19 68 L15 74 Z" fill="url(#metal-dark)" />

      {/* Bottom Right Arm */}
      <path d="M50 50 L81 68 L85 74 Z" fill="url(#metal-light)" />
      <path d="M50 50 L81 68 L76 61 Z" fill="url(#metal-dark)" />

      {/* Central Hub Cap */}
      <circle cx="50" cy="50" r="3.5" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }} />

      {/* Definitions for Gradients */}
      <defs>
        <linearGradient id="chrome-metallic" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#475569" />
          <stop offset="55%" stopColor="#94a3b8" />
          <stop offset="75%" stopColor="#334155" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        
        <linearGradient id="logo-dark-bg" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1e24" />
          <stop offset="50%" stopColor="#0b0b0f" />
          <stop offset="100%" stopColor="#020205" />
        </linearGradient>

        <linearGradient id="neon-ring-glow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1f80e0" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#00c0f9" />
        </linearGradient>

        <linearGradient id="tech-orbit-1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e50914" />
          <stop offset="50%" stopColor="#ffcc00" />
          <stop offset="100%" stopColor="#1db954" />
        </linearGradient>
        
        <linearGradient id="tech-orbit-2" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00c0f9" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        <linearGradient id="metal-light" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        
        <linearGradient id="metal-dark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
