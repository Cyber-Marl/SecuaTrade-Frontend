import React from 'react';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { Rocket, Zap } from 'lucide-react';

const IPOPortal = () => {
  return (
    <Layout>
      <TopBar title="IPO Portal" />
      <div style={styles.container}>
        <div className="glass-card" style={styles.card}>
          <Rocket size={48} color="var(--accent-blue)" />
          <h2 style={styles.title}>Primary Market Access</h2>
          <p style={styles.desc}>There are no active Initial Public Offerings (IPOs) at this moment.</p>
          <div style={styles.notice}>
            <Zap size={16} />
            <span>New listings will appear here. Turn on notifications to stay updated.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  card: { padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '500px', textAlign: 'center' },
  title: { fontSize: '24px', fontWeight: '900', color: '#fff', margin: 0 },
  desc: { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' },
  notice: { marginTop: '20px', padding: '15px', background: 'rgba(0,112,243,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: '600' }
};

export default IPOPortal;
