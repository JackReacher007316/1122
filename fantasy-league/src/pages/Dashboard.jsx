import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Radio } from 'lucide-react';
import Icon3D from '../components/Icon3D';
import SportTabs from '../components/SportTabs';
import { fetchAllScores, getScoreSummary, getSportById, SPORT_CATALOG } from '../data/liveSports';

const demoMatches = [
  {
    id: 'demo-f1',
    sport: 'f1',
    status: 'LIVE',
    teamA: 'Verstappen',
    teamB: 'Norris',
    contestCount: 54,
    prize: 'INR 65K',
    _count: { teams: 284 },
    deadline: new Date(Date.now() + 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'demo-football',
    sport: 'football',
    status: 'LIVE',
    teamA: 'FOFA Wolves',
    teamB: 'Nagpur City',
    contestCount: 48,
    prize: 'INR 42K',
    _count: { teams: 192 },
    deadline: new Date(Date.now() + 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'demo-cricket',
    sport: 'cricket',
    status: 'UPCOMING',
    teamA: 'CSK',
    teamB: 'RCB',
    contestCount: 78,
    prize: 'INR 95K',
    _count: { teams: 340 },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'demo-basketball',
    sport: 'basketball',
    status: 'LIVE',
    teamA: 'Raptors',
    teamB: 'Heat',
    contestCount: 39,
    prize: 'INR 36K',
    _count: { teams: 148 },
    deadline: new Date(Date.now() + 1000 * 60 * 24).toISOString(),
  },
];

function Countdown({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) {
        setTimeLeft('Racing Now');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return <span>{timeLeft}</span>;
}

function sportMeta(sportId) {
  return SPORT_CATALOG.find((sport) => sport.id === sportId) || {
    id: sportId,
    label: sportId || 'Sport',
    color: '#5d2a8f',
    shape: 'default',
  };
}

function ScorePreview({ score }) {
  const sport = getSportById(score.sportId);
  const statusClass = score.statusState === 'in' ? 'is-live' : '';

  return (
    <div className="score-card" style={{ '--sport-color': sport.color }}>
      <div className="score-topline">
        <span className="sport-pill">
          <Icon3D color={sport.color} shape={sport.shape} size={24} active={score.statusState === 'in'} />
          {sport.label}
        </span>
        <span className={`status-pill ${statusClass}`}>{score.statusText || 'Scheduled'}</span>
      </div>

      <div className="teams-row">
        <div className="team-name">{score.home}</div>
        <div className="score-number">{getScoreSummary(score)}</div>
        <div className="team-name">{score.away}</div>
      </div>

      <div className="score-meta">
        <strong>{score.competition}</strong>
        <br />
        {score.venue || 'Pitlane live telemetry'}
      </div>
    </div>
  );
}

function MatchCard({ match, index, navigate }) {
  const sport = sportMeta(match.sport);
  const isLive = match.status === 'LIVE';
  const completed = match.status === 'COMPLETED';
  const isDemo = String(match.id).startsWith('demo-');
  const destination = isDemo ? `/live/${match.sport}` : `/match/${match.id}`;

  return (
    <button
      type="button"
      className="match-card"
      style={{ '--sport-color': sport.color, animationDelay: `${index * 70}ms` }}
      onClick={() => navigate(destination)}
    >
      <div>
        <div className="score-topline">
          <span className="sport-pill">
            <Icon3D color={sport.color} shape={sport.shape} size={24} active={isLive} />
            {sport.label}
          </span>
          {isLive && <span className="live-badge">Live</span>}
        </div>
        <div className="match-title">
          {match.teamA} vs {match.teamB}
        </div>
        <div className="match-subtitle">
          {completed ? 'Final standings' : isLive ? 'Telemetry updates in the live center' : <>Green light in <Countdown deadline={match.deadline} /></>}
        </div>
      </div>

      <div className="prize-block">
        <small>Contest Prize</small>
        <strong>{match.prize}</strong>
        <div className="match-subtitle" style={{ marginTop: 8 }}>
          {match.contestCount || 0} pools, {match._count?.teams || 0} teams registered
        </div>
      </div>
    </button>
  );
}

export default function Dashboard({ activeSport, setActiveSport }) {
  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    fetch('/api/matches')
      .then((response) => response.json())
      .then((data) => {
        if (!mounted) return;
        setMatches(Array.isArray(data) && data.length ? data : demoMatches);
      })
      .catch(() => {
        if (mounted) setMatches(demoMatches);
      })
      .finally(() => {
        if (mounted) setLoadingMatches(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadScores = () => {
      fetchAllScores()
        .then((groups) => {
          if (!mounted) return;
          // Sort to put F1 telemetry first if possible
          const sortedScores = groups.flatMap((group) => group.scores).sort((a, b) => {
            if (a.sportId === 'f1') return -1;
            if (b.sportId === 'f1') return 1;
            return 0;
          });
          setScores(sortedScores);
        })
        .finally(() => {
          if (mounted) setLoadingScores(false);
        });
    };

    loadScores();
    const id = setInterval(loadScores, 30000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const filteredMatches = activeSport === 'all' ? matches : matches.filter((match) => match.sport === activeSport);
  const liveMatches = filteredMatches.filter((match) => match.status === 'LIVE');
  const upcomingMatches = filteredMatches.filter((match) => match.status === 'UPCOMING');
  const completedMatches = filteredMatches.filter((match) => match.status === 'COMPLETED');
  const liveScores = scores.filter((score) => activeSport === 'all' || score.sportId === activeSport);

  const stats = useMemo(
    () => [
      { label: 'Live telemetry', value: scores.filter((score) => score.statusState === 'in').length + ' feeds', color: '#00c0f9' },
      { label: 'Championships', value: SPORT_CATALOG.length, color: '#5d2a8f' },
      { label: 'Grand Prix entries', value: matches.reduce((sum, match) => sum + (match.contestCount || 0), 0) + ' pools', color: '#ffffff' },
      { label: 'Prize pool', value: 'INR 2.5L+', color: '#f3c623' },
    ],
    [matches, scores]
  );

  return (
    <div className="page-shell">
      <section className="hero-layout">
        <div>
          <div className="eyebrow">
            <Radio size={15} />
            Monaco Grand Prix • Real Madrid Edition
          </div>
          <h1 className="hero-title">
            Royal Victory. <span>Monaco Speed.</span>
          </h1>
          <p className="hero-copy">
            Experience the legendary Monaco Street Circuit in high-fidelity 4D telemetry. Build your dream garage with Real Madrid precision, track live football matches, and command the pit lane.
          </p>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-stage">
            <div className="hero-score-chip">
              <div>
                <strong>{liveScores[0]?.home || 'Verstappen'} vs {liveScores[0]?.away || 'Norris'}</strong>
                <small>{liveScores[0]?.competition || 'Monaco Grand Prix Telemetry'}</small>
              </div>
              <b>{liveScores[0] ? getScoreSummary(liveScores[0]) : 'P1 vs P2'}</b>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <div className="section-head">
        <h2>Casino Corner Telemetry Wall</h2>
        <button className="ghost-button" type="button" onClick={() => navigate('/live')}>
          Pit Command Center <ArrowRight size={16} />
        </button>
      </div>

      {loadingScores ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Receiving telemetry data...</div>
          </div>
        </div>
      ) : liveScores.length ? (
        <div className="score-grid">
          {liveScores.slice(0, 6).map((score) => (
            <ScorePreview key={score.id} score={score} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No live telemetry available for this track right now.</div>
      )}

      <div className="section-head">
        <h2>Monaco GP Pools</h2>
        <span className="section-note">{filteredMatches.length} events active</span>
      </div>

      {loadingMatches ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Loading pit board...</div>
          </div>
        </div>
      ) : (
        <>
          {liveMatches.length > 0 && (
            <section>
              <div className="section-head">
                <h2>Cars on Track</h2>
                <span className="live-badge">Live</span>
              </div>
              <div className="match-list">
                {liveMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {upcomingMatches.length > 0 && (
            <section>
              <div className="section-head">
                <h2>Qualifying & Warmups</h2>
                <span className="section-note">Tune cars before lock</span>
              </div>
              <div className="match-list">
                {upcomingMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {completedMatches.length > 0 && (
            <section>
              <div className="section-head">
                <h2>Official Podium Results</h2>
                <span className="section-note">Review podium and points</span>
              </div>
              <div className="match-list">
                {completedMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {!filteredMatches.length && <div className="empty-state">No fantasy contests scheduled for this Grand Prix.</div>}
        </>
      )}
    </div>
  );
}
