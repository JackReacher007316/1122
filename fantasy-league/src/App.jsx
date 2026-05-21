import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Background3D from './components/Background3D';
import Chatbot from './components/Chatbot';
import Icon3D from './components/Icon3D';
import WelcomeAnimation from './components/WelcomeAnimation';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CreateTeam = React.lazy(() => import('./pages/CreateTeam'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const LiveTracking = React.lazy(() => import('./pages/LiveTracking'));
const LiveScorePage = React.lazy(() => import('./pages/LiveScorePage'));
const MatchDetail = React.lazy(() => import('./pages/MatchDetail'));
const WatchParty = React.lazy(() => import('./pages/WatchParty'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Presentation = React.lazy(() => import('./pages/Presentation'));
const FootballLive = React.lazy(() => import('./pages/FootballLive'));

function PageLoader() {
  return (
    <div className="loading-state">
      <div>
        <div className="loading-spinner" />
        <div>Warming up engines...</div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, token }) {
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function isActivePath(locationPath, itemPath) {
  if (itemPath === '/') return locationPath === '/';
  return locationPath === itemPath || locationPath.startsWith(`${itemPath}/`);
}

function Sidebar({ setToken }) {
  const location = useLocation();
  const userStr = localStorage.getItem('fantasy_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [hovered, setHovered] = useState(null);

  const navItems = [
    { path: '/', label: 'Paddock', color: '#ffffff', shape: 'f1' },
    { path: '/live', label: 'Race Control', color: '#00c0f9', shape: 'live', live: true },
    { path: '/live/football', label: 'Football', color: '#5d2a8f', shape: 'football' },
    { path: '/live/basketball', label: 'Basketball', color: '#f3c623', shape: 'basketball' },
    { path: '/create-team', label: 'Garage', color: '#f3c623', shape: 'shield' },
    { path: '/leaderboard', label: 'Championship', color: '#ffffff', shape: 'default' },
    { path: '/watch-party', label: 'Team Radio', color: '#5d2a8f', shape: 'live' },
    { path: '/admin', label: 'Race Engineer', color: '#00c0f9', shape: 'shield' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('fantasy_token');
    localStorage.removeItem('fantasy_user');
    setToken(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Icon3D color="#5d2a8f" shape="f1" size={42} active />
        </div>
        <div className="brand-title">FOFA Monaco GP</div>
        <div className="brand-subtitle">Real Madrid Edition</div>
      </div>

      <div className="nav-section-label">Race menu</div>
      <nav className="nav-list" aria-label="Primary">
        {navItems.map((item) => {
          const active = isActivePath(location.pathname, item.path);
          const isHovered = hovered === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${active ? 'is-active' : ''}`}
              onMouseEnter={() => setHovered(item.path)}
              onMouseLeave={() => setHovered(null)}
            >
              <Icon3D color={item.color} shape={item.shape} size={30} active={active} hovered={isHovered} />
              <span>{item.label}</span>
              {item.live && <span className="live-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="user-strip">
        <div className="user-avatar">{(user?.username || 'P').slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="user-name">{user?.username || 'Pilot'}</div>
          <div className="user-role">Madridista Director</div>
        </div>
        <button className="icon-button" type="button" title="Logout" onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

function FloatingNav() {
  const location = useLocation();
  const links = [
    { path: '/', label: 'Paddock' },
    { path: '/live', label: 'Race Ctrl' },
    { path: '/live/football', label: 'Football' },
    { path: '/create-team', label: 'Garage' },
    { path: '/leaderboard', label: 'Standings' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {links.map((link) => (
        <Link key={link.path} to={link.path} className={isActivePath(location.pathname, link.path) ? 'is-active' : ''}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function AppRoutes({ activeSport, setActiveSport, token }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard activeSport={activeSport} setActiveSport={setActiveSport} />} />
      <Route path="/football" element={<FootballLive />} />
      <Route path="/live/football" element={<FootballLive />} />
      <Route path="/match/:id" element={<MatchDetail />} />
      <Route path="/live" element={<LiveTracking activeSport={activeSport} setActiveSport={setActiveSport} />} />
      <Route path="/live/:sport" element={<LiveScorePage />} />
      <Route path="/watch-party" element={<WatchParty activeSport={activeSport} setActiveSport={setActiveSport} />} />
      <Route path="/leaderboard" element={<Leaderboard activeSport={activeSport} setActiveSport={setActiveSport} />} />
      <Route
        path="/create-team"
        element={
          <ProtectedRoute token={token}>
            <CreateTeam activeSport={activeSport} setActiveSport={setActiveSport} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute token={token}>
            <AdminPanel activeSport={activeSport} setActiveSport={setActiveSport} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [activeSport, setActiveSport] = useState('f1');
  const [token, setToken] = useState(localStorage.getItem('fantasy_token'));

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('fantasy_token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <Background3D />
      <WelcomeAnimation />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<Auth setToken={setToken} />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route
            path="/*"
            element={
              <div className="app-container">
                <Sidebar setToken={setToken} />
                <main className="main-content">
                  <AppRoutes activeSport={activeSport} setActiveSport={setActiveSport} token={token} />
                </main>
                <FloatingNav />
                <Chatbot />
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
