import React from 'react';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { Activity, Globe } from 'lucide-react';

const Markets = () => {
  return (
    <Layout>
      <TopBar title="Global Markets" />
      <div style={styles.container}>
        <div className="glass-card" style={styles.card}>
          <Globe size={48} color="var(--emerald)" />
          <h2 style={styles.title}>Market Overview</h2>
          <p style={styles.desc}>Detailed market analytics and global exchange feeds are coming soon to the Fusion Terminal.</p>
          <div style={styles.grid}>
             <div style={styles.item}>
                <div style={styles.label}>ZSE EQUITIES</div>
                <div style={styles.val}>CONNECTED</div>
             </div>
             <div style={styles.item}>
                <div style={styles.label}>VFEX EQUITIES</div>
                <div style={styles.val}>CONNECTED</div>
             </div>
             <div style={styles.item}>
                <div style={styles.label}>LSE / NYSE</div>
                <div style={styles.val}>SOON</div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  card: { padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '600px', textAlign: 'center' },
  title: { fontSize: '24px', fontWeight: '900', color: '#fff', margin: 0 },
  desc: { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', width: '100%', marginTop: '30px' },
  item: { padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  label: { fontSize: '10px', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '5px' },
  val: { fontSize: '12px', fontWeight: '800', color: 'var(--emerald)' }
};

export default Markets;
