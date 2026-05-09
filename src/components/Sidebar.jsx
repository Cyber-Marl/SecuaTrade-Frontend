import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, LayoutDashboard, PieChart, History, 
  Wallet, Rocket, Activity, LogOut, ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const { logout, isDemoMode, toggleDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Portfolio', icon: <PieChart size={20} />, path: '/portfolio' },
    { name: 'Wallet', icon: <Wallet size={20} />, path: '/wallet' },
    { name: 'Trade Logs', icon: <ClipboardList size={20} />, path: '/logs' },
    { name: 'IPO Portal', icon: <Rocket size={20} />, path: '/ipo' },
    { name: 'Markets', icon: <Activity size={20} />, path: '/markets' },
  ];

  return (
    <aside style={styles.sidebar} className="glass-card">
      <div style={styles.sidebarLogo} onClick={() => navigate('/dashboard')}>
        <TrendingUp color="var(--accent-blue)" size={32} />
        <div style={styles.logoTextGroup}>
           <span style={styles.logoTitle}>SecuaTrade</span>
           <span style={styles.logoSub}>FUSION TERMINAL</span>
        </div>
      </div>
      
      <nav style={styles.sideNav}>
        {navItems.map((item) => (
          <div 
            key={item.name}
            style={{
              ...styles.navItem, 
              color: location.pathname === item.path ? 'var(--accent-blue)' : 'var(--text-secondary)',
              background: location.pathname === item.path ? 'rgba(0,112,243,0.1)' : 'transparent'
            }}
            onClick={() => navigate(item.path)}
          >
            {item.icon} {item.name}
          </div>
        ))}
        
        <div 
          style={{...styles.navItem, marginTop: 'auto', color: isDemoMode ? '#facc15' : 'var(--text-secondary)'}} 
          onClick={toggleDemoMode}
        >
          <Activity size={20} color={isDemoMode ? '#facc15' : 'currentColor'} /> 
          {isDemoMode ? 'Exit Demo Mode' : 'Enter Demo Mode'}
        </div>
      </nav>

      <div style={styles.sidebarFooter}>
         <div style={styles.navItem} onClick={logout}><LogOut size={20} /> Logout System</div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 0',
    borderRadius: '0',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '15px', padding: '0 25px', marginBottom: '50px', cursor: 'pointer' },
  logoTextGroup: { display: 'flex', flexDirection: 'column' },
  logoTitle: { fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' },
  logoSub: { fontSize: '8px', fontWeight: '800', color: 'var(--accent-blue)', letterSpacing: '0.2em' },
  sideNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 25px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sidebarFooter: { paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' },
};

export default Sidebar;
