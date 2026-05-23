import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Award, Radio, Tv, Sparkles, TrendingUp } from 'lucide-react';
import SportTabs from '../components/SportTabs';
import { fetchAllScores, getScoreSummary, SPORT_CATALOG } from '../data/liveSports';

// Helper to determine team strength deterministically based on name hash
const getTeamStrength = (name) => {
  if (!name) return 50;
  let score = 0;
  for (let i = 0; i < name.length; i++) {
    score += name.charCodeAt(i);
  }
  return (score % 30) + 60; // 60 to 90 range
};

// Winning Prediction Calculator
const calculatePrediction = (score) => {
  const isLive = score.statusState === 'in';
  
  if (score.sportId === 'f1') {
    // F1 driver predictions
    return {
      type: 'racing',
      candidates: [
        { name: score.home || 'Verstappen', probability: isLive ? 68 : 55, color: '#1f80e0' },
        { name: score.away || 'Norris', probability: isLive ? 22 : 25, color: '#f3c623' },
        { name: 'Leclerc', probability: isLive ? 10 : 20, color: '#ff2e55' }
      ]
    };
  }

  // Parse scores for team sports (cricket, football, basketball)
  const homeStr = String(score.homeScore || '0');
  const awayStr = String(score.awayScore || '0');
  const homeVal = parseInt(homeStr.replace(/\D/g, '')) || 0;
  const awayVal = parseInt(awayStr.replace(/\D/g, '')) || 0;

  const strengthHome = getTeamStrength(score.home);
  const strengthAway = getTeamStrength(score.away);

  if (isLive) {
    const scoreDiff = homeVal - awayVal;
    let homeProb = Math.max(10, Math.min(90, 50 + (scoreDiff * 15) + (strengthHome - strengthAway) / 2));
    let awayProb = 100 - homeProb;

    return {
      type: 'match',
      homeProb: Math.round(homeProb),
      awayProb: Math.round(awayProb),
      homeName: score.home,
      awayName: score.away
    };
  } else {
    // Scheduled pre-match prediction
    const totalStrength = strengthHome + strengthAway;
    const homeProb = Math.round((strengthHome / totalStrength) * 100);
    const awayProb = 100 - homeProb;

    return {
      type: 'match',
      homeProb,
      awayProb,
      homeName: score.home,
      awayName: score.away
    };
  }
};

const Leaderboard = ({ activeSport, setActiveSport }) => {
  const [topThree, setTopThree] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loadingStandings, setLoadingStandings] = useState(true);

  // ESPN scores and predictions state
  const [espnScores, setEspnScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);

  // Load standings
  useEffect(() => {
    setLoadingStandings(true);
    fetch(`/api/leaderboard?sport=${activeSport}`)
      .then(res => res.json())
      .then(data => {
        setTopThree(data.topThree || []);
        setRankings(data.rankings || []);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
      })
      .finally(() => {
        setLoadingStandings(false);
      });
  }, [activeSport]);

  // Load ESPN live telemetry scores
  const loadEspnScores = useCallback(() => {
    fetchAllScores()
      .then((groups) => {
        const sortedScores = groups.flatMap((group) => group.scores);
        setEspnScores(sortedScores);
      })
      .catch(err => {
        console.error("Failed to fetch ESPN data:", err);
      })
      .finally(() => {
        setLoadingScores(false);
      });
  }, []);

  useEffect(() => {
    loadEspnScores();
    const interval = setInterval(loadEspnScores, 30000);
    return () => clearInterval(interval);
  }, [loadEspnScores]);

  // Filter scores by active sport tab
  const filteredScores = espnScores.filter(score => activeSport === 'all' || score.sportId === activeSport);

  return (
    <div className="page-shell" style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header banner */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f80e0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Trophy size={16} />
          FOFA CHAMPIONSHIP ARENA
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0 12px', color: '#ffffff' }}>
          Global Standings
        </h1>
        <p style={{ color: '#8f98a9', fontSize: '0.95rem', margin: 0 }}>
          Real-time manager rankings compared side-by-side with live ESPN sports match predictions.
        </p>
      </section>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* Main Two-Column Layout */}
      <div className="live-stream-layout has-sidebar" style={{ marginTop: '24px' }}>
        
        {/* LEFT COLUMN: Manager Standings */}
        <div>
          {loadingStandings ? (
            <div className="loading-state" style={{ minHeight: '300px' }}>
              <div>
                <div className="loading-spinner" />
                <div>Computing manager ranks...</div>
              </div>
            </div>
          ) : (
            <>
              {/* Ranks 1, 2, 3 podium */}
              {topThree.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '40px',
                  height: '240px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  padding: '24px 12px 0 12px'
                }}>
                  {topThree.map((user) => {
                    const avatarBg = user.rank === 1 ? '#f3c623' : user.rank === 2 ? '#b0b5c0' : '#cd7f32';
                    return (
                      <div 
                        key={user.rank} 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          width: '120px'
                        }}
                      >
                        {/* Avatar bubble */}
                        <div style={{ 
                          background: '#0c111b',
                          border: `2px solid ${avatarBg}`,
                          borderRadius: '50%',
                          width: '64px', height: '64px',
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          marginBottom: '12px',
                          boxShadow: `0 0 15px ${avatarBg}30`,
                          position: 'relative'
                        }}>
                          <span style={{ fontSize: '1.4rem' }}>
                            {user.theme === 'football' ? '⚽' : user.theme === 'f1' ? '🏎️' : user.theme === 'cricket' ? '🏏' : '🎮'}
                          </span>
                          <div style={{
                            position: 'absolute', bottom: '-6px',
                            background: avatarBg, color: '#030b17',
                            width: '20px', height: '20px', borderRadius: '50%',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontWeight: 'bold', fontSize: '0.75rem'
                          }}>
                            {user.rank}
                          </div>
                        </div>
                        
                        {/* Podium column block */}
                        <div style={{ 
                          background: `linear-gradient(to top, rgba(31, 128, 224, 0.15) 0%, rgba(12, 17, 27, 0.8) 100%)`,
                          border: `1px solid rgba(255, 255, 255, 0.05)`,
                          borderBottom: 'none',
                          width: '100%',
                          height: user.rank === 1 ? '120px' : user.rank === 2 ? '90px' : '70px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px',
                          borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
                        }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#ffffff', textAlign: 'center', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                            {user.name}
                          </div>
                          <div style={{ color: '#f3c623', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '6px' }}>
                            {user.points} pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ranks list table */}
              <div className="glass-panel" style={{ padding: '0 16px' }}>
                {rankings.length === 0 && topThree.length === 0 ? (
                  <div className="empty-state">No user rankings found for this category.</div>
                ) : (
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Manager</th>
                        <th style={{ textAlign: 'right' }}>Total Points</th>
                        <th style={{ textAlign: 'center' }}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map(row => (
                        <tr key={row.rank}>
                          <td style={{ fontWeight: 'bold', color: '#ffffff' }}>#{row.rank}</td>
                          <td>{row.name}</td>
                          <td style={{ textAlign: 'right', color: '#f3c623', fontWeight: 600 }}>{row.points}</td>
                          <td style={{ textAlign: 'center' }}>
                            {row.trend === 'up' && <span style={{ color: '#27d06d' }}>▲</span>}
                            {row.trend === 'down' && <span style={{ color: '#ff2e55' }}>▼</span>}
                            {row.trend === 'same' && <span style={{ color: '#8f98a9' }}>-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: ESPN Live Predictions Sidebar */}
        <div className="live-chat-panel" style={{ height: 'auto', minHeight: '480px' }}>
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="#ff2e55" style={{ animation: 'pulse 1.5s infinite' }} />
              <h3>ESPN Live Predictor</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#1f80e0', fontWeight: 600 }}>
              Live Ratios
            </span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', maxHeight: '580px' }}>
            {loadingScores ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8f98a9' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '0.85rem' }}>Loading predictions...</span>
              </div>
            ) : filteredScores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: '#8f98a9', fontSize: '0.85rem' }}>
                <Tv size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No active ESPN matches found for this filter.</p>
              </div>
            ) : (
              filteredScores.slice(0, 5).map((score) => {
                const pred = calculatePrediction(score);
                const isLive = score.statusState === 'in';
                
                return (
                  <div 
                    key={score.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      padding: '12px'
                    }}
                  >
                    {/* Top score info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8f98a9', marginBottom: '8px' }}>
                      <span>{score.competition}</span>
                      <span style={{ 
                        color: isLive ? '#ff2e55' : '#1f80e0', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        {isLive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff2e55', display: 'inline-block' }} />}
                        {isLive ? 'LIVE' : 'UPCOMING'}
                      </span>
                    </div>

                    {/* Team names and current score */}
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', marginBottom: '12px' }}>
                      <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{score.home}</span>
                      <span style={{ color: '#1f80e0' }}>{getScoreSummary(score)}</span>
                      <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{score.away}</span>
                    </div>

                    {/* Win predictor bar */}
                    {pred.type === 'match' ? (
                      <div>
                        {/* Prediction values */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                          <span style={{ color: '#1f80e0' }}>Win Prob: {pred.homeProb}%</span>
                          <span style={{ color: '#f3c623' }}>Win Prob: {pred.awayProb}%</span>
                        </div>
                        {/* Double progress bar */}
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${pred.homeProb}%`, height: '100%', background: '#1f80e0', transition: 'width 0.5s' }} />
                          <div style={{ width: `${pred.awayProb}%`, height: '100%', background: '#f3c623', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8f98a9' }}>Podium Probability:</div>
                        {pred.candidates.map((cand, idx) => (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#ffffff', marginBottom: '2px' }}>
                              <span>{cand.name}</span>
                              <span>{cand.probability}%</span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ width: `${cand.probability}%`, height: '100%', background: cand.color, transition: 'width 0.5s' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div style={{ 
              marginTop: '8px', 
              padding: '10px', 
              background: 'rgba(31, 128, 224, 0.05)', 
              border: '1px dashed rgba(31, 128, 224, 0.2)', 
              borderRadius: '6px', 
              fontSize: '0.72rem', 
              color: '#8f98a9',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={12} color="#f3c623" />
              <span>Predictions use ESPN telemetry, match score offsets, and simulated team strength indices.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
