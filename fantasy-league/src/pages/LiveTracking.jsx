import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Icon3D from '../components/Icon3D';
import SportTabs from '../components/SportTabs';
import { fetchAllScores, getScoreSummary, SPORT_CATALOG } from '../data/liveSports';

function ScoreCard({ score, onOpen }) {
  const sport = SPORT_CATALOG.find((item) => item.id === score.sportId) || SPORT_CATALOG[0];
  const isLive = score.statusState === 'in';

  return (
    <button type="button" className="score-card" style={{ '--sport-color': sport.color }} onClick={onOpen}>
      <div className="score-topline">
        <span className="sport-pill">
          <Icon3D color={sport.color} shape={sport.shape} size={24} active={isLive} />
          {sport.label}
        </span>
        <span className={`status-pill ${isLive ? 'is-live' : ''}`}>{score.statusText || 'Scheduled'}</span>
      </div>

      <div className="teams-row">
        <div className="team-name">{score.home}</div>
        <div className="score-number">{getScoreSummary(score)}</div>
        <div className="team-name">{score.away}</div>
      </div>

      <div className="score-meta">
        <strong>{score.competition}</strong>
        <br />
        {score.venue || sport.sourceLabel}
      </div>

      <span className="card-action">
        Open sport <ArrowRight size={15} />
      </span>
    </button>
  );
}

function HubCard({ group, onOpen }) {
  const live = group.scores.filter((score) => score.statusState === 'in').length;
  const upcoming = group.scores.filter((score) => score.statusState === 'pre').length;
  const final = group.scores.filter((score) => score.statusState === 'post').length;

  return (
    <button type="button" className="sport-hub-card" style={{ '--sport-color': group.sport.color }} onClick={onOpen}>
      <div className="sport-hub-title">
        <Icon3D color={group.sport.color} shape={group.sport.shape} size={34} active={live > 0} />
        {group.sport.label}
      </div>
      <div className="sport-hub-stat">{group.scores.length}</div>
      <div className="score-meta">
        {live} live, {upcoming} upcoming, {final} final
        <br />
        Source: {group.source === 'live' ? group.sport.sourceLabel : 'demo fallback'}
      </div>
    </button>
  );
}

export default function LiveTracking({ activeSport, setActiveSport }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadScores = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    fetchAllScores()
      .then((results) => {
        setGroups(results);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchAllScores()
      .then((results) => {
        if (!mounted) return;
        setGroups(results);
        setLastUpdated(new Date());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => loadScores(false), 30000);
    return () => clearInterval(id);
  }, [autoRefresh, loadScores]);

  const visibleGroups = activeSport === 'all' ? groups : groups.filter((group) => group.sport.id === activeSport);
  const allScores = visibleGroups
    .flatMap((group) => group.scores)
    .sort((a, b) => {
      const order = { in: 0, pre: 1, post: 2 };
      return (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1);
    });

  const totals = useMemo(
    () => ({
      live: allScores.filter((score) => score.statusState === 'in').length,
      upcoming: allScores.filter((score) => score.statusState === 'pre').length,
      final: allScores.filter((score) => score.statusState === 'post').length,
    }),
    [allScores]
  );

  return (
    <div className="page-shell">
      <div className="toolbar">
        <div>
          <div className="eyebrow">All sports live desk</div>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: 10 }}>
            Live scores that keep moving.
          </h1>
          <p className="hero-copy">
            Scores refresh every 30 seconds across football, cricket, basketball, F1, tennis, baseball, hockey, and NFL.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="ghost-button" type="button" onClick={loadScores}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <label className="toggle-label">
            <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
            Auto refresh
          </label>
        </div>
      </div>

      {lastUpdated && <div className="section-note" style={{ marginBottom: 16 }}>Last updated {lastUpdated.toLocaleTimeString()}</div>}

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <div className="stat-grid">
        {[
          { label: 'Live now', value: totals.live, color: '#20df7f' },
          { label: 'Upcoming', value: totals.upcoming, color: '#4bb7ff' },
          { label: 'Final', value: totals.final, color: '#f2c94c' },
          { label: 'Sports', value: visibleGroups.length, color: '#ff8a1c' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {loading && !groups.length ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Collecting scoreboards...</div>
          </div>
        </div>
      ) : (
        <>
          <div className="section-head">
            <h2>Sports Hub</h2>
            <span className="section-note">Choose one for a full score page</span>
          </div>
          <div className="hub-grid">
            {visibleGroups.map((group) => (
              <HubCard key={group.sport.id} group={group} onOpen={() => navigate(`/live/${group.sport.id}`)} />
            ))}
          </div>

          <div className="section-head">
            <h2>Score Wall</h2>
            <span className="section-note">{allScores.length} cards</span>
          </div>

          {allScores.length ? (
            <div className="score-grid">
              {allScores.map((score) => (
                <ScoreCard key={score.id} score={score} onOpen={() => navigate(`/live/${score.sportId}`)} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No scorecards available for this filter.</div>
          )}
        </>
      )}
    </div>
  );
}
