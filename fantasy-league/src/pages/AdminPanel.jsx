import React, { useState, useEffect } from 'react';
import SportTabs from '../components/SportTabs';

const AdminPanel = ({ activeSport, setActiveSport }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [action, setAction] = useState('Goal Scored');
  const [pointsAdded, setPointsAdded] = useState(10);
  const [notes, setNotes] = useState('');

  const eventTheme = activeSport === 'all' ? 'football' : activeSport;

  useEffect(() => {
    fetch(`/api/players?sport=${eventTheme}`)
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error(err));
  }, [eventTheme]);

  const handleActionChange = (e) => {
    const val = e.target.value;
    setAction(val);
    if (val.includes('+10')) setPointsAdded(10);
    else if (val.includes('+15')) setPointsAdded(15);
    else if (val.includes('+8')) setPointsAdded(8);
    else if (val.includes('+5')) setPointsAdded(5);
    else if (val.includes('+3')) setPointsAdded(3);
    else if (val.includes('-2')) setPointsAdded(-2);
    else if (val.includes('-5')) setPointsAdded(-5);
    else if (val.includes('-15')) setPointsAdded(-15);
    else setPointsAdded(0);
  };

  const submitLog = async () => {
    if (!selectedPlayerId) return alert('Select a player');
    try {
      const res = await fetch('/api/admin/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fantasy_token')}`
        },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          action,
          pointsAdded,
          notes
        })
      });
      const data = await res.json();
      if(data.success) {
        alert('Performance logged successfully!');
        setNotes('');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--neon-red)' }}>Admin <span style={{ color: '#fff' }}>Control Panel</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Update live scores, performance stats, and trigger fantasy points recalculation.</p>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <div className="glass-panel scene-3d" style={{ borderTop: `4px solid ${eventTheme === 'football' ? 'var(--neon-green)' : eventTheme === 'f1' ? 'var(--neon-red)' : eventTheme === 'cricket' ? '#00e5ff' : 'var(--neon-blue)'}` }}>
        <h3 style={{ marginBottom: '24px' }}>Log {eventTheme.toUpperCase()} Performance Event</h3>
        
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Participant / Player</label>
            <select 
              value={selectedPlayerId} 
              onChange={e => setSelectedPlayerId(e.target.value)}
              style={{
                padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', appearance: 'none'
              }}
            >
              <option value="">Select a player...</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Action / Stat</label>
            <select 
              value={action}
              onChange={handleActionChange}
              style={{
                padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', appearance: 'none'
              }}>
              {eventTheme === 'football' && (
                <>
                  <option>Goal Scored (+10 pts)</option>
                  <option>Assist (+5 pts)</option>
                  <option>Clean Sheet (+8 pts)</option>
                  <option>Yellow Card (-2 pts)</option>
                </>
              )}
              {eventTheme === 'f1' && (
                <>
                  <option>Overtake (+3 pts)</option>
                  <option>Fastest Lap (+10 pts)</option>
                  <option>Pitstop under 2.5s (+5 pts)</option>
                  <option>DNF (-15 pts)</option>
                </>
              )}
              {eventTheme === 'cricket' && (
                <>
                  <option>Run Scored (+1 pts)</option>
                  <option>Wicket Taken (+20 pts)</option>
                  <option>Catch (+10 pts)</option>
                  <option>Duck (-5 pts)</option>
                </>
              )}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Match / Evaluation Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows="3" placeholder="Additional details..." style={{
              padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical'
            }}></textarea>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" style={{
              padding: '12px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', cursor: 'pointer'
            }}>Cancel</button>
            <button type="button" onClick={submitLog} className={`btn-primary ${eventTheme === 'f1' ? 'f1' : ''}`} style={{ padding: '12px 32px' }}>
              Publish Update
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,40,0,0.05)', border: '1px solid rgba(255,40,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ color: 'var(--neon-red)', fontSize: '1.5rem' }}>⚠️</div>
        <div>
          <h4 style={{ color: 'var(--neon-red)', margin: '0 0 4px 0' }}>Warning</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Publishing updates will immediately trigger the live score fetching mechanism and recalculate all fantasy teams' points.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
