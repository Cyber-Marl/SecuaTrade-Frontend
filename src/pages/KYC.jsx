import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, UploadCloud, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const KYC = () => {
  const { user, refreshProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({ document_type: 'ID_CARD', file: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('accounts/kyc-documents/');
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching KYC documents", err);
    }
  };

  const hasIdentity = documents.some(d => (d.document_type === 'ID_CARD' || d.document_type === 'PASSPORT') && d.status !== 'REJECTED');
  const hasProofOfAddress = documents.some(d => d.document_type === 'PROOF_OF_ADDRESS' && d.status !== 'REJECTED');

  useEffect(() => {
    if (documents.length >= 0) {
      if (!hasIdentity) {
        setFormData(prev => ({ ...prev, document_type: 'ID_CARD' }));
      } else if (!hasProofOfAddress) {
        setFormData(prev => ({ ...prev, document_type: 'PROOF_OF_ADDRESS' }));
      }
    }
  }, [hasIdentity, hasProofOfAddress, documents.length]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert('Please select a file to upload.');

    const data = new FormData();
    data.append('document_type', formData.document_type);
    data.append('file', formData.file);

    setLoading(true);
    try {
      await api.post('accounts/kyc-documents/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Document uploaded successfully!');
      setFormData({ document_type: 'ID_CARD', file: null });
      // Reset file input manually since controlled input for file doesn't clear easily
      document.getElementById('kyc-file-input').value = '';
      fetchDocuments();
      refreshProfile(); // Refresh user to get updated kyc_status
    } catch (err) {
      console.error("Upload error", err);
      alert('Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={24} color="var(--emerald)" />;
      case 'REJECTED': return <AlertCircle size={24} color="var(--crimson)" />;
      case 'SUBMITTED': return <Clock size={24} color="#facc15" />;
      default: return <Shield size={24} color="var(--text-secondary)" />;
    }
  };

  const kycStatus = user?.kyc_status || 'UNVERIFIED';

  return (
    <Layout>
      <TopBar title="Identity Verification" />
      
      <div style={styles.headerInfo}>
         <p style={styles.subtitle}>Complete your KYC to unlock full trading limits and withdrawals.</p>
      </div>

      <div style={styles.statusBanner}>
        <div style={styles.statusIconWrapper}>
            {renderStatusIcon(kycStatus)}
        </div>
        <div>
            <h3 style={styles.statusTitle}>Verification Status: {kycStatus}</h3>
            <p style={styles.statusDesc}>
                {kycStatus === 'UNVERIFIED' && 'Please upload your identity documents to begin verification.'}
                {kycStatus === 'SUBMITTED' && 'Your documents are under review. This usually takes 1-2 business days.'}
                {kycStatus === 'APPROVED' && 'Your identity has been verified. You have full access to SecuaTrade.'}
                {kycStatus === 'REJECTED' && 'Your verification was rejected. Please review your documents and try again.'}
            </p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Upload Form */}
        <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <UploadCloud size={18} color="var(--accent-blue)" />
              <span style={styles.cardHeaderText}>Upload Document</span>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '13px' }}>Required Documents</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                   {documents.some(d => d.document_type === 'ID_CARD' || d.document_type === 'PASSPORT') ? 
                     <CheckCircle size={16} color="var(--emerald)" /> : 
                     <AlertCircle size={16} color="var(--text-secondary)" />
                   }
                   <span style={{ fontSize: '12px', color: documents.some(d => d.document_type === 'ID_CARD' || d.document_type === 'PASSPORT') ? '#fff' : 'var(--text-secondary)' }}>
                     National ID or Passport
                   </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   {documents.some(d => d.document_type === 'PROOF_OF_ADDRESS') ? 
                     <CheckCircle size={16} color="var(--emerald)" /> : 
                     <AlertCircle size={16} color="var(--text-secondary)" />
                   }
                   <span style={{ fontSize: '12px', color: documents.some(d => d.document_type === 'PROOF_OF_ADDRESS') ? '#fff' : 'var(--text-secondary)' }}>
                     Proof of Address (Utility Bill, Bank Statement)
                   </span>
                </div>
            </div>

            <form onSubmit={handleUpload} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Document Type</label>
                    <select 
                        style={styles.formInput} 
                        value={formData.document_type}
                        onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                    >
                        {!hasIdentity && <option value="ID_CARD">National ID Card</option>}
                        {!hasIdentity && <option value="PASSPORT">Passport</option>}
                        {!hasProofOfAddress && <option value="PROOF_OF_ADDRESS">Proof of Address</option>}
                        {hasIdentity && hasProofOfAddress && <option value="ID_CARD">All required documents uploaded</option>}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Select File (Image or PDF)</label>
                    <input 
                        id="kyc-file-input"
                        type="file" 
                        accept="image/*,.pdf"
                        style={styles.fileInput}
                        onChange={handleFileChange}
                        disabled={hasIdentity && hasProofOfAddress}
                    />
                </div>

                <button 
                    type="submit" 
                    style={{
                        ...styles.submitBtn,
                        opacity: loading || !formData.file || (hasIdentity && hasProofOfAddress) ? 0.5 : 1,
                        cursor: loading || !formData.file || (hasIdentity && hasProofOfAddress) ? 'not-allowed' : 'pointer'
                    }} 
                    disabled={loading || !formData.file || (hasIdentity && hasProofOfAddress)}
                >
                    {loading ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <Shield size={18} color="var(--emerald)" />
              <span style={styles.cardHeaderText}>Uploaded Documents</span>
            </div>

            <div style={styles.docList}>
                {documents.length === 0 ? (
                    <div style={styles.emptyState}>No documents uploaded yet.</div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} style={styles.docItem}>
                            <div>
                                <div style={styles.docType}>{doc.document_type.replace(/_/g, ' ')}</div>
                                <div style={styles.docDate}>{new Date(doc.uploaded_at).toLocaleString()}</div>
                            </div>
                            <div style={styles.docStatus}>
                                {doc.status === 'REJECTED' ? (
                                    <span style={{color: 'var(--crimson)'}}>Rejected</span>
                                ) : doc.status === 'APPROVED' || doc.is_verified ? (
                                    <span style={{color: 'var(--emerald)'}}>Verified</span>
                                ) : (
                                    <span style={{color: '#facc15'}}>Pending</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  headerInfo: { marginBottom: '20px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
  
  statusBanner: {
      display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', 
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '15px', marginBottom: '30px'
  },
  statusIconWrapper: {
      width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  statusTitle: { fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' },
  statusDesc: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardHeaderText: { fontSize: '14px', fontWeight: '700', color: '#fff' },

  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  formLabel: { fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' },
  formInput: { padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' },
  fileInput: { padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  submitBtn: { padding: '16px', background: 'var(--accent-blue)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '900' },

  docList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  emptyState: { padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' },
  docItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' },
  docType: { fontSize: '14px', fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  docDate: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' },
  docStatus: { fontSize: '13px', fontWeight: '800' }
};

export default KYC;
