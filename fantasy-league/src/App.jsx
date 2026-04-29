import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, LayoutDashboard, Trophy, Settings, Activity, MonitorPlay, Zap, Shield, Gamepad2 } from 'lucide-react';
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
const LiveScorePage = React.lazy(() => import('./pages/LiveScorePage'));
const MatchDetail = React.lazy(() => import('./pages/MatchDetail'));
const WatchParty = React.lazy(() => import('./pages/WatchParty'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Presentation = React.lazy(() => import('./pages/Presentation'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', minHeight: '50vh', flexDirection: 'column', gap: '20px' }}>
    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,16,122,0.1)', borderTopColor: 'var(--neon-pink)', animation: 'spin 0.8s linear infinite' }}></div>
      <div style={{ position: 'absolute', inset: '6px', borderRadius: '50%', border: '2px solid rgba(0,229,255,0.1)', borderBottomColor: 'var(--neon-blue)', animation: 'spin 1.2s linear infinite reverse' }}></div>
      <div style={{ position: 'absolute', inset: '14px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,16,122,0.2), transparent)', animation: 'pulse 1.5s infinite' }}></div>
    </div>
    <span style={{ color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '3px', animation: 'neonFlicker 3s infinite' }}>INITIALIZING MODULE...</span>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
      @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
      @keyframes neonFlicker { 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; } 20%, 24%, 55% { opacity: 0.4; } }
    `}</style>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, token }) => {
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Premium Sidebar Navigation Component
const Sidebar = ({ setToken }) => {
  const location = useLocation();
  const userStr = localStorage.getItem('fantasy_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const navItems = [
    { path: '/', name: 'Matches', icon: <Gamepad2 size={18} />, color: 'var(--neon-pink)' },
    { path: '/live', name: 'Live Scores', icon: <Activity size={18} />, color: '#ff2800' },
    { path: '/watch-party', name: 'Watch Party', icon: <MonitorPlay size={18} />, color: '#00e5ff' },
    { path: '/create-team', name: 'Create Team', icon: <Users size={18} />, color: '#a855f7' },
    { path: '/leaderboard', name: 'Leaderboard', icon: <Trophy size={18} />, color: '#FFD700' },
    { path: '/admin', name: 'Admin', icon: <Settings size={18} />, color: '#00ff87' },
    { path: '/presentation', name: 'Showcase', icon: <Layout size={18} />, color: '#00e5ff' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('fantasy_token');
    localStorage.removeItem('fantasy_user');
    setToken(null);
  };

  return (
    <div className="sidebar glass-panel" style={{ 
      width: '260px', 
      margin: '24px 0 24px 24px', 
      display: 'flex', 
      flexDirection: 'column',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 'none',
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(180deg, rgba(15,12,25,0.9) 0%, rgba(10,8,20,0.95) 100%)',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute', top: '-50px', left: '-50px',
        width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(255,16,122,0.08) 0%, transparent 60%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-30px', right: '-30px',
        width: '150px', height: '150px',
        background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 60%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />

      {/* Logo with 3D effect */}
      <div className="logo" style={{ 
        marginBottom: '36px', 
        padding: '0 8px',
        position: 'relative',
        animation: 'slideInLeft 0.6s ease both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,16,122,0.2), rgba(168,85,247,0.2))',
            border: '1px solid rgba(255,16,122,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,16,122,0.15)',
            animation: 'float 4s ease-in-out infinite'
          }}>
            <Zap size={20} color="var(--neon-pink)" />
          </div>
          <div>
            <h2 className="heading-gradient" style={{ fontSize: '1.4rem', lineHeight: 1.2, filter: 'drop-shadow(0 0 10px rgba(255,16,122,0.3))' }}>IIITN</h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '3px', fontFamily: 'var(--font-heading)' }}>Fantasy Arena</span>
          </div>
        </div>
        {/* Separator line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,16,122,0.3), transparent)', marginTop: '20px' }} />
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                color: isActive ? '#fff' : isHovered ? '#fff' : 'var(--text-muted)',
                textDecoration: 'none',
                borderRadius: '12px',
                background: isActive 
                  ? `linear-gradient(135deg, ${item.color}20, ${item.color}08)` 
                  : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden',
                animation: `slideInLeft 0.4s ease ${0.05 * index}s both`,
                transform: isHovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
                boxShadow: isActive ? `0 0 20px ${item.color}15` : 'none'
              }}
            >
              {/* Active glow indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '3px', height: '60%',
                  background: item.color,
                  boxShadow: `0 0 10px ${item.color}, 0 0 20px ${item.color}`,
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
              <span style={{ 
                color: isActive ? item.color : 'inherit',
                filter: isActive ? `drop-shadow(0 0 8px ${item.color})` : 'none',
                transition: 'all 0.3s'
              }}>
                {item.icon}
              </span>
              {item.name}
              {item.path === '/live' && (
                <div style={{ 
                  marginLeft: 'auto', width: '6px', height: '6px', 
                  borderRadius: '50%', background: '#ff2800',
                  boxShadow: '0 0 8px #ff2800',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* User card */}
        <div style={{ 
          padding: '16px', 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          borderRadius: '14px', 
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '60px', height: '60px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent)',
            filter: 'blur(20px)', pointerEvents: 'none'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(255,16,122,0.3)'
            }}>
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>MANAGER</div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{user?.username || 'Manager'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ 
            width: '100%', padding: '8px', 
            background: 'transparent', 
            color: 'var(--neon-red)', 
            border: '1px solid rgba(229,9,20,0.3)', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '0.7rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '2px',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(229,9,20,0.1)'; e.target.style.boxShadow = '0 0 15px rgba(229,9,20,0.2)'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = 'none'; }}
          >
            DISCONNECT
          </button>
        </div>

        {/* System Status */}
        <div style={{ 
          padding: '14px', 
          background: 'linear-gradient(135deg, rgba(255,16,122,0.06), rgba(168,85,247,0.04))',
          borderRadius: '14px', 
          border: '1px solid rgba(255,16,122,0.12)'
        }}>
          <h4 style={{ color: 'var(--neon-pink)', fontSize: '0.65rem', marginBottom: '10px', fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>◈ SYSTEM STATUS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff87', boxShadow: '0 0 8px #00ff87', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>Neural Link Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-blue)', boxShadow: '0 0 8px var(--neon-blue)', animation: 'pulse 2.5s infinite 0.5s' }}></div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>Data Stream Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-pink)', boxShadow: '0 0 8px var(--neon-pink)', animation: 'pulse 3s infinite 1s' }}></div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>AI Core Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
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
          <Route path="/presentation" element={<Presentation />} />
          
          <Route path="/*" element={
            <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
              <Sidebar setToken={setToken} />
              <main className="main-content">
                <Routes>
                  {/* Publicly Visible Pages */}
                  <Route path="/" element={<Dashboard activeSport={activeSport} setActiveSport={setActiveSport} />} />
                  <Route path="/match/:id" element={<MatchDetail />} />
                  <Route path="/live" element={<LiveTracking activeSport={activeSport} setActiveSport={setActiveSport} />} />
                  <Route path="/live/:sport" element={<LiveScorePage />} />
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
