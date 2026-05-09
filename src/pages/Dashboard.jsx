import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useMarketData from '../hooks/useMarketData';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import TradingChart from '../components/TradingChart';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { 
  Zap, RefreshCcw, Download, Upload, CreditCard
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { prices } = useMarketData();
  const [assets, setAssets] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeMarket, setActiveMarket] = useState('ZSE');
  const [news, setNews] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [activeTab, setActiveTab] = useState('WATCHLIST');
  const [chartData, setChartData] = useState([]);
  
  // Order Form State
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('MARKET');
  const [timeInForce, setTimeInForce] = useState('DAY');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [isDemoMode]);

  useEffect(() => {
    if (selectedAsset) {
      fetchOrderBook();
      fetchChartData();
    }
  }, [selectedAsset, isDemoMode]);

  const fetchChartData = async () => {
    try {
      const res = await api.get(`market/assets/${selectedAsset.ticker}/chart/`);
      setChartData(res.data);
    } catch (err) {
      console.error("Error fetching chart data", err);
    }
  };

  const fetchOrderBook = async () => {
    try {
      const res = await api.get(`trading/orderbook/${selectedAsset.id}/`, { params: { is_demo: isDemoMode } });
      setOrderBook(res.data);
    } catch (err) {
      console.error("Error fetching order book", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, ledgerRes, newsRes] = await Promise.all([
        api.get('market/assets/'),
        api.get('accounts/ledger/', { params: { is_demo: isDemoMode } }),
        api.get('market/news/portfolio/', { params: { is_demo: isDemoMode } })
      ]);
      setAssets(assetsRes.data);
      setLedger(ledgerRes.data);
      setNews(newsRes.data);
      
      if (assetsRes.data.length > 0) {
        const initialAsset = assetsRes.data.find(a => a.market === activeMarket) || assetsRes.data[0];
        setSelectedAsset(initialAsset);
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  const handleQuickTrade = (asset, side) => {
    setSelectedAsset(asset);
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
        price: orderType === 'LIMIT' ? price : null,
        is_demo: isDemoMode
      });
      setMessage({ text: `${isDemoMode ? '[DEMO] ' : ''}Order Routed: ${side} ${quantity} ${selectedAsset.ticker}`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Routing failed", type: 'error' });
    }
  };

  const filteredAssets = assets.filter(a => a.market === activeMarket);

  return (
    <Layout>
      <TopBar title="Trading Floor" />

      <div style={styles.fusionGrid}>
        {/* COLUMN 1: ACCOUNT */}
        <div style={styles.accountCol}>
          <div className="glass-card" style={styles.card}>
             <h3 style={styles.cardTitle}>MY ACCOUNT</h3>
             
             <div style={styles.balanceSection}>
                <div style={styles.balanceItem}>
                   <div style={styles.balHeader}>
                      <span style={styles.flag}>🇿🇼</span> ZWG (ZiG) {isDemoMode && '(DEMO)'}
                   </div>
                   <div style={styles.balVal}>ZWG {isDemoMode ? user?.demo_zig_balance : user?.zig_balance}</div>
                   <div style={styles.balChange}>+0.00 Today</div>
                </div>
                <div style={styles.balanceDivider}></div>
                <div style={styles.balanceItem}>
                   <div style={styles.balHeader}>
                      <span style={styles.flag}>🇺🇸</span> USD (VFEX) {isDemoMode && '(DEMO)'}
                   </div>
                   <div style={styles.balVal}>${isDemoMode ? user?.demo_usd_balance : user?.usd_balance}</div>
                   <div style={styles.balChange}>+0.00 Today</div>
                </div>
             </div>

             <div style={styles.actionGrid}>
                <button style={styles.actionBtn} onClick={() => navigate('/wallet')}><Download size={14}/> Deposit</button>
                <button style={styles.actionBtn} onClick={() => navigate('/wallet')}><Upload size={14}/> Withdraw</button>
                <button style={styles.actionBtn} onClick={() => navigate('/wallet')}><RefreshCcw size={14}/> Convert</button>
                <button style={styles.actionBtn} onClick={() => navigate('/wallet')}><CreditCard size={14}/> Portfolio</button>
             </div>
          </div>

          <div className="glass-card" style={styles.card}>
             <h3 style={styles.cardTitle}>PORTFOLIO NEWS</h3>
             <div style={styles.noticeList}>
                {news.length > 0 ? news.map(n => (
                  <div key={n.id} style={styles.newsItem}>
                    <div style={styles.newsTicker}>{n.asset_ticker || 'MARKET'}</div>
                    <div style={styles.newsTitle}>{n.title}</div>
                    <div style={styles.newsSummary}>{n.summary}</div>
                  </div>
                )) : (
                  <div style={styles.noticeItem}>No relevant news for your portfolio at this time.</div>
                )}
             </div>
          </div>
        </div>

        {/* COLUMN 2: MARKET WATCH & CHARTS */}
        <div style={styles.marketCol}>
          <div className="glass-card" style={{...styles.card, marginBottom: '20px', height: '320px', padding: '10px', overflow: 'hidden'}}>
             <TradingChart data={chartData} ticker={selectedAsset?.ticker} />
          </div>
          
          <div className="glass-card" style={{...styles.marketCard, flex: 1, minHeight: '400px'}}>
              <div style={styles.marketHeader}>
                 <div style={styles.marketTabs}>
                    <button onClick={() => setActiveTab('WATCHLIST')} style={{...styles.mTab, color: activeTab === 'WATCHLIST' ? '#facc15' : 'var(--text-secondary)'}}>WATCHLIST</button>
                    <button onClick={() => setActiveTab('ORDERBOOK')} style={{...styles.mTab, color: activeTab === 'ORDERBOOK' ? '#facc15' : 'var(--text-secondary)'}}>ORDER BOOK</button>
                 </div>
                 {activeTab === 'WATCHLIST' && (
                   <div style={styles.marketTabs}>
                      <button onClick={() => setActiveMarket('ZSE')} style={{...styles.mTab, color: activeMarket === 'ZSE' ? '#facc15' : 'var(--text-secondary)'}}>EQUITIES (ZW)</button>
                      <button onClick={() => setActiveMarket('VFEX')} style={{...styles.mTab, color: activeMarket === 'VFEX' ? '#facc15' : 'var(--text-secondary)'}}>VFEX (USD)</button>
                   </div>
                 )}
              </div>
              
              {activeTab === 'WATCHLIST' ? (
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
              ) : (
                <div style={styles.orderBookContainer}>
                  <div style={styles.obHeader}>
                     <span>Price ({selectedAsset?.market === 'ZSE' ? 'ZWG' : '$'})</span>
                     <span>Size</span>
                  </div>
                  <div style={styles.obAsks}>
                    {[...orderBook.asks].reverse().map((ask, i) => (
                      <div key={i} style={styles.obRow}>
                        <span style={{color: 'var(--crimson)'}}>{ask.price}</span>
                        <span>{ask.total_remaining}</span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.obMid}>
                    <span style={styles.obPrice}>{prices[selectedAsset?.ticker] || selectedAsset?.current_price}</span>
                    <span style={styles.obStatus}>LAST PRICE</span>
                  </div>
                  <div style={styles.obBids}>
                    {orderBook.bids.map((bid, i) => (
                      <div key={i} style={styles.obRow}>
                        <span style={{color: 'var(--emerald)'}}>{bid.price}</span>
                        <span>{bid.total_remaining}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* COLUMN 3: EXECUTION */}
        <div style={styles.tradeCol}>
          <div className="glass-card" style={styles.card}>
             <h3 style={styles.cardTitle}>EXECUTION ENGINE</h3>
             
             {selectedAsset ? (
               <div style={styles.orderForm}>
                  <div style={styles.formSection}>
                     <label style={styles.formLabel}>COMPANY SELECTED</label>
                     <select 
                       style={styles.assetDropdown} 
                       value={selectedAsset.id} 
                       onChange={(e) => {
                         const asset = assets.find(a => a.id === parseInt(e.target.value));
                         setSelectedAsset(asset);
                       }}
                     >
                       {assets.map(a => (
                         <option key={a.id} value={a.id}>
                           {a.ticker} - {a.name}
                         </option>
                       ))}
                     </select>
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
    </Layout>
  );
};

const styles = {
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
  newsItem: { display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  newsTicker: { fontSize: '10px', fontWeight: '900', color: 'var(--accent-blue)', textTransform: 'uppercase' },
  newsTitle: { fontSize: '13px', fontWeight: '700', color: '#fff' },
  newsSummary: { fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' },
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
  orderBookContainer: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  obHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', marginBottom: '10px' },
  obRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', padding: '4px 0' },
  obAsks: { display: 'flex', flexDirection: 'column' },
  obBids: { display: 'flex', flexDirection: 'column' },
  obMid: { padding: '15px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' },
  obPrice: { fontSize: '18px', fontWeight: '900', color: '#fff' },
  obStatus: { fontSize: '8px', fontWeight: '800', color: 'var(--text-secondary)' },
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

