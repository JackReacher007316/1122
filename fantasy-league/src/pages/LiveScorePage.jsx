import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Icon3D from '../components/Icon3D';
import { fetchSportScores, getScoreSummary, getSportById, getStatusLabel } from '../data/liveSports';

function DetailCard({ score, sport }) {
  const isLive = score.statusState === 'in';

  return (
    <div className="score-card" style={{ '--sport-color': sport.color }}>
      <div className="score-topline">
        <span className="sport-pill">
          <Icon3D color={sport.color} shape={sport.shape} size={24} active={isLive} />
          {score.competition}
        </span>
        <span className={`status-pill ${isLive ? 'is-live' : ''}`}>
          {score.statusText || getStatusLabel(score.statusState)}
        </span>
      </div>

      <div className="teams-row">
        <div className="team-name">{score.home}</div>
        <div className="score-number">{getScoreSummary(score)}</div>
        <div className="team-name">{score.away}</div>
      </div>

      <div className="score-meta">
        {score.venue || sport.sourceLabel}
        {score.date && (
          <>
            <br />
            {new Date(score.date).toLocaleString()}
          </>
        )}
      </div>

      {Array.isArray(score.innings) && score.innings.length > 0 && (
        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          {score.innings.map((inning, index) => (
            <div key={`${inning.inning}-${index}`} className="status-pill" style={{ justifyContent: 'space-between', borderRadius: 12 }}>
              <span>{inning.inning}</span>
              <strong>{inning.r}/{inning.w} ({inning.o})</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LiveScorePage({ fixedSport }) {
  const params = useParams();
  const navigate = useNavigate();
  const sportId = fixedSport || params.sport || 'football';
  const sport = getSportById(sportId);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadScores = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    fetchSportScores(sportId)
      .then((result) => {
        setGroup(result);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  }, [sportId]);

  useEffect(() => {
    let mounted = true;

    fetchSportScores(sportId)
      .then((result) => {
        if (!mounted) return;
        setGroup(result);
        setLastUpdated(new Date());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [sportId]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => loadScores(false), 30000);
    return () => clearInterval(id);
  }, [autoRefresh, loadScores]);

  const scores = useMemo(
    () =>
      (group?.scores || []).sort((a, b) => {
        const order = { in: 0, pre: 1, post: 2 };
        return (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1);
      }),
    [group]
  );

  const liveCount = scores.filter((score) => score.statusState === 'in').length;
  const upcomingCount = scores.filter((score) => score.statusState === 'pre').length;
  const finalCount = scores.filter((score) => score.statusState === 'post').length;

  return (
    <div className="page-shell">
      <div className="toolbar">
        <div>
          <button className="ghost-button" type="button" onClick={() => navigate('/live')} style={{ marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Back to live center
          </button>
          <div className="eyebrow" style={{ color: sport.color, borderColor: `${sport.color}55`, background: `${sport.color}16` }}>
            {sport.short} live scoreboard
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: 10 }}>
            {sport.label} in 3D focus.
          </h1>
          <p className="hero-copy">
            Auto-refreshing scorecards, live status, venues, and fallback data when a public feed is unavailable.
          </p>
        </div>

        <div className="hero-panel" style={{ width: 260, minHeight: 230, '--sport-color': sport.color }}>
          <div className="hero-panel-stage" style={{ display: 'grid', placeItems: 'center' }}>
            <Icon3D color={sport.color} shape={sport.shape} size={128} active />
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-actions">
          <button className="ghost-button" type="button" onClick={loadScores}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <label className="toggle-label">
            <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
            Auto refresh
          </label>
          <Link className="ghost-button" to="/live">
            All sports
          </Link>
        </div>
        <div className="section-note">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for first update'}
        </div>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Live', value: liveCount, color: '#20df7f' },
          { label: 'Upcoming', value: upcomingCount, color: '#4bb7ff' },
          { label: 'Final', value: finalCount, color: '#f2c94c' },
          { label: 'Source', value: group?.source === 'live' ? 'Live' : 'Demo', color: sport.color },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.45rem' : undefined }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <h2>{sport.label} Score Wall</h2>
        <span className="section-note">{scores.length} scorecards</span>
      </div>

      {loading && !scores.length ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Fetching {sport.label.toLowerCase()} scores...</div>
          </div>
        </div>
      ) : scores.length ? (
        <div className="score-grid">
          {scores.map((score) => (
            <DetailCard key={score.id} score={score} sport={sport} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No scorecards found for {sport.label} right now.</div>
      )}
    </div>
  );
}
