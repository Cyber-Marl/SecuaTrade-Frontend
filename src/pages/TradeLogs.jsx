import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { ClipboardList, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const TradeLogs = () => {
  const { user, isDemoMode } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [isDemoMode]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('trading/orders/', { params: { is_demo: isDemoMode } });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'FILLED': return <CheckCircle size={14} color="var(--emerald)" />;
      case 'OPEN': return <Clock size={14} color="#facc15" />;
      case 'PARTIALLY_FILLED': return <Clock size={14} color="#facc15" />;
      case 'CANCELLED': return <XCircle size={14} color="var(--text-secondary)" />;
      case 'FAILED': return <AlertCircle size={14} color="var(--crimson)" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <TopBar title="Order Execution Logs" />
      
      <div style={styles.container}>
        <div className="glass-card" style={styles.tableCard}>
          <div style={styles.header}>
             <h3 style={styles.cardTitle}>EXECUTION HISTORY {isDemoMode && '(DEMO)'}</h3>
             <button onClick={fetchOrders} style={styles.refreshBtn}>Refresh Logs</button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ORDER ID</th>
                <th style={styles.th}>DATE</th>
                <th style={styles.th}>ASSET</th>
                <th style={styles.th}>SIDE</th>
                <th style={styles.th}>TYPE</th>
                <th style={styles.th}>QUANTITY</th>
                <th style={styles.th}>FILLED</th>
                <th style={styles.th}>PRICE</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((order) => (
                <tr key={order.id} style={styles.tr}>
                  <td style={styles.td}>#ST-{order.id.toString().padStart(5, '0')}</td>
                  <td style={styles.td}>{new Date(order.created_at).toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={styles.ticker}>{order.asset_ticker}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.sideBadge, color: order.side === 'BUY' ? 'var(--emerald)' : 'var(--crimson)'}}>
                      {order.side}
                    </span>
                  </td>
                  <td style={styles.td}>{order.order_type}</td>
                  <td style={styles.td}>{parseFloat(order.quantity).toLocaleString()}</td>
                  <td style={styles.td}>{parseFloat(order.filled_quantity).toLocaleString()}</td>
                  <td style={styles.td}>
                    {order.price ? `${parseFloat(order.price).toFixed(2)}` : 'MARKET'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.statusGroup}>
                      {getStatusIcon(order.status)}
                      <span style={{fontSize: '11px', fontWeight: '800'}}>{order.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={styles.noData}>
                    {loading ? "Accessing secure logs..." : "No trade logs found for this session."}
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
  container: { display: 'flex', flexDirection: 'column' },
  tableCard: { padding: '0', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 25px 15px' },
  cardTitle: { fontSize: '11px', fontWeight: '900', color: '#facc15', textTransform: 'uppercase', margin: 0 },
  refreshBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px 25px', fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' },
  td: { padding: '15px 25px', fontSize: '13px', fontWeight: '600' },
  ticker: { fontWeight: '800', color: 'var(--accent-blue)' },
  sideBadge: { fontWeight: '900', fontSize: '11px' },
  statusGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  noData: { padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }
};

export default TradeLogs;
