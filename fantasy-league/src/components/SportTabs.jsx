import React from 'react';

const SportTabs = ({ activeSport, setActiveSport }) => {
  const tabs = [
    { id: 'all', label: 'All Events', icon: '🌸' },
    { id: 'football', label: 'Football', icon: '⚽', color: 'var(--neon-pink)' },
    { id: 'f1', label: 'Formula 1', icon: '🏎️', color: 'var(--neon-red)' },
    { id: 'cricket', label: 'Cricket', icon: '🎋', color: 'var(--neon-blue)' },
    { id: 'hackathon', label: 'Hackathon', icon: '👾', color: 'var(--neon-green)' }
  ];

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      gap: '12px', 
      marginBottom: '32px',
      padding: '12px',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      {tabs.map(tab => {
        const isActive = activeSport === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveSport(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: isActive ? `1px solid ${tab.color || 'rgba(255,255,255,0.5)'}` : '1px solid transparent',
              background: isActive ? (tab.color ? `${tab.color}20` : 'rgba(255,255,255,0.1)') : 'transparent',
              color: isActive ? (tab.color || '#fff') : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              if(!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if(!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SportTabs;
