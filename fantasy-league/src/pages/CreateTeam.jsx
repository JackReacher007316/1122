import React, { useState, useEffect } from 'react';
import SportTabs from '../components/SportTabs';

const CreateTeam = ({ activeSport, setActiveSport }) => {
  const [budget, setBudget] = useState(100);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setAllPlayers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch players:", err);
        setLoading(false);
      });
  }, []);

  const filteredPlayers = activeSport === 'all'
    ? allPlayers
    : allPlayers.filter(p => p.theme === activeSport);

  const handleSelect = (player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      setBudget(budget + player.cost);
    } else {
      if (budget >= player.cost && selectedPlayers.length < 5) {
        setSelectedPlayers([...selectedPlayers, { ...player, teamRole: 'member' }]);
        setBudget(budget - player.cost);
      }
    }
  };

  const assignRole = (id, newRole) => {
    const updated = selectedPlayers.map(p => {
      if (p.id === id) return { ...p, teamRole: newRole };
      if (p.teamRole === newRole) return { ...p, teamRole: null }; 
      return p;
    });
    setSelectedPlayers(updated);
  };

  const lockTeam = async () => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fantasy_token')}`
        },
        body: JSON.stringify({
          theme: activeSport,
          budget,
          players: selectedPlayers
        })
      });
      const data = await response.json();
      if(data.success) {
        alert('Team Locked successfully!');
        setSelectedPlayers([]);
        setBudget(100);
      }
    } catch (err) {
      console.error(err);
      alert('Error locking team');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Draft Your <span className="heading-gradient">Dream Team</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Select 5 members. Assign a Captain (2x pts) and Vice-Captain (1.5x pts).</p>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <div className="glass-panel" style={{ marginBottom: '32px', position: 'sticky', top: '20px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Budget Remaining</h3>
          <h2 style={{ margin: 0, color: budget < 15 ? 'var(--neon-red)' : 'var(--neon-green)', fontFamily: 'var(--font-heading)' }}>
            ${budget}M
          </h2>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${(budget / 100) * 100}%`, 
            height: '100%', 
            background: budget < 15 ? 'var(--neon-red)' : 'var(--grad-football)',
            transition: 'width 0.3s ease, background 0.3s ease'
          }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="scene-3d">
          <h3 style={{ marginBottom: '16px' }}>Available Roster</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading players...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {filteredPlayers.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No players found.</p>}
              {filteredPlayers.map(player => {
                const isSelected = selectedPlayers.find(p => p.id === player.id);
                return (
                  <div 
                    key={player.id}
                    onClick={() => handleSelect(player)}
                    className={`card-3d glass-panel ${player.theme === 'f1' ? 'f1-theme' : ''}`}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--neon-green)' : '2px solid transparent',
                      background: isSelected ? 'rgba(0,255,135,0.1)' : 'var(--bg-panel)',
                      transform: isSelected ? 'translateY(-5px)' : 'none',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{player.img}</div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{player.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 12px 0' }}>{player.role}</p>
                    <div style={{ fontWeight: 'bold', color: 'var(--gold)' }}>${player.cost}M</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--neon-blue)' }}>{player.points} pts</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px' }}>Your Squad ({selectedPlayers.length}/5)</h3>
          {selectedPlayers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No members selected yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedPlayers.map(player => (
                <div key={player.id} style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '12px', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: player.teamRole === 'C' ? '4px solid var(--gold)' : player.teamRole === 'VC' ? '4px solid #c0c0c0' : '4px solid transparent'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{player.role} - ${player.cost}M</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => assignRole(player.id, 'C')}
                      style={{ 
                        background: player.teamRole === 'C' ? 'var(--gold)' : 'transparent',
                        color: player.teamRole === 'C' ? '#000' : 'var(--text-muted)',
                        border: '1px solid var(--gold)',
                        borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '0.8rem'
                      }}
                    >C</button>
                    <button 
                      onClick={() => assignRole(player.id, 'VC')}
                      style={{ 
                        background: player.teamRole === 'VC' ? '#c0c0c0' : 'transparent',
                        color: player.teamRole === 'VC' ? '#000' : 'var(--text-muted)',
                        border: '1px solid #c0c0c0',
                        borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                        fontWeight: 'bold', fontSize: '0.8rem'
                      }}
                    >VC</button>
                  </div>
                </div>
              ))}
              {selectedPlayers.length === 5 && (
                <button onClick={lockTeam} className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Lock Team</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
