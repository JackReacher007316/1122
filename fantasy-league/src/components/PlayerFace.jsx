import React, { useState } from 'react';

/** Player face with initials fallback (never shows a broken image). */
export default function PlayerFace({ name, img, size = 72, color = '#1f80e0' }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (!img || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'grid', placeItems: 'center', fontWeight: 900,
        fontSize: size * 0.34, color: '#fff',
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        border: `2px solid ${color}66`,
      }}>{initials}</div>
    );
  }
  return (
    <img
      src={img} alt={name} loading="lazy" onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        objectPosition: 'top', flexShrink: 0, border: `2px solid ${color}66`,
        background: 'rgba(255,255,255,0.05)',
      }}
    />
  );
}
