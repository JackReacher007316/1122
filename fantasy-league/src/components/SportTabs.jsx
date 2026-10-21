import React, { useState } from 'react';
import { Layers, Tv, PlayCircle, Flag, Trophy } from 'lucide-react';
import { SPORT_CATALOG } from '../data/liveSports';

const tabs = [
  { id: 'all', label: 'All Sports', short: 'ALL', color: '#f8fafc' },
  ...SPORT_CATALOG,
];

function getSportTabIcon(tabId, isActive) {
  if (tabId === 'all') return <Layers size={14} />;
  
  if (tabId === 'f1') {
    return <Flag size={14} style={{ color: isActive ? 'var(--netflix-red)' : 'var(--muted)' }} />;
  }
  
  if (tabId === 'cricket') {
    return <Trophy size={14} style={{ color: isActive ? 'var(--hotstar-gold)' : 'var(--muted)' }} />;
  }
  
  if (tabId === 'football') {
    return <PlayCircle size={14} style={{ color: isActive ? 'var(--spotify-green)' : 'var(--muted)' }} />;
  }
  
  if (tabId === 'basketball') return <PlayCircle size={14} style={{ color: '#f3c623' }} />;
  return <Tv size={14} />;
}

export default function SportTabs({ activeSport, setActiveSport }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="sport-tabs" role="tablist" aria-label="Sports">
      {tabs.map((tab) => {
        const isActive = activeSport === tab.id;
        const isHovered = hovered === tab.id;

        return (
          <button
            key={tab.id}
            className={`sport-tab ${isActive ? 'is-active' : ''}`}
            onClick={() => setActiveSport(tab.id)}
            onMouseEnter={() => setHovered(tab.id)}
            onMouseLeave={() => setHovered(null)}
            role="tab"
            aria-selected={isActive}
            style={{ '--sport-color': tab.color }}
          >
            {getSportTabIcon(tab.id, isActive || isHovered)}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
