import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useMarketData from '../hooks/useMarketData';

const TopBar = ({ title }) => {
  const { user, isDemoMode } = useAuth();
  const { status } = useMarketData();
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    const checkMarketStatus = () => {
      // Get current time in UTC
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      
      // Zimbabwe is UTC + 2
      const zimTime = new Date(utc + (3600000 * 2));
      
      const day = zimTime.getDay(); // 0 = Sun, 6 = Sat
      const hours = zimTime.getHours();
      const minutes = zimTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      
      // 09:00 is 540 minutes, 12:30 is 750 minutes
      const isOpenDay = day >= 1 && day <= 5; // Monday to Friday
      const isOpenTime = totalMinutes >= 540 && totalMinutes <= 750;
      
      setIsMarketOpen(isOpenDay && isOpenTime);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={styles.topBar}>
      <div style={styles.topTitleGroup}>
         <h1 style={{...styles.pageTitle, color: isDemoMode ? '#facc15' : 'var(--text-primary)'}}>
           {isDemoMode ? `Demo ${title}` : title}
         </h1>
         <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '2px' }}>
           <span style={styles.systemStatus}>
             <div style={{...styles.dot, backgroundColor: status === 'connected' ? 'var(--emerald)' : 'var(--crimson)'}}></div>
             {status === 'connected' ? 'LIVE MARKET FEED' : 'CONNECTING...'}
           </span>
           <span style={{
             ...styles.systemStatus, 
             background: isMarketOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
             border: `1px solid ${isMarketOpen ? 'var(--emerald)' : 'var(--crimson)'}`,
             padding: '2px 8px',
             borderRadius: '4px',
             color: isMarketOpen ? 'var(--emerald)' : 'var(--crimson)',
             letterSpacing: '0.5px'
           }} title="ZSE/VFEX Trading Hours: Mon-Fri 09:00 - 12:30 ZCAT (UTC+2)">
             {isMarketOpen ? '🟢 ZSE/VFEX: OPEN' : '🔴 ZSE/VFEX: CLOSED'}
           </span>
         </div>
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
