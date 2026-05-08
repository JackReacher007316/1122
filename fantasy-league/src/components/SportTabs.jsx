import React, { useState } from 'react';
import Icon3D from './Icon3D';
import { SPORT_CATALOG } from '../data/liveSports';

const tabs = [
  { id: 'all', label: 'All Sports', short: 'ALL', color: '#f8fafc', shape: 'live' },
  ...SPORT_CATALOG,
];

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
            <Icon3D color={tab.color} shape={tab.shape} size={28} active={isActive} hovered={isHovered} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
