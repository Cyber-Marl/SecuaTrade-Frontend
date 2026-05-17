import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useMarketData from '../hooks/useMarketData';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import TradingChart from '../components/TradingChart';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { 
  Zap, RefreshCcw, Download, Upload, CreditCard, Shield
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isDemoMode, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { prices } = useMarketData();
  const [assets, setAssets] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeMarket, setActiveMarket] = useState('ZSE');
  const [news, setNews] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [activeTab, setActiveTab] = useState('WATCHLIST');
  const [chartData, setChartData] = useState([]);
  
  // Order Form State
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('MARKET');
  const [timeInForce, setTimeInForce] = useState('DAY');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSide, setOrderSide] = useState('BUY');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');

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
      const [assetsRes, ledgerRes, newsRes, brokersRes] = await Promise.all([
        api.get('market/assets/'),
        api.get('accounts/ledger/', { params: { is_demo: isDemoMode } }),
        api.get('market/news/portfolio/', { params: { is_demo: isDemoMode } }),
        api.get('market/brokers/')
      ]);
      setAssets(assetsRes.data);
      setLedger(ledgerRes.data);
      setNews(newsRes.data);
      setBrokers(brokersRes.data);
      
      if (assetsRes.data.length > 0) {
        const initialAsset = assetsRes.data.find(a => a.market === activeMarket) || assetsRes.data[0];
        setSelectedAsset(initialAsset);
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  const handleChangeBroker = async () => {
    try {
      await api.patch('accounts/profile/', { broker: selectedBrokerId });
      setIsBrokerModalOpen(false);
      refreshProfile();
    } catch (err) {
      setMessage({ text: "Failed to update broker.", type: 'error' });
    }
  };

  const handleQuickTrade = (asset, side) => {
    setSelectedAsset(asset);
    setOrderSide(side);
    setIsOrderModalOpen(true);
  };

  const handlePlaceOrder = async (side) => {
    if (!selectedAsset) return;

    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setMessage({ text: "Please enter a valid quantity.", type: 'error' });
      return;
    }

    if (orderType === 'LIMIT' && (!price || isNaN(price) || Number(price) <= 0)) {
      setMessage({ text: "Please enter a valid price for limit order.", type: 'error' });
      return;
    }

    try {
      await api.post('trading/orders/create/', {
        asset: selectedAsset.id,
        side: side,
        order_type: orderType,
        time_in_force: timeInForce,
        quantity: Number(quantity),
        price: orderType === 'LIMIT' ? Number(price) : null,
        is_demo: isDemoMode
      });
      setMessage({ text: `${isDemoMode ? '[DEMO] ' : ''}Order Routed: ${side} ${quantity} ${selectedAsset.ticker}`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = "Routing failed";
      if (errData) {
        if (typeof errData === 'string') errMsg = errData;
        else if (errData.error) errMsg = errData.error;
        else if (errData.non_field_errors) errMsg = errData.non_field_errors[0];
        else if (errData.quantity) errMsg = errData.quantity[0];
        else if (errData.price) errMsg = errData.price[0];
        else if (Array.isArray(errData) && errData.length > 0) errMsg = errData[0];
      }
      setMessage({ text: errMsg, type: 'error' });
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
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
               <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                 Broker: <span style={{ color: '#fff', fontWeight: 'bold' }}>{user?.broker_details?.name || 'No Broker Selected'}</span>
               </div>
               <button onClick={() => setIsBrokerModalOpen(true)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Change</button>
             </div>
             
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
                <button style={styles.actionBtn} onClick={() => navigate('/portfolio')}><CreditCard size={14}/> Portfolio</button>
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
                           <tr key={a.id} style={{...styles.fTr, background: selectedAsset?.id === a.id ? 'rgba(250, 204, 21, 0.05)' : 'transparent'}} onClick={() => { setSelectedAsset(a); setIsAnalysisModalOpen(true); }}>
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
        {/* COLUMN 3: EXECUTION (RESTORED) */}
        <div style={styles.tradeCol}>
          <div className="glass-card" style={styles.card}>
             <h3 style={styles.cardTitle}>EXECUTION ENGINE</h3>
             
             {!isDemoMode && user?.kyc_status !== 'APPROVED' ? (
                <div style={{ ...styles.emptyState, opacity: 1, padding: '40px 20px' }}>
                   <Shield size={48} color="rgba(250, 204, 21, 0.8)" style={{ marginBottom: '10px' }} />
                   <h4 style={{ color: '#facc15', margin: '0 0 10px 0' }}>IDENTITY VERIFICATION REQUIRED</h4>
                   <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                      To access Live Trading and Market Execution, regulatory compliance requires you to verify your identity.
                   </p>
                   <button 
                      onClick={() => navigate('/kyc')} 
                      style={{ padding: '12px 24px', background: 'var(--accent-blue)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '800', cursor: 'pointer', marginBottom: '15px' }}
                   >
                      COMPLETE KYC
                   </button>
                   <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                      Or enter Demo Mode via the sidebar to test.
                   </p>
                </div>
             ) : selectedAsset ? (
                <div style={styles.orderForm}>
                  <div style={styles.formSection}>
                     <label style={styles.formLabel}>COMPANY SELECTED</label>
                     <div style={styles.dropdownWrapper}>
                        <select 
                          style={styles.assetDropdown} 
                          value={selectedAsset.id} 
                          onChange={(e) => {
                            const asset = assets.find(a => a.id === parseInt(e.target.value));
                            setSelectedAsset(asset);
                          }}
                        >
                          {assets.map(a => (
                            <option key={a.id} value={a.id} style={styles.dropdownOption}>
                              {a.ticker} | {a.name}
                            </option>
                          ))}
                        </select>
                        <div style={styles.dropdownArrow}>▼</div>
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
                     <span>ORDER VALUE (Excl. Fees)</span>
                     <span>
                        {selectedAsset.market === 'ZSE' ? 'ZWG ' : '$'}
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

      {/* MARKET ANALYSIS MODAL */}
      <AnimatePresence>
        {isAnalysisModalOpen && selectedAsset && (
          <div style={styles.modalOverlay} onClick={() => setIsAnalysisModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.analysisModalContent} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>MARKET ANALYSIS: {selectedAsset.ticker}</h3>
                <button onClick={() => setIsAnalysisModalOpen(false)} style={styles.closeBtn}>×</button>
              </div>
              
              <div style={styles.analysisGrid}>
                <div style={styles.analysisMain}>
                   <h4 style={styles.analysisSubTitle}>COMPANY DESCRIPTION</h4>
                   <p style={styles.descriptionText}>{selectedAsset.description}</p>
                   
                   <div style={styles.analysisMetrics}>
                      <div style={styles.metricItem}><span>BEST ASK:</span> <span>$5.17</span></div>
                      <div style={styles.metricItem}><span>BEST BID:</span> <span>$4.22</span></div>
                      <div style={styles.metricItem}><span>CURRENT PRICE:</span> <span style={{color:'#facc15'}}>{prices[selectedAsset.ticker] || selectedAsset.current_price}</span></div>
                      <div style={styles.metricItem}><span>PRICE CHANGE:</span> <span>0.00</span></div>
                      <div style={styles.metricItem}><span>ASK VOLUME:</span> <span>654</span></div>
                      <div style={styles.metricItem}><span>BID VOLUME:</span> <span>2244</span></div>
                      <div style={styles.metricItem}><span>PREVIOUS PRICE:</span> <span>$5.17</span></div>
                      <div style={styles.metricItem}><span>PERCENTAGE CHANGE:</span> <span>0.00%</span></div>
                   </div>
                </div>
                
                <div style={styles.analysisSecondary}>
                   <div style={styles.statSection}>
                      <div style={styles.statLine}><span>ONE WEEK HIGH:</span> <span>---</span></div>
                      <div style={styles.statLine}><span>THREE MONTHS HIGH:</span> <span>---</span></div>
                      <div style={styles.statLine}><span>ONE YEAR HIGH:</span> <span>---</span></div>
                   </div>
                   <div style={styles.statSection}>
                      <div style={styles.statLine}><span>52 WEEK HIGH:</span> <span>---</span></div>
                      <div style={styles.statLine}><span>52 WEEK LOW:</span> <span>---</span></div>
                   </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                 <button onClick={() => { setIsAnalysisModalOpen(false); setOrderSide('BUY'); setIsOrderModalOpen(true); }} style={styles.modalBuyBtn}>BUY</button>
                 <button onClick={() => { setIsAnalysisModalOpen(false); setOrderSide('SELL'); setIsOrderModalOpen(true); }} style={styles.modalSellBtn}>SELL</button>
                 <button onClick={() => setIsAnalysisModalOpen(false)} style={styles.modalCloseBtn}>CLOSE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER MODAL */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsOrderModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={styles.modalContent} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                   EXECUTION ENGINE: <span style={{color: orderSide === 'BUY' ? 'var(--emerald)' : 'var(--crimson)'}}>{orderSide} ORDER</span>
                </h3>
                <button onClick={() => setIsOrderModalOpen(false)} style={styles.closeBtn}>×</button>
              </div>

              <div style={styles.orderForm}>
                <div style={styles.formSection}>
                  <label style={styles.formLabel}>COMPANY SELECTED</label>
                  <div style={styles.dropdownWrapper}>
                    <select 
                      style={styles.assetDropdown} 
                      value={selectedAsset.id} 
                      onChange={(e) => {
                        const asset = assets.find(a => a.id === parseInt(e.target.value));
                        setSelectedAsset(asset);
                      }}
                    >
                      {assets.map(a => (
                        <option key={a.id} value={a.id} style={styles.dropdownOption}>
                          {a.ticker} | {a.name}
                        </option>
                      ))}
                    </select>
                    <div style={styles.dropdownArrow}>▼</div>
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
                  <div style={styles.sideToggle}>
                    <button 
                      onClick={() => setOrderSide('BUY')} 
                      style={{...styles.toggleBtn, background: orderSide === 'BUY' ? 'var(--emerald)' : 'rgba(255,255,255,0.05)'}}
                    >BUY</button>
                    <button 
                      onClick={() => setOrderSide('SELL')} 
                      style={{...styles.toggleBtn, background: orderSide === 'SELL' ? 'var(--crimson)' : 'rgba(255,255,255,0.05)'}}
                    >SELL</button>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>QUANTITY</label>
                    <input type="number" style={styles.formInput} placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>PRICE ({selectedAsset?.currency})</label>
                    <input 
                      type="number" 
                      style={styles.formInput} 
                      placeholder="0.00" 
                      value={orderType === 'LIMIT' ? price : (prices[selectedAsset?.ticker] || selectedAsset?.current_price)} 
                      onChange={e => setPrice(e.target.value)}
                      readOnly={orderType === 'MARKET'}
                    />
                  </div>
                </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>ORDER VALUE</span>
                      <span>{selectedAsset?.market === 'ZSE' ? 'ZWG ' : '$'} {(quantity * (orderType === 'LIMIT' ? price : (prices[selectedAsset?.ticker] || selectedAsset?.current_price))).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>ESTIMATED FEES ({user?.broker_details ? 'Brokerage + Levies' : 'No Broker'})</span>
                      <span>
                        {user?.broker_details ? (
                          <>
                             {selectedAsset?.market === 'ZSE' ? 'ZWG ' : '$'}
                             {(((quantity * (orderType === 'LIMIT' ? price : (prices[selectedAsset?.ticker] || selectedAsset?.current_price))) * 
                             (user.broker_details[orderSide === 'BUY' ? 'buy_fee_percentage' : 'sell_fee_percentage'] / 100)) || 0).toFixed(2)}
                          </>
                        ) : '---'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.grandTotal}>
                    <div style={styles.totalItem}>
                      <span>ESTIMATED TOTAL</span>
                      <span>
                        {selectedAsset?.market === 'ZSE' ? 'ZWG ' : '$'}
                        {(()=>{
                           const orderVal = quantity * (orderType === 'LIMIT' ? price : (prices[selectedAsset?.ticker] || selectedAsset?.current_price));
                           if (!user?.broker_details) return orderVal.toFixed(2) || "0.00";
                           const fee = orderVal * (user.broker_details[orderSide === 'BUY' ? 'buy_fee_percentage' : 'sell_fee_percentage'] / 100);
                           return (orderSide === 'BUY' ? orderVal + fee : orderVal - fee).toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>

                <button 
                  onClick={() => handlePlaceOrder(orderSide)} 
                  style={{...styles.mainExecBtn, background: orderSide === 'BUY' ? 'var(--emerald)' : 'var(--crimson)'}}
                >
                  PLACE {orderSide} ORDER
                </button>

                {message.text && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{...styles.msgBox, background: message.type === 'error' ? 'var(--crimson-glow)' : 'var(--emerald-glow)'}}>
                    {message.text}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BROKER SELECTION MODAL */}
      <AnimatePresence>
        {isBrokerModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsBrokerModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modalContent} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>SELECT BROKER</h3>
                <button onClick={() => setIsBrokerModalOpen(false)} style={styles.closeBtn}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Choose your preferred broker to route your orders through. Brokerage and transaction fees will apply based on the selected broker.
                </p>
                <div style={styles.dropdownWrapper}>
                  <select 
                     style={styles.assetDropdown} 
                     value={selectedBrokerId} 
                     onChange={(e) => setSelectedBrokerId(e.target.value)}
                  >
                     <option value="" style={styles.dropdownOption}>-- Select a Broker --</option>
                     {brokers.map(b => (
                       <option key={b.id} value={b.id} style={styles.dropdownOption}>
                         {b.name} (Buy: {b.buy_fee_percentage}%, Sell: {b.sell_fee_percentage}%)
                       </option>
                     ))}
                  </select>
                  <div style={styles.dropdownArrow}>▼</div>
                </div>
                <button 
                  onClick={handleChangeBroker} 
                  disabled={!selectedBrokerId}
                  style={{...styles.mainExecBtn, background: selectedBrokerId ? 'var(--accent-blue)' : '#333', opacity: selectedBrokerId ? 1 : 0.5}}
                >
                  SAVE PREFERENCE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  assetDropdown: { 
    width: '100%',
    padding: '14px 18px', 
    background: 'rgba(0,112,243,0.05)', 
    border: '1px solid rgba(0,112,243,0.3)', 
    borderRadius: '12px', 
    color: '#fff', 
    fontSize: '14px', 
    fontWeight: '700',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  dropdownWrapper: { position: 'relative', width: '100%' },
  dropdownArrow: { position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'var(--accent-blue)', pointerEvents: 'none', opacity: 0.7 },
  dropdownOption: { background: '#0a0c10', color: '#fff', padding: '10px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formInput: { padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' },
  grandTotal: { padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px' },
  mainExecBtns: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mainBuyBtn: { padding: '16px', background: 'var(--emerald)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' },
  mainSellBtn: { padding: '16px', background: 'var(--crimson)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer' },
  msgBox: { padding: '15px', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '600' },
  emptyState: { padding: '100px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', opacity: 0.3 },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '40px', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  modalTitle: { fontSize: '18px', fontWeight: '900', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' },
  sideToggle: { display: 'flex', gap: '5px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' },
  toggleBtn: { border: 'none', borderRadius: '8px', padding: '8px 15px', color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' },
  mainExecBtn: { padding: '18px', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  totalItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },

  // New Modal & Analysis Styles
  analysisModalContent: { background: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '90%', maxWidth: '1000px', padding: '30px', position: 'relative' },
  analysisGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', marginTop: '20px' },
  analysisMain: { display: 'flex', flexDirection: 'column', gap: '20px' },
  analysisMetrics: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' },
  metricItem: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' },
  analysisSecondary: { display: 'flex', flexDirection: 'column', gap: '30px' },
  statSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px' },
  modalBuyBtn: { padding: '10px 30px', background: 'var(--emerald)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '900', cursor: 'pointer' },
  modalSellBtn: { padding: '10px 30px', background: 'var(--crimson)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '900', cursor: 'pointer' },
  modalCloseBtn: { padding: '10px 30px', background: '#333', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '900', cursor: 'pointer' },
};

export default Dashboard;

