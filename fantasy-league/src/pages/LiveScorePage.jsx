import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Flag, PlayCircle, Tv } from 'lucide-react';
import { fetchSportScores, getScoreSummary, getSportById, getStatusLabel } from '../data/liveSports';

function getSportIcon(sportId, size = 16) {
  if (sportId === 'cricket') return <Trophy size={size} style={{ color: '#a855f7' }} />;
  if (sportId === 'f1') return <Flag size={size} style={{ color: '#ff314a' }} />;
  if (sportId === 'football') return <PlayCircle size={size} style={{ color: '#00c0f9' }} />;
  return <Tv size={size} />;
}

function DetailCard({ score, sport }) {
  const isLive = score.statusState === 'in';

  return (
    <div className="score-card">
      <div className="score-topline">
        <span className="sport-pill">
          {getSportIcon(score.sportId, 16)}
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
            <div key={`${inning.inning}-${index}`} className="status-pill" style={{ justifyContent: 'space-between', borderRadius: 6, padding: '4px 10px' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
        <div>
          <button className="ghost-button" type="button" onClick={() => navigate('/live')} style={{ marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Back to live center
          </button>
          <div className="eyebrow" style={{ color: '#1f80e0' }}>
            {sport.short.toUpperCase()} Live Scoreboard
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: 10, color: '#ffffff' }}>
            {sport.label} Live Telemetry
          </h1>
          <p className="hero-copy">
            Auto-refreshing scorecards, live status, venues, and public stream partner data integrations.
          </p>
        </div>

        <div style={{
          width: 240, 
          height: 180,
          background: 'rgba(31, 128, 224, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          display: 'grid',
          placeItems: 'center'
        }}>
          {getSportIcon(sportId, 72)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="ghost-button" type="button" onClick={loadScores}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <label className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#8f98a9', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
            Auto refresh
          </label>
        </div>
        <div className="section-note">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for first update'}
        </div>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Live Now', value: liveCount, color: '#ff2e55' },
          { label: 'Upcoming', value: upcomingCount, color: '#1f80e0' },
          { label: 'Completed', value: finalCount, color: '#f3c623' },
          { label: 'Source Feed', value: group?.source === 'live' ? 'ESPN Stream' : 'Demo Mode', color: '#ffffff' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.35rem' : undefined }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <h2>{sport.label} matches</h2>
        <span className="section-note">{scores.length} events found</span>
      </div>

      {loading && !scores.length ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Fetching scores...</div>
          </div>
        </div>
      ) : scores.length ? (
        <div className="score-grid" style={{ flexWrap: 'wrap', overflowX: 'visible' }}>
          {scores.map((score) => (
            <DetailCard key={score.id} score={score} sport={sport} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No active matches found for {sport.label}.</div>
      )}
    </div>
  );
}
