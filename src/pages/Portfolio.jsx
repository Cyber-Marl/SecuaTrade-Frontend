import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Portfolio = () => {
  const { user, isDemoMode } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoldings();
  }, [isDemoMode]);

  const fetchHoldings = async () => {
    try {
      const res = await api.get('trading/portfolio/', { params: { is_demo: isDemoMode } });
      setHoldings(res.data);
    } catch (err) {
      console.error("Error fetching holdings", err);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = holdings.reduce((acc, h) => acc + parseFloat(h.value), 0);

  return (
    <Layout>
      <TopBar title="Portfolio" />
      
      <div style={styles.container}>
        <div style={styles.statsGrid}>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statHeader}>
              <DollarSign size={20} color="#facc15" />
              <span style={styles.statLabel}>TOTAL PORTFOLIO VALUE</span>
            </div>
            <div style={styles.statValue}>
              {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={styles.currencyLabel}> USD/ZWG</span>
            </div>
          </div>
          
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statHeader}>
              <TrendingUp size={20} color="var(--emerald)" />
              <span style={styles.statLabel}>TOTAL HOLDINGS</span>
            </div>
            <div style={styles.statValue}>{holdings.length} Assets</div>
          </div>
        </div>

        <div className="glass-card" style={styles.tableCard}>
          <h3 style={styles.cardTitle}>YOUR ASSETS</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ASSET</th>
                <th style={styles.th}>MARKET</th>
                <th style={styles.th}>QUANTITY</th>
                <th style={styles.th}>AVG PRICE</th>
                <th style={styles.th}>CURRENT PRICE</th>
                <th style={styles.th}>VALUE</th>
                <th style={styles.th}>RETURN</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length > 0 ? holdings.map((h, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.ticker}>{h.ticker}</div>
                    <div style={styles.assetName}>{h.name}</div>
                  </td>
                  <td style={styles.td}><span style={styles.badge}>{h.market}</span></td>
                  <td style={styles.td}>{parseFloat(h.quantity).toLocaleString()}</td>
                  <td style={styles.td}>---</td>
                  <td style={styles.td}>{parseFloat(h.current_price).toFixed(2)}</td>
                  <td style={styles.td}>{parseFloat(h.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{...styles.td, color: 'var(--emerald)'}}>+0.00%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={styles.noData}>
                    {loading ? "Syncing with ledger..." : "No active holdings found in this account."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '30px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  statCard: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' },
  statHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  statLabel: { fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '0.1em' },
  statValue: { fontSize: '32px', fontWeight: '900', color: '#fff' },
  currencyLabel: { fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' },
  tableCard: { padding: '0', overflow: 'hidden' },
  cardTitle: { fontSize: '11px', fontWeight: '900', color: '#facc15', textTransform: 'uppercase', padding: '25px 25px 15px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px 25px', fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '20px 25px' },
  ticker: { fontSize: '16px', fontWeight: '800', color: 'var(--accent-blue)' },
  assetName: { fontSize: '10px', color: 'var(--text-secondary)' },
  badge: { padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
  noData: { padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }
};

export default Portfolio;
