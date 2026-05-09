import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, TrendingUp } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card" 
        style={styles.loginBox}
      >
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <TrendingUp size={32} color="var(--accent-blue)" />
          </div>
          <h1 style={styles.title}>SecuaTrade</h1>
          <p style={styles.subtitle}>Institutional Grade Trading</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={20} style={styles.icon} />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Access Terminal
          </button>
        </form>

        <div style={styles.footer}>
          <span>New to SecuaTrade? </span>
          <a href="#" style={styles.link}>Request Access</a>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #1a1c20 0%, #0a0b0d 100%)',
  },
  loginBox: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    textAlign: 'center',
  },
  header: {
    marginBottom: '32px',
  },
  logoCircle: {
    width: '64px',
    height: '64px',
    background: 'rgba(0, 112, 243, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    border: '1px solid var(--accent-blue)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    marginBottom: '4px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '14px',
    background: 'var(--accent-blue)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s, opacity 0.2s',
    marginTop: '10px',
  },
  error: {
    color: 'var(--crimson)',
    background: 'var(--crimson-glow)',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  footer: {
    marginTop: '32px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent-blue)',
    textDecoration: 'none',
    fontWeight: '500',
  }
};

export default LoginPage;
