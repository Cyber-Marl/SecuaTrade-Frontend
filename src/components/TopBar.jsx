import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useMarketData from '../hooks/useMarketData';

const TopBar = ({ title }) => {
  const { user, isDemoMode } = useAuth();
  const { status } = useMarketData();

  return (
    <header style={styles.topBar}>
      <div style={styles.topTitleGroup}>
         <h1 style={{...styles.pageTitle, color: isDemoMode ? '#facc15' : 'var(--text-primary)'}}>
           {isDemoMode ? `Demo ${title}` : title}
         </h1>
         <span style={styles.systemStatus}>
           <div style={{...styles.dot, backgroundColor: status === 'connected' ? 'var(--emerald)' : 'var(--crimson)'}}></div>
           {status === 'connected' ? 'LIVE MARKET FEED' : 'CONNECTING...'}
         </span>
      </div>
      
      <div style={styles.topActions}>
         <div style={styles.searchBar}>
            <Search size={16} /> <input placeholder="Ticker search..." style={styles.searchIn} />
         </div>
         <Bell size={20} style={styles.topIcon} />
         <div style={styles.profileBadge}>
            <img src={`https://ui-avatars.com/api/?name=${user?.user?.username}&background=0070f3&color=fff`} style={styles.avatar} alt="P" />
            <span>{user?.user?.username}</span>
         </div>
      </div>
    </header>
  );
};

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  topTitleGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  pageTitle: { fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-1px' },
  systemStatus: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)' },
  dot: { width: '6px', height: '6px', borderRadius: '50%' },
  topActions: { display: 'flex', alignItems: 'center', gap: '25px' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' },
  searchIn: { background: 'none', border: 'none', color: '#fff', fontSize: '13px', outline: 'none' },
  topIcon: { cursor: 'pointer', color: 'var(--text-secondary)' },
  profileBadge: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--accent-blue)' },
};

export default TopBar;
