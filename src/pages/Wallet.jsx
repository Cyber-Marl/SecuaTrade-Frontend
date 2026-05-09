import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, 
  CreditCard, History, X, CheckCircle, Smartphone, Building
} from 'lucide-react';

const Wallet = () => {
  const { user, isDemoMode, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [ledger, setLedger] = useState([]);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'DEPOSIT_SELECT', 'BANK', 'ECOCASH', 'INNBUCKS', 'WITHDRAW'
  
  const [formData, setFormData] = useState({
    amount: '',
    identifier: '',
    institution: '',
    type: 'DEPOSIT'
  });

  useEffect(() => {
    fetchWalletData();
    fetchLinkedAccounts();
  }, [isDemoMode]);

  const fetchWalletData = async () => {
    try {
      const res = await api.get('accounts/ledger/', { params: { is_demo: isDemoMode } });
      setLedger(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wallet data", err);
      setLoading(false);
    }
  };

  const fetchLinkedAccounts = async () => {
    try {
      const res = await api.get('accounts/payment-methods/');
      setLinkedAccounts(res.data);
    } catch (err) {
      console.error("Error fetching linked accounts", err);
    }
  };

  const handleLinkAccount = async (methodType) => {
    try {
      await api.post('accounts/payment-methods/', {
        method_type: methodType,
        account_identifier: formData.identifier,
        institution_name: formData.institution || methodType,
        account_name: user?.user?.username
      });
      setShowModal(null);
      fetchLinkedAccounts();
      setFormData({ amount: '', identifier: '', institution: '', type: 'DEPOSIT' });
    } catch (err) {
      alert("Failed to link account");
    }
  };

  const handleTransaction = async (type, methodType) => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    
    try {
      // Simulate real transaction logic
      await api.post('accounts/ledger/', {
        amount: formData.amount,
        currency: 'USD',
        transaction_type: type === 'DEPOSIT' ? 'CREDIT' : 'DEBIT',
        description: `${type} via ${methodType}`,
        reference: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        is_demo: isDemoMode
      });
      
      // Update balance in AuthContext
      fetchUser();
      fetchWalletData();
      setShowModal(null);
      setFormData({ amount: '', identifier: '', institution: '', type: 'DEPOSIT' });
    } catch (err) {
      alert("Transaction failed");
    }
  };

  const tabs = ['Overview', 'Client Statement', 'Held Funds', 'Transactions', 'Sell Funds Pending'];
  const mainBalance = isDemoMode ? user?.demo_usd_balance : user?.usd_balance;
  const heldFunds = 0.00;
  const pendingFunds = 0.00;
  const totalFunds = parseFloat(mainBalance) + heldFunds + pendingFunds;

  const isLinked = (type) => linkedAccounts.some(a => a.method_type === type);
  const getLinkedAccount = (type) => linkedAccounts.find(a => a.method_type === type);

  return (
    <Layout>
      <TopBar title="Wallet" />
      
      <div style={styles.headerInfo}>
         <p style={styles.subtitle}>Manage your funds and transactions</p>
      </div>

      <div style={styles.tabContainer}>
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab, 
              color: activeTab === tab ? '#facc15' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid #facc15' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={styles.walletGrid}>
        {/* WALLET BALANCE CARD */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <WalletIcon size={18} color="var(--accent-blue)" />
            <span style={styles.cardHeaderText}>Wallet Balance</span>
          </div>
          
          <div style={styles.mainBalanceSection}>
            <div style={styles.currencyLabel}>US${mainBalance}</div>
            <div style={styles.tradableLabel}>Tradable Funds</div>
          </div>

          <div style={styles.subBalanceList}>
            <div style={styles.subBalanceItem}>
              <span>Sell Funds Pending</span>
              <span>US${pendingFunds.toFixed(4)}</span>
            </div>
            <div style={styles.subBalanceItem}>
              <span>Held Funds</span>
              <span>US${heldFunds.toFixed(4)}</span>
            </div>
            <div style={styles.balanceDivider}></div>
            <div style={{...styles.subBalanceItem, fontWeight: '700', color: '#fff'}}>
              <span>Total Funds</span>
              <span>US${totalFunds.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* WALLET ACTIONS CARD */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <CreditCard size={18} color="var(--accent-blue)" />
            <span style={styles.cardHeaderText}>Wallet Actions</span>
          </div>

          <div style={styles.actionRow}>
            <button style={styles.mainActionBtn} onClick={() => setShowModal('DEPOSIT_SELECT')}>
              <ArrowDownCircle size={16} /> Deposit
            </button>
            <button style={{...styles.mainActionBtn, background: 'rgba(255,255,255,0.05)'}} onClick={() => setShowModal('WITHDRAW')}>
              <ArrowUpCircle size={16} /> Withdraw
            </button>
          </div>

          <div style={styles.depositMethods}>
            <label style={styles.methodLabel}>Linked Deposit Methods</label>
            <div style={styles.methodList}>
              <div 
                style={{...styles.methodLogo, borderColor: isLinked('BANK') ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)'}}
                onClick={() => setShowModal('BANK')}
              >
                {isLinked('BANK') && <CheckCircle size={10} style={styles.linkedBadge} />}
                BANK
              </div>
              <div 
                style={{...styles.methodLogo, borderColor: isLinked('ECOCASH') ? 'var(--emerald)' : 'rgba(255,255,255,0.08)'}}
                onClick={() => setShowModal('ECOCASH')}
              >
                {isLinked('ECOCASH') && <CheckCircle size={10} style={styles.linkedBadge} />}
                EcoCash
              </div>
              <div 
                style={{...styles.methodLogo, borderColor: isLinked('INNBUCKS') ? '#facc15' : 'rgba(255,255,255,0.08)'}}
                onClick={() => setShowModal('INNBUCKS')}
              >
                {isLinked('INNBUCKS') && <CheckCircle size={10} style={styles.linkedBadge} />}
                InnBucks
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="glass-card" style={{...styles.card, marginTop: '20px'}}>
           <div style={styles.cardHeader}>
              <History size={18} color="var(--accent-blue)" />
              <span style={styles.cardHeaderText}>Recent Activity</span>
           </div>
           <div style={styles.transactionList}>
              {ledger.slice(0, 5).map((tx, i) => (
                <div key={i} style={styles.txItem}>
                  <div style={styles.txLeft}>
                    <div style={styles.txIcon}>
                      {tx.transaction_type === 'CREDIT' ? <ArrowDownCircle size={14} color="var(--emerald)" /> : <ArrowUpCircle size={14} color="var(--crimson)" />}
                    </div>
                    <div>
                      <div style={styles.txType}>{tx.transaction_type === 'CREDIT' ? 'DEPOSIT' : 'WITHDRAWAL'}</div>
                      <div style={styles.txDate}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{...styles.txAmount, color: tx.transaction_type === 'CREDIT' ? 'var(--emerald)' : '#fff'}}>
                    {tx.transaction_type === 'CREDIT' ? '+' : '-'}{tx.amount} {tx.currency}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showModal && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{scale: 0.9, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.9, opacity: 0}}
              className="glass-card"
              style={styles.modalContent}
            >
              <div style={styles.modalHeader}>
                <div style={styles.modalTitleGroup}>
                  {showModal === 'BANK' && <Building size={20} color="var(--accent-blue)" />}
                  {showModal === 'ECOCASH' && <Smartphone size={20} color="var(--emerald)" />}
                  {showModal === 'INNBUCKS' && <CreditCard size={20} color="#facc15" />}
                  <h2 style={styles.modalTitle}>
                    {showModal} {isLinked(showModal) ? 'Deposit' : 'Linking'}
                  </h2>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowModal(null)}><X size={20} /></button>
              </div>

              <div style={styles.modalBody}>
                {showModal === 'ECOCASH' && (
                  isLinked('ECOCASH') ? (
                    <div style={styles.linkedView}>
                       <div style={styles.linkedInfo}>
                          <label style={styles.formLabel}>Linked Account</label>
                          <div style={styles.linkedVal}>{getLinkedAccount('ECOCASH').account_identifier}</div>
                          <div style={styles.linkedName}>{user?.user?.first_name} {user?.user?.last_name}</div>
                          <div style={styles.linkedStatus}><CheckCircle size={12} /> Linked</div>
                       </div>
                       <div style={styles.formGroup}>
                          <label style={styles.formLabel}>Amount (USD)</label>
                          <input 
                            type="number" 
                            style={styles.formInput} 
                            placeholder="0.00" 
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                          />
                       </div>
                       <button style={styles.submitBtn} onClick={() => handleTransaction('DEPOSIT', 'ECOCASH')}>+ Top-up Wallet</button>
                    </div>
                  ) : (
                    <div style={styles.linkFlow}>
                      <p style={styles.linkDesc}>Link your EcoCash number to start depositing instantly.</p>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Mobile Number</label>
                        <input 
                          type="text" 
                          style={styles.formInput} 
                          placeholder="26377..." 
                          value={formData.identifier}
                          onChange={e => setFormData({...formData, identifier: e.target.value})}
                        />
                      </div>
                      <button style={styles.submitBtn} onClick={() => handleLinkAccount('ECOCASH')}>Link EcoCash</button>
                    </div>
                  )
                )}

                {showModal === 'INNBUCKS' && (
                  isLinked('INNBUCKS') ? (
                    <div style={styles.linkedView}>
                       <div style={styles.linkedInfo}>
                          <label style={styles.formLabel}>Linked Account</label>
                          <div style={styles.linkedVal}>{getLinkedAccount('INNBUCKS').account_identifier}</div>
                          <div style={styles.linkedStatus}><CheckCircle size={12} /> Linked</div>
                       </div>
                       <div style={styles.formGroup}>
                          <label style={styles.formLabel}>Amount (USD)</label>
                          <input 
                            type="number" 
                            style={styles.formInput} 
                            placeholder="0.00" 
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                          />
                       </div>
                       <button style={{...styles.submitBtn, background: '#facc15', color: '#000'}} onClick={() => handleTransaction('DEPOSIT', 'INNBUCKS')}>Top-up via InnBucks</button>
                    </div>
                  ) : (
                    <div style={styles.linkFlow}>
                      <p style={styles.linkDesc}>Enter your InnBucks mobile number to link your account.</p>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Mobile Number</label>
                        <input 
                          type="text" 
                          style={styles.formInput} 
                          placeholder="26377..." 
                          value={formData.identifier}
                          onChange={e => setFormData({...formData, identifier: e.target.value})}
                        />
                      </div>
                      <button style={{...styles.submitBtn, background: 'var(--accent-blue)'}} onClick={() => handleLinkAccount('INNBUCKS')}>Link Account</button>
                    </div>
                  )
                )}

                {showModal === 'BANK' && (
                  <div style={styles.linkFlow}>
                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>Transfer Type</label>
                       <select style={styles.formInput}>
                         <option>Select transfer type</option>
                         <option>RTGS / Internal Transfer</option>
                       </select>
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>Amount</label>
                       <input 
                         type="number" 
                         style={styles.formInput} 
                         placeholder="0" 
                         value={formData.amount}
                         onChange={e => setFormData({...formData, amount: e.target.value})}
                       />
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>Bank Account</label>
                       <select 
                         style={styles.formInput}
                         onChange={e => setFormData({...formData, identifier: e.target.value, institution: 'NBS'})}
                       >
                         <option>Select bank account</option>
                         <option value="3211320716451">NATIONAL BUILDING SOCIETY - 3211320716451 (Primary)</option>
                         <option value="9921320716451">CBZ BANK - 9921320716451</option>
                       </select>
                    </div>
                    <button style={{...styles.submitBtn, background: 'var(--accent-blue)'}} onClick={() => handleTransaction('DEPOSIT', 'BANK')}>
                      Deposit USD {formData.amount || '0.00'}
                    </button>
                  </div>
                )}

                {showModal === 'WITHDRAW' && (
                  <div style={styles.linkFlow}>
                    <p style={styles.linkDesc}>Select a linked method to withdraw funds.</p>
                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>Withdrawal Method</label>
                       <select 
                         style={styles.formInput}
                         onChange={e => setFormData({...formData, institution: e.target.value})}
                       >
                         <option>Select method</option>
                         {linkedAccounts.map(a => (
                           <option key={a.id} value={a.method_type}>{a.method_type} - {a.account_identifier}</option>
                         ))}
                       </select>
                    </div>
                    <div style={styles.formGroup}>
                       <label style={styles.formLabel}>Amount (USD)</label>
                       <input 
                         type="number" 
                         style={styles.formInput} 
                         placeholder="0.00" 
                         value={formData.amount}
                         onChange={e => setFormData({...formData, amount: e.target.value})}
                       />
                    </div>
                    <button style={{...styles.submitBtn, background: 'var(--crimson)'}} onClick={() => handleTransaction('WITHDRAW', formData.institution)}>
                      Confirm Withdrawal
                    </button>
                  </div>
                )}
                
                {showModal === 'DEPOSIT_SELECT' && (
                  <div style={styles.methodGrid}>
                    <button style={styles.methodCard} onClick={() => setShowModal('BANK')}>
                       <Building size={24} color="var(--accent-blue)" />
                       <span>Bank Transfer</span>
                    </button>
                    <button style={styles.methodCard} onClick={() => setShowModal('ECOCASH')}>
                       <Smartphone size={24} color="var(--emerald)" />
                       <span>EcoCash</span>
                    </button>
                    <button style={styles.methodCard} onClick={() => setShowModal('INNBUCKS')}>
                       <CreditCard size={24} color="#facc15" />
                       <span>InnBucks</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

const styles = {
  headerInfo: { marginBottom: '10px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
  tabContainer: { display: 'flex', gap: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' },
  tab: { background: 'none', border: 'none', padding: '12px 5px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' },
  
  walletGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardHeaderText: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  
  mainBalanceSection: { textAlign: 'center', padding: '20px 0' },
  currencyLabel: { fontSize: '36px', fontWeight: '900', color: '#fff' },
  tradableLabel: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' },
  
  subBalanceList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  subBalanceItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' },
  balanceDivider: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '5px 0' },
  
  actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  mainActionBtn: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '12px', background: '#fff', color: '#000', borderRadius: '8px', 
    border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
  },
  
  depositMethods: { marginTop: '10px' },
  methodLabel: { fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '15px', display: 'block' },
  methodList: { display: 'flex', gap: '15px' },
  methodLogo: { 
    padding: '10px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', fontSize: '14px', fontWeight: '800', color: '#fff', cursor: 'pointer', position: 'relative'
  },
  linkedBadge: { position: 'absolute', top: '-5px', right: '-5px', color: 'var(--emerald)' },

  transactionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  txItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' },
  txLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
  txIcon: { width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  txType: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  txDate: { fontSize: '11px', color: 'var(--text-secondary)' },
  txAmount: { fontSize: '14px', fontWeight: '800' },

  // MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' },
  modalContent: { width: '450px', padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  modalTitle: { fontSize: '20px', fontWeight: '800', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  
  modalBody: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  formLabel: { fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' },
  formInput: { padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' },
  submitBtn: { padding: '16px', background: 'var(--emerald)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  
  linkedView: { display: 'flex', flexDirection: 'column', gap: '20px' },
  linkedInfo: { padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
  linkedVal: { fontSize: '22px', fontWeight: '900', color: '#fff' },
  linkedName: { fontSize: '12px', color: 'var(--text-secondary)' },
  linkedStatus: { fontSize: '10px', color: 'var(--emerald)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' },
  
  linkFlow: { display: 'flex', flexDirection: 'column', gap: '20px' },
  linkDesc: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' },

  methodGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' },
  methodCard: { padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }
};

export default Wallet;

