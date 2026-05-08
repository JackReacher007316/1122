import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Radio } from 'lucide-react';
import Icon3D from '../components/Icon3D';
import SportTabs from '../components/SportTabs';
import { fetchAllScores, getScoreSummary, getSportById, SPORT_CATALOG } from '../data/liveSports';

const demoMatches = [
  {
    id: 'demo-football',
    sport: 'football',
    status: 'LIVE',
    teamA: 'IIITN Wolves',
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
    id: 'demo-f1',
    sport: 'f1',
    status: 'UPCOMING',
    teamA: 'Verstappen',
    teamB: 'Norris',
    contestCount: 31,
    prize: 'INR 28K',
    _count: { teams: 116 },
    deadline: new Date(Date.now() + 1000 * 60 * 88).toISOString(),
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
        setTimeLeft('Starting');
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
    color: '#9b7bff',
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
        {score.venue || 'Global sports feed'}
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
          {completed ? 'Final contest' : isLive ? 'Scores updating in the live center' : <>Starts in <Countdown deadline={match.deadline} /></>}
        </div>
      </div>

      <div className="prize-block">
        <small>Prize pool</small>
        <strong>{match.prize}</strong>
        <div className="match-subtitle" style={{ marginTop: 8 }}>
          {match.contestCount || 0} contests, {match._count?.teams || 0} teams
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
          setScores(groups.flatMap((group) => group.scores.slice(0, 1)));
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
      { label: 'Live feeds', value: scores.filter((score) => score.statusState === 'in').length, color: '#20df7f' },
      { label: 'Sports covered', value: SPORT_CATALOG.length, color: '#4bb7ff' },
      { label: 'Fantasy contests', value: matches.reduce((sum, match) => sum + (match.contestCount || 0), 0), color: '#ff8a1c' },
      { label: 'Prize pool', value: 'INR 1.5L+', color: '#f2c94c' },
    ],
    [matches, scores]
  );

  return (
    <div className="page-shell">
      <section className="hero-layout">
        <div>
          <div className="eyebrow">
            <Radio size={15} />
            3D live sports command center
          </div>
          <h1 className="hero-title">
            Every sport. Every score. <span>In motion.</span>
          </h1>
          <p className="hero-copy">
            A full 3D fantasy arena for football, cricket, basketball, F1, tennis, baseball, hockey, and NFL action with live score cards that refresh while you play.
          </p>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-stage">
            <div className="hero-score-chip">
              <div>
                <strong>{liveScores[0]?.home || 'IIITN Wolves'} vs {liveScores[0]?.away || 'Nagpur City'}</strong>
                <small>{liveScores[0]?.competition || 'Live arena broadcast'}</small>
              </div>
              <b>{liveScores[0] ? getScoreSummary(liveScores[0]) : '2 - 1'}</b>
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
        <h2>Live Score Wall</h2>
        <button className="ghost-button" type="button" onClick={() => navigate('/live')}>
          Full live center <ArrowRight size={16} />
        </button>
      </div>

      {loadingScores ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Finding live scores...</div>
          </div>
        </div>
      ) : liveScores.length ? (
        <div className="score-grid">
          {liveScores.slice(0, 6).map((score) => (
            <ScorePreview key={score.id} score={score} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No scorecards for this sport right now.</div>
      )}

      <div className="section-head">
        <h2>Fantasy Matches</h2>
        <span className="section-note">{filteredMatches.length} contests available</span>
      </div>

      {loadingMatches ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Loading matches...</div>
          </div>
        </div>
      ) : (
        <>
          {liveMatches.length > 0 && (
            <section>
              <div className="section-head">
                <h2>Live Now</h2>
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
                <h2>Upcoming</h2>
                <span className="section-note">Build teams before lock</span>
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
                <h2>Completed</h2>
                <span className="section-note">Review results</span>
              </div>
              <div className="match-list">
                {completedMatches.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {!filteredMatches.length && <div className="empty-state">No fantasy matches for this sport yet.</div>}
        </>
      )}
    </div>
  );
}
