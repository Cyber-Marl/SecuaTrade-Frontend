import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useMarketData from '../hooks/useMarketData';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, 
  LayoutDashboard, PieChart, History, Settings, 
  Search, Bell, LogOut, ChevronRight, Activity, Zap,
  RefreshCcw, Download, Upload, CreditCard
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { prices, status } = useMarketData();
  const [assets, setAssets] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeMarket, setActiveMarket] = useState('ZSE');
  const [activeCurrency, setActiveCurrency] = useState('USD');
  
  // Order Form State
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('MARKET');
  const [timeInForce, setTimeInForce] = useState('DAY');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  if (!user) return <div style={styles.loadingScreen}>Syncing Fusion Terminal...</div>;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, ledgerRes] = await Promise.all([
        api.get('market/assets/'),
        api.get('accounts/ledger/')
      ]);
      setAssets(assetsRes.data);
      setLedger(ledgerRes.data);
      if (assetsRes.data.length > 0) setSelectedAsset(assetsRes.data[0]);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  const handleQuickTrade = (asset, side) => {
    setSelectedAsset(asset);
    // Focus the quantity input or show a quick modal in a real app
  };

  const handlePlaceOrder = async (side) => {
    if (!selectedAsset) return;
    try {
      await api.post('trading/orders/create/', {
        asset: selectedAsset.id,
        side: side,
        order_type: orderType,
        time_in_force: timeInForce,
        quantity: quantity,
        price: orderType === 'LIMIT' ? price : null
      });
      setMessage({ text: `Order Routed: ${side} ${quantity} ${selectedAsset.ticker}`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Routing failed", type: 'error' });
    }
  };

  const filteredAssets = assets.filter(a => a.market === activeMarket);

  return (
    <div style={styles.container}>
      {/* 1. SIDEBAR (VFEX Style) */}
      <aside style={styles.sidebar} className="glass-card">
        <div style={styles.sidebarLogo}>
          <TrendingUp color="var(--accent-blue)" size={32} />
          <div style={styles.logoTextGroup}>
             <span style={styles.logoTitle}>SecuaTrade</span>
             <span style={styles.logoSub}>FUSION TERMINAL</span>
          </div>
        </div>
        
        <nav style={styles.sideNav}>
          <div style={{...styles.navItem, color: 'var(--accent-blue)', background: 'rgba(0,112,243,0.1)'}}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div style={styles.navItem}><PieChart size={20} /> Portfolio</div>
          <div style={styles.navItem}><History size={20} /> Trade Logs</div>
          <div style={styles.navItem}><Zap size={20} /> IPO Portal</div>
          <div style={styles.navItem}><Activity size={20} /> Markets</div>
        </nav>

        <div style={styles.sidebarFooter}>
           <div style={styles.navItem} onClick={logout}><LogOut size={20} /> Logout System</div>
        </div>
      </aside>

      <main style={styles.mainContent}>
        {/* 2. TOP BAR */}
        <header style={styles.topBar}>
          <div style={styles.topTitleGroup}>
             <h1 style={styles.pageTitle}>Trading Floor</h1>
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

        {/* 3. THE FUSION GRID (3 Columns) */}
        <div style={styles.fusionGrid}>
          
          {/* COLUMN 1: ACCOUNT (C-TRADE Style) */}
          <div style={styles.accountCol}>
            <div className="glass-card" style={styles.card}>
               <h3 style={styles.cardTitle}>MY ACCOUNT</h3>
               
               <div style={styles.balanceSection}>
                  <div style={styles.balanceItem}>
                     <div style={styles.balHeader}>
                        <span style={styles.flag}>🇿🇼</span> ZWG (ZiG)
                     </div>
                     <div style={styles.balVal}>ZWG {user?.zig_balance}</div>
                     <div style={styles.balChange}>+0.00 Today</div>
                  </div>
                  <div style={styles.balanceDivider}></div>
                  <div style={styles.balanceItem}>
                     <div style={styles.balHeader}>
                        <span style={styles.flag}>🇺🇸</span> USD (VFEX)
                     </div>
                     <div style={styles.balVal}>${user?.usd_balance}</div>
                     <div style={styles.balChange}>+0.00 Today</div>
                  </div>
               </div>

               <div style={styles.actionGrid}>
                  <button style={styles.actionBtn}><Download size={14}/> Deposit</button>
                  <button style={styles.actionBtn}><Upload size={14}/> Withdraw</button>
                  <button style={styles.actionBtn}><RefreshCcw size={14}/> Convert</button>
                  <button style={styles.actionBtn}><CreditCard size={14}/> Portfolio</button>
               </div>
            </div>

            <div className="glass-card" style={styles.card}>
               <h3 style={styles.cardTitle}>SYSTEM NOTICES</h3>
               <div style={styles.noticeList}>
                  <div style={styles.noticeItem}>Market is currently OPEN for trading.</div>
                  <div style={styles.noticeItem}>New IPO: Caledonia Mining (CMCL) live.</div>
               </div>
            </div>
          </div>

          {/* COLUMN 2: MARKET WATCH (C-TRADE Style High Density) */}
          <div style={styles.marketCol}>
            <div className="glass-card" style={styles.marketCard}>
               <div style={styles.marketHeader}>
                  <h3 style={styles.cardTitle}>MARKET WATCH</h3>
                  <div style={styles.marketTabs}>
                     <button onClick={() => setActiveMarket('ZSE')} style={{...styles.mTab, color: activeMarket === 'ZSE' ? '#facc15' : 'var(--text-secondary)'}}>EQUITIES (ZW)</button>
                     <button onClick={() => setActiveMarket('VFEX')} style={{...styles.mTab, color: activeMarket === 'VFEX' ? '#facc15' : 'var(--text-secondary)'}}>VFEX (USD)</button>
                  </div>
               </div>
               
               <div style={styles.assetList}>
                  <table style={styles.fusionTable}>
                     <thead>
                        <tr>
                           <th style={styles.fTh}>Asset</th>
                           <th style={styles.fTh}>Price</th>
                           <th style={styles.fTh}>%</th>
                           <th style={styles.fTh}>Quick Trade</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredAssets.map(a => (
                          <tr key={a.id} style={{...styles.fTr, background: selectedAsset?.id === a.id ? 'rgba(250, 204, 21, 0.05)' : 'transparent'}} onClick={() => setSelectedAsset(a)}>
                             <td style={styles.fTd}>
                                <div style={styles.tName}>{a.ticker}</div>
                                <div style={styles.tFull}>{a.name}</div>
                             </td>
                             <td style={styles.fTd}>
                                <span style={styles.priceTag}>{prices[a.ticker] || a.current_price}</span>
                             </td>
                             <td style={{...styles.fTd, color: 'var(--emerald)'}}>+0.00%</td>
                             <td style={styles.fTd}>
                                <div style={styles.quickBtns}>
                                   <button onClick={(e) => { e.stopPropagation(); handleQuickTrade(a, 'BUY'); }} style={styles.qBuy}>BUY</button>
                                   <button onClick={(e) => { e.stopPropagation(); handleQuickTrade(a, 'SELL'); }} style={styles.qSell}>SELL</button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>

          {/* COLUMN 3: TRADE (C-TRADE Style Detailed Form) */}
          <div style={styles.tradeCol}>
            <div className="glass-card" style={styles.card}>
               <h3 style={styles.cardTitle}>EXECUTION ENGINE</h3>
               
               {selectedAsset ? (
                 <div style={styles.orderForm}>
                    <div style={styles.formSection}>
                       <label style={styles.formLabel}>COMPANY SELECTED</label>
                       <div style={styles.activeAssetBox}>
                          <span style={styles.activeTicker}>{selectedAsset.ticker}</span>
                          <span style={styles.activeName}>{selectedAsset.name}</span>
                       </div>
                    </div>

                    <div style={styles.formRow}>
                       <div style={styles.formGroup}>
                          <label style={styles.formLabel}>ORDER TYPE</label>
                          <select style={styles.formInput} value={orderType} onChange={e => setOrderType(e.target.value)}>
                             <option value="MARKET">Market Order</option>
                             <option value="LIMIT">Limit Order</option>
                          </select>
                       </div>
                       <div style={styles.formGroup}>
                          <label style={styles.formLabel}>MARKET</label>
                          <input style={styles.formInput} value={selectedAsset.market} readOnly />
                       </div>
                    </div>

                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>TIME IN FORCE</label>
                       <select style={styles.formInput} value={timeInForce} onChange={e => setTimeInForce(e.target.value)}>
                          <option value="DAY">Day Order (DO)</option>
                          <option value="GTC">Good Till Cancelled</option>
                       </select>
                    </div>

                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>QUANTITY</label>
                       <input type="number" style={styles.formInput} placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>

                    {orderType === 'LIMIT' && (
                       <div style={styles.formGroup}>
                          <label style={styles.formLabel}>PRICE</label>
                          <input type="number" style={styles.formInput} placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                       </div>
                    )}

                    <div style={styles.grandTotal}>
                       <span>ESTIMATED TOTAL</span>
                       <span>
                          {selectedAsset.market === 'ZSE' ? 'ZWG' : '$'}
                          {(quantity * (orderType === 'LIMIT' ? price : (prices[selectedAsset.ticker] || selectedAsset.current_price))).toFixed(2)}
                       </span>
                    </div>

                    <div style={styles.mainExecBtns}>
                       <button onClick={() => handlePlaceOrder('BUY')} style={styles.mainBuyBtn}>PLACE BUY ORDER</button>
                       <button onClick={() => handlePlaceOrder('SELL')} style={styles.mainSellBtn}>PLACE SELL ORDER</button>
                    </div>

                    {message.text && (
                       <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{...styles.msgBox, background: message.type === 'error' ? 'var(--crimson-glow)' : 'var(--emerald-glow)'}}>
                          {message.text}
                       </motion.div>
                    )}
                 </div>
               ) : (
                 <div style={styles.emptyState}>
                    <Zap size={48} color="rgba(255,255,255,0.05)" />
                    <p>Select an asset from Market Watch to start trading</p>
                 </div>
               )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#040507', // Deeper black for fusion look
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  loadingScreen: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  
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
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '15px', padding: '0 25px', marginBottom: '50px' },
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

  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', padding: '25px', gap: '25px' },
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

  fusionGrid: { display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '20px', flex: 1 },
  
  card: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  cardTitle: { fontSize: '11px', fontWeight: '900', color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 },
  
  accountCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  balanceSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  balanceItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
  balHeader: { fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' },
  flag: { fontSize: '16px' },
  balVal: { fontSize: '24px', fontWeight: '900', color: '#fff' },
  balChange: { fontSize: '11px', color: 'var(--emerald)', fontWeight: '700' },
  balanceDivider: { height: '1px', background: 'rgba(255,255,255,0.05)' },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  actionBtn: { padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  noticeList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  noticeItem: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' },

  marketCol: { display: 'flex', flexDirection: 'column' },
  marketCard: { flex: 1, display: 'flex', flexDirection: 'column', padding: '0' },
  marketHeader: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  marketTabs: { display: 'flex', gap: '15px' },
  mTab: { background: 'none', border: 'none', fontSize: '11px', fontWeight: '900', cursor: 'pointer', padding: '5px 0' },
  assetList: { flex: 1, overflowY: 'auto', padding: '0' },
  fusionTable: { width: '100%', borderCollapse: 'collapse' },
  fTh: { textAlign: 'left', padding: '15px 20px', fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', textTransform: 'uppercase' },
  fTr: { borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s' },
  fTd: { padding: '12px 20px' },
  tName: { fontSize: '15px', fontWeight: '800', color: 'var(--accent-blue)' },
  tFull: { fontSize: '10px', color: 'var(--text-secondary)' },
  priceTag: { fontSize: '14px', fontWeight: '900', color: '#facc15' },
  quickBtns: { display: 'flex', gap: '8px' },
  qBuy: { padding: '6px 12px', background: 'var(--emerald)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '10px', fontWeight: '800' },
  qSell: { padding: '6px 12px', background: 'var(--crimson)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '10px', fontWeight: '800' },

  tradeCol: { display: 'flex', flexDirection: 'column' },
  orderForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  formLabel: { fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.05em' },
  activeAssetBox: { padding: '15px', background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column' },
  activeTicker: { fontSize: '22px', fontWeight: '900', color: '#facc15' },
  activeName: { fontSize: '12px', color: 'var(--text-secondary)' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formInput: { padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' },
  grandTotal: { padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px' },
  mainExecBtns: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mainBuyBtn: { padding: '16px', background: 'var(--emerald)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' },
  mainSellBtn: { padding: '16px', background: 'var(--crimson)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer' },
  msgBox: { padding: '15px', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '600' },
  emptyState: { padding: '100px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', opacity: 0.3 }
};

export default Dashboard;
