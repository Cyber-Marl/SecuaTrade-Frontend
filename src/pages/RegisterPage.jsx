import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { TrendingUp, Check } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    nationality: '',
    country: '',
    city: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
  });
  
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('accounts/register/', {
        ...formData,
      });
      navigate('/login');
    } catch (err) {
      let errMsg = "Registration failed. Please try again.";
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') errMsg = data;
        else if (data.email) errMsg = `Email: ${data.email[0]}`;
        else if (data.username) errMsg = `Username: ${data.username[0]}`;
        else if (Object.keys(data).length > 0) {
           errMsg = data[Object.keys(data)[0]][0] || errMsg;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.formCard}
      >
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <TrendingUp size={32} color="var(--accent-blue)" />
          </div>
          <h1 style={styles.title}>Create your SecuaTrade account</h1>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Row 1: Title, First Name, Last Name */}
            <div style={styles.titleGroup}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Title <span style={styles.required}>*</span></label>
                <select name="title" value={formData.title} onChange={handleChange} style={styles.input} required>
                  <option value="">Select title</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>First Name(s) <span style={styles.required}>*</span></label>
                <input type="text" name="first_name" placeholder="Enter your first name" value={formData.first_name} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Name <span style={styles.required}>*</span></label>
                <input type="text" name="last_name" placeholder="Enter your last name" value={formData.last_name} onChange={handleChange} style={styles.input} required />
              </div>
            </div>

            {/* Row 2 */}
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Email Address <span style={styles.required}>*</span></label>
              <input type="email" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Date of Birth <span style={styles.required}>*</span></label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={styles.input} required />
            </div>

            {/* Row 3 */}
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Gender <span style={styles.required}>*</span></label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={styles.input} required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Address <span style={styles.required}>*</span></label>
              <input type="text" name="address" placeholder="Enter your address" value={formData.address} onChange={handleChange} style={styles.input} required />
            </div>

            {/* Row 4 */}
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Nationality <span style={styles.required}>*</span></label>
              <select name="nationality" value={formData.nationality} onChange={handleChange} style={styles.input} required>
                <option value="">Select nationality</option>
                <option value="Zimbabwean">Zimbabwean</option>
                <option value="South African">South African</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Country <span style={styles.required}>*</span></label>
              <select name="country" value={formData.country} onChange={handleChange} style={styles.input} required>
                <option value="">Select country</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Row 5 */}
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>City <span style={styles.required}>*</span></label>
              <input type="text" name="city" placeholder="Enter your city" value={formData.city} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Mobile Number <span style={styles.required}>*</span></label>
              <input type="tel" name="mobile_number" placeholder="+263..." value={formData.mobile_number} onChange={handleChange} style={styles.input} required />
            </div>

            {/* Row 6 */}
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Password <span style={styles.required}>*</span></label>
              <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}>Confirm Password <span style={styles.required}>*</span></label>
              <input type="password" name="confirm_password" placeholder="Confirm your password" value={formData.confirm_password} onChange={handleChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <div 
              style={{...styles.checkbox, background: agreed ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)'}}
              onClick={() => setAgreed(!agreed)}
            >
              {agreed && <Check size={12} color="#fff" />}
            </div>
            <span style={styles.checkboxLabel}>
              I agree to the <a href="#" style={styles.link}>Terms & Conditions</a> and <a href="#" style={styles.link}>Privacy Policy</a> <span style={styles.required}>*</span>
            </span>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        
        <div style={styles.footer}>
          <span>Already have an account? </span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={styles.link}>Log In</a>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #1a1c20 0%, #0a0b0d 100%)',
    padding: '40px 20px',
  },
  formCard: {
    width: '100%',
    maxWidth: '800px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoCircle: {
    width: '56px',
    height: '56px',
    background: 'rgba(0, 112, 243, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1c20',
    marginBottom: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1.5fr',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    gridColumn: 'span 1.5',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568',
  },
  required: {
    color: '#e53e3e',
  },
  input: {
    padding: '12px 16px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#1a202c',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#4a5568',
  },
  button: {
    padding: '16px',
    background: '#0088cc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  error: {
    color: '#e53e3e',
    background: '#fff5f5',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #feb2b2',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#4a5568',
  },
  link: {
    color: '#0088cc',
    textDecoration: 'none',
    fontWeight: '500',
  }
};

// Adjust grid layout for 2 columns for most rows
styles.grid = {
  ...styles.grid,
  gridTemplateColumns: 'repeat(2, 1fr)',
};

// Make the first row (Title, First Name, Last Name) fit into the 2-column grid.
// Actually, let's just make it a clean 2-column grid.
styles.inputGroupFull = {
  ...styles.inputGroupFull,
  gridColumn: 'span 1',
};

// Special span for title/firstname/lastname to share the top row
styles.titleGroup = {
  gridColumn: 'span 2',
  display: 'grid',
  gridTemplateColumns: '1fr 2fr 2fr',
  gap: '20px',
};

export default RegisterPage;
