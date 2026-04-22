import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, LayoutDashboard, Trophy, Settings, Activity, MonitorPlay } from 'lucide-react';
import DynamicBackground from './components/DynamicBackground';
import ParticleEffects from './components/ParticleEffects';
import WelcomeAnimation from './components/WelcomeAnimation';
import Chatbot from './components/Chatbot';

// Lazy loading pages for performance optimization
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CreateTeam = React.lazy(() => import('./pages/CreateTeam'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const LiveTracking = React.lazy(() => import('./pages/LiveTracking'));
const WatchParty = React.lazy(() => import('./pages/WatchParty'));
const Auth = React.lazy(() => import('./pages/Auth'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,16,122,0.3)', borderTopColor: 'var(--neon-pink)', animation: 'spin 1s linear infinite' }}></div>
    <span style={{ color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', letterSpacing: '2px' }}>INITIALIZING...</span>
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, token }) => {
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Sidebar Navigation Component
const Sidebar = ({ setToken }) => {
  const location = useLocation();
  const userStr = localStorage.getItem('fantasy_user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/live', name: 'Live Tracking', icon: <Activity size={20} color="var(--neon-red)" /> },
    { path: '/watch-party', name: 'Watch Party', icon: <MonitorPlay size={20} color="#00e5ff" /> },
    { path: '/create-team', name: 'Draft Team', icon: <Users size={20} /> },
    { path: '/leaderboard', name: 'Leaderboard', icon: <Trophy size={20} /> },
    { path: '/admin', name: 'Admin', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('fantasy_token');
    localStorage.removeItem('fantasy_user');
    setToken(null);
  };

  return (
    <div className="sidebar glass-panel" style={{ 
      width: '250px', 
      margin: '32px 0 32px 32px', 
      display: 'flex', 
      flexDirection: 'column',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 'none',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="logo" style={{ marginBottom: '48px', padding: '0 12px' }}>
        <h2 className="heading-gradient" style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>IIITN</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Streaming Platform</span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: isActive ? '#fff' : 'var(--text-muted)',
                textDecoration: 'none',
                borderRadius: '8px',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--neon-pink)' : '3px solid transparent',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged in as:</div>
          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>{user?.username || 'Manager'}</div>
          <button onClick={handleLogout} style={{ marginTop: '12px', width: '100%', padding: '8px', background: 'transparent', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>

        <div style={{ padding: '16px', background: 'rgba(255,16,122,0.1)', borderRadius: '8px', border: '1px solid rgba(255,16,122,0.2)' }}>
          <h4 style={{ color: 'var(--neon-pink)', fontSize: '0.8rem', marginBottom: '8px' }}>SYSTEM STATUS</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-pink)', boxShadow: '0 0 10px var(--neon-pink)', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>All Systems Go</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

function App() {
  const [activeSport, setActiveSport] = useState('all');
  const [token, setToken] = useState(localStorage.getItem('fantasy_token'));

  // Update token state if local storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('fantasy_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <WelcomeAnimation />
      <DynamicBackground activeSport={activeSport} />
      <ParticleEffects type={activeSport === 'f1' || activeSport === 'hackathon' ? 'sparks' : 'sakura'} />
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<Auth setToken={setToken} />} />
          
          <Route path="/*" element={
            <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
              <Sidebar setToken={setToken} />
              <main className="main-content">
                <Routes>
                  {/* Publicly Visible Pages */}
                  <Route path="/" element={<Dashboard activeSport={activeSport} setActiveSport={setActiveSport} />} />
                  <Route path="/live" element={<LiveTracking activeSport={activeSport} setActiveSport={setActiveSport} />} />
                  <Route path="/watch-party" element={<WatchParty activeSport={activeSport} setActiveSport={setActiveSport} />} />
                  <Route path="/leaderboard" element={<Leaderboard activeSport={activeSport} setActiveSport={setActiveSport} />} />
                  
                  {/* Protected Pages (Require Login) */}
                  <Route path="/create-team" element={
                    <ProtectedRoute token={token}>
                      <CreateTeam activeSport={activeSport} setActiveSport={setActiveSport} />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute token={token}>
                      <AdminPanel activeSport={activeSport} setActiveSport={setActiveSport} />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Chatbot />
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
