import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#040507',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  mainContent: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '25px', 
    gap: '25px',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%'
  },
};

export default Layout;
