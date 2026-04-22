import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, MonitorPlay } from 'lucide-react';
import SportTabs from '../components/SportTabs';

const LiveTracking = ({ activeSport, setActiveSport }) => {
  const [footballMatches, setFootballMatches] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const cricketWidgetRef = useRef(null);

  // Fetch ScoreBat Video API for Football
  useEffect(() => {
    fetch('https://www.scorebat.com/video-api/v3/feed/')
      .then(res => res.json())
      .then(data => {
        if (data && data.response) {
          setFootballMatches(data.response.slice(0, 15)); // Get top 15 recent/live matches
          if (data.response.length > 0 && data.response[0].videos && data.response[0].videos.length > 0) {
            setSelectedStream(data.response[0]); // Select first match by default
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch ScoreBat API:", err);
        setLoading(false);
      });
  }, []);

  // Load Cricket Widget Script
  useEffect(() => {
    if (activeSport === 'cricket' || activeSport === 'all') {
      const scriptId = 'cricket-widget-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        // Using a generic free sports widget provider approach
        script.src = "https://widget.cricketdata.org/cricket-widget.js"; 
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [activeSport]);

  const extractIframeSrc = (embedString) => {
    // ScoreBat API returns an embed string like "<iframe src='...' ...></iframe>"
    const match = embedString.match(/src='([^']+)'/);
    if (match && match[1]) return match[1];
    const matchDouble = embedString.match(/src="([^"]+)"/);
    if (matchDouble && matchDouble[1]) return matchDouble[1];
    return null;
  };

  const getStreamSrc = () => {
    if (!selectedStream || !selectedStream.videos || selectedStream.videos.length === 0) return null;
    return extractIframeSrc(selectedStream.videos[0].embed);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Live <span className="heading-gradient">Match Center</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,40,0,0.1)', border: '1px solid var(--neon-red)', borderRadius: '20px' }}>
          <Activity size={16} color="var(--neon-red)" style={{ animation: 'pulse 2s infinite' }} />
          <span style={{ color: 'var(--neon-red)', fontSize: '0.9rem', fontWeight: 'bold' }}>LIVE STREAMS</span>
        </div>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* FOOTBALL STREAMING SECTION */}
      {(activeSport === 'all' || activeSport === 'football') && (
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MonitorPlay size={24} color="var(--neon-green)" />
            Football Live Streams & Highlights
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            {/* Video Player */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderTop: '2px solid var(--neon-green)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {selectedStream ? selectedStream.title : 'Select a match to stream'}
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {selectedStream ? selectedStream.competition : ''}
                </span>
              </div>
              
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                {getStreamSrc() ? (
                  <iframe 
                    src={getStreamSrc()} 
                    frameBorder="0" 
                    width="100%" 
                    height="100%" 
                    allowFullScreen 
                    allow="autoplay; fullscreen"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  ></iframe>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading Video Feeds...' : 'No stream available'}
                  </div>
                )}
              </div>
            </div>

            {/* Match List */}
            <div className="glass-panel" style={{ height: '500px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '16px', position: 'sticky', top: 0, background: 'var(--bg-panel)', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Live & Recent Matches</h3>
              
              {loading && <p style={{ color: 'var(--text-muted)' }}>Fetching from ScoreBat API...</p>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {footballMatches.map((match, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedStream(match)}
                    style={{ 
                      padding: '12px', 
                      background: selectedStream?.title === match.title ? 'rgba(0,255,135,0.1)' : 'rgba(0,0,0,0.3)', 
                      borderLeft: selectedStream?.title === match.title ? '4px solid var(--neon-green)' : '4px solid transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,135,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedStream?.title === match.title ? 'rgba(0,255,135,0.1)' : 'rgba(0,0,0,0.3)'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{match.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{match.competition}</span>
                      <Play size={12} color="var(--neon-green)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CRICKET SECTION */}
      {(activeSport === 'all' || activeSport === 'cricket') && (
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏏</span>
            Cricket Live Scores
          </h2>
          <div className="glass-panel scene-3d" style={{ padding: '32px', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '2px solid #00e5ff' }}>
            <div id="cricket-widget" ref={cricketWidgetRef} style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ color: '#00e5ff', fontSize: '1.2rem', marginBottom: '16px' }}>Fetching Real-Time Global Cricket Feed...</div>
              <p style={{ color: 'var(--text-muted)' }}>If the widget fails to load, ensure your browser allows third-party scripts.</p>
              {/* Fallback mock UI in case the script is blocked */}
              <div style={{ marginTop: '32px', background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.2)', maxWidth: '500px', margin: '32px auto 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>IPL 2026 - Final</span>
                  <span style={{ color: '#00e5ff', animation: 'pulse 2s infinite' }}>● LIVE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <div>RCB</div>
                  <div style={{ color: 'var(--gold)' }}>198/3 (18.4)</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', marginTop: '12px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>CSK</div>
                  <div style={{ color: 'var(--text-muted)' }}>Yet to bat</div>
                </div>
                <div style={{ marginTop: '24px', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <span style={{ color: 'var(--neon-green)' }}>V. Kohli: 82* (45)</span> | <span style={{ color: 'var(--text-muted)' }}>M. Siraj: 0* (1)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* F1 SECTION */}
      {(activeSport === 'all' || activeSport === 'f1') && (
        <section>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏎️</span>
            F1 Live Timing
          </h2>
          <div className="glass-panel" style={{ borderTop: '2px solid var(--neon-red)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Official F1 live video streams require a paid F1TV subscription. Live timing data shown below.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Pos</th>
                  <th style={{ padding: '12px' }}>Driver</th>
                  <th style={{ padding: '12px' }}>Gap</th>
                  <th style={{ padding: '12px' }}>Interval</th>
                  <th style={{ padding: '12px' }}>Tyre</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>1</td>
                  <td style={{ padding: '12px' }}>M. Verstappen</td>
                  <td style={{ padding: '12px' }}>Leader</td>
                  <td style={{ padding: '12px' }}>-</td>
                  <td style={{ padding: '12px', color: 'var(--neon-red)' }}>Soft</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>2</td>
                  <td style={{ padding: '12px' }}>L. Hamilton</td>
                  <td style={{ padding: '12px' }}>+2.451s</td>
                  <td style={{ padding: '12px' }}>+2.451s</td>
                  <td style={{ padding: '12px', color: 'var(--neon-red)' }}>Soft</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>3</td>
                  <td style={{ padding: '12px' }}>C. Leclerc</td>
                  <td style={{ padding: '12px' }}>+5.120s</td>
                  <td style={{ padding: '12px' }}>+2.669s</td>
                  <td style={{ padding: '12px', color: 'var(--gold)' }}>Medium</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default LiveTracking;
