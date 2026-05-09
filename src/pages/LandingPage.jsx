import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, Globe, Smartphone, ArrowRight, BarChart3, Lock, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const tickers = [
    { symbol: 'DLTA.ZW', price: '28.50', change: '+2.4%' },
    { symbol: 'ECO.ZW', price: '15.20', change: '+1.1%' },
    { symbol: 'OMU.ZW', price: '24.10', change: '-0.5%' },
    { symbol: 'SCIL.VX', price: '0.28', change: '+3.2%' },
    { symbol: 'PAD.VX', price: '0.15', change: '0.0%' },
    { symbol: 'CBZ.ZW', price: '18.90', change: '+5.1%' },
  ];

  return (
    <div style={styles.container}>
      {/* 1. NEON TICKER TAPE */}
      <div style={styles.tickerTape}>
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          style={styles.tickerContent}
        >
          {[...tickers, ...tickers, ...tickers].map((t, i) => (
            <div key={i} style={styles.tickerItem}>
              <span style={styles.tickerSymbol}>{t.symbol}</span>
              <span style={styles.tickerPrice}>${t.price}</span>
              <span style={{...styles.tickerChange, color: t.change.startsWith('+') ? 'var(--emerald)' : 'var(--crimson)'}}>
                {t.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 2. GLASS NAVIGATION */}
      <nav style={styles.nav} className="glass-card">
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
             <TrendingUp size={24} color="#fff" />
          </div>
          <span style={styles.logoText}>SecuaTrade</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#" style={styles.navLink}>Markets</a>
          <a href="#" style={styles.navLink}>Institutions</a>
          <a href="#" style={styles.navLink}>Security</a>
          <div style={styles.divider}></div>
          <button onClick={() => navigate('/login')} style={styles.signInBtn}>Login</button>
          <button onClick={() => navigate('/login')} style={styles.getStartedBtn}>Open Account</button>
        </div>
      </nav>

      {/* 3. PREMIUM HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.badge}
          >
            <Zap size={14} fill="currentColor" /> NEXT-GEN TRADING PORTAL
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.mainTitle}
          >
            Master the <span style={styles.gradientText}>Zimbabwean</span> Markets
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={styles.description}
          >
            Institutional-grade execution for ZSE and VFEX. Multi-currency ledgers, 
            atomic settlement, and real-time liquidity at your fingertips.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={styles.heroActions}
          >
            <button onClick={() => navigate('/login')} style={styles.primaryBtn}>
              Enter Terminal <ArrowRight size={20} />
            </button>
            <button style={styles.secondaryBtn}>View Live Markets</button>
          </motion.div>
          
          <div style={styles.statsRow}>
             <div style={styles.stat}>
                <div style={styles.statVal}>2ms</div>
                <div style={styles.statLabel}>Execution Speed</div>
             </div>
             <div style={styles.stat}>
                <div style={styles.statVal}>256-bit</div>
                <div style={styles.statLabel}>Security</div>
             </div>
             <div style={styles.stat}>
                <div style={styles.statVal}>ZWG/USD</div>
                <div style={styles.statLabel}>Multi-Currency</div>
             </div>
          </div>
        </div>

        <div style={styles.heroGraphics}>
          <motion.div 
            initial={{ opacity: 0, rotateY: 20 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 1 }}
            style={styles.mockupWrapper}
          >
            <div style={styles.mainMockup} className="glass-card">
               <div style={styles.mockupHeader}>
                  <div style={styles.dots}><div style={{background: 'var(--crimson)'}}/><div style={{background: '#facc15'}}/><div style={{background: 'var(--emerald)'}}/></div>
                  <div style={styles.mockupSearch}>search assets...</div>
               </div>
               <img src="/hero-mockup.png" style={styles.dashboardPreview} alt="Terminal Preview" />
               
               {/* Floating Trade Modal */}
               <motion.div 
                 animate={{ y: [0, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 style={styles.floatingModal} 
                 className="glass-card"
               >
                  <div style={styles.modalTitle}>PLACE BUY ORDER</div>
                  <div style={styles.modalPrice}>$28.50</div>
                  <div style={styles.modalBtn}>EXECUTE</div>
               </motion.div>
            </div>
          </motion.div>
          <div style={styles.bgGlow}></div>
        </div>
      </section>

      {/* 4. TECH SECTION */}
      <section style={styles.techSection}>
         <div style={styles.techGrid}>
            <div style={styles.techCard} className="glass-card">
               <div style={styles.iconCircle}><Cpu size={32} color="var(--accent-blue)" /></div>
               <h3>Matching Engine</h3>
               <p>Price-time priority algorithm ensuring fair execution for every trade.</p>
            </div>
            <div style={styles.techCard} className="glass-card">
               <div style={styles.iconCircle}><BarChart3 size={32} color="var(--emerald)" /></div>
               <h3>Advanced Analytics</h3>
               <p>Deep market depth and historical data for professional analysis.</p>
            </div>
            <div style={styles.techCard} className="glass-card">
               <div style={styles.iconCircle}><Lock size={32} color="var(--crimson)" /></div>
               <h3>Double-Entry Ledger</h3>
               <p>Bank-grade financial integrity with atomic transaction settlement.</p>
            </div>
         </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
    overflowX: 'hidden',
  },
  tickerTape: {
    background: 'rgba(0,0,0,0.6)',
    borderBottom: '1px solid var(--border)',
    overflow: 'hidden',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
  },
  tickerContent: {
    display: 'flex',
    whiteSpace: 'nowrap',
    gap: '60px',
    padding: '0 30px',
  },
  tickerItem: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  tickerSymbol: { color: 'var(--text-secondary)' },
  tickerPrice: { color: '#fff' },
  tickerChange: { fontWeight: '800' },
  
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    margin: '20px 40px',
    borderRadius: '16px',
    position: 'sticky',
    top: '20px',
    zIndex: 100,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'var(--accent-blue)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px var(--accent-blue-glow)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-1.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  divider: {
    width: '1px',
    height: '20px',
    background: 'var(--border)',
  },
  signInBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  getStartedBtn: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    padding: '60px 80px 100px',
    gap: '80px',
    perspective: '1000px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(0, 112, 243, 0.1)',
    color: 'var(--accent-blue)',
    borderRadius: '30px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.1em',
    marginBottom: '24px',
    border: '1px solid var(--accent-blue-glow)',
  },
  mainTitle: {
    fontSize: '84px',
    fontWeight: '900',
    margin: 0,
    lineHeight: 1,
    letterSpacing: '-5px',
  },
  gradientText: {
    background: 'linear-gradient(to right, #0070f3, #00dfd8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  description: {
    fontSize: '20px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: '32px 0 48px',
    maxWidth: '540px',
  },
  heroActions: {
    display: 'flex',
    gap: '20px',
    marginBottom: '64px',
  },
  primaryBtn: {
    padding: '18px 36px',
    background: 'var(--accent-blue)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '18px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    boxShadow: '0 20px 40px var(--accent-blue-glow)',
  },
  secondaryBtn: {
    padding: '18px 36px',
    background: 'var(--bg-card)',
    color: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    gap: '40px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  heroGraphics: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockupWrapper: {
    width: '100%',
    maxWidth: '600px',
    zIndex: 2,
  },
  mainMockup: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '24px',
    padding: '0',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid var(--border)',
  },
  mockupHeader: {
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  dots: {
    display: 'flex',
    gap: '6px',
  },
  mockupSearch: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.2)',
    background: 'rgba(0,0,0,0.2)',
    padding: '6px 12px',
    borderRadius: '6px',
    flex: 1,
  },
  dashboardPreview: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    opacity: 0.6,
  },
  floatingModal: {
    position: 'absolute',
    top: '100px',
    left: '-40px',
    width: '200px',
    padding: '24px',
    textAlign: 'center',
    zIndex: 10,
    boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
    border: '1px solid var(--border)',
  },
  modalTitle: { fontSize: '10px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '12px', letterSpacing: '0.1em' },
  modalPrice: { fontSize: '28px', fontWeight: '900', marginBottom: '16px' },
  modalBtn: { padding: '12px', background: 'var(--emerald)', borderRadius: '8px', fontSize: '12px', fontWeight: '800' },
  
  bgGlow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, var(--accent-blue-glow) 0%, transparent 70%)',
    zIndex: 1,
  },
  
  techSection: {
    padding: '0 80px 100px',
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '30px',
  },
  techCard: {
    padding: '48px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    transition: 'transform 0.3s',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border)',
    marginBottom: '8px',
  }
};

export default LandingPage;
