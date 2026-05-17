import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X, FileText, User } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingKYC, setPendingKYC] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.user?.is_staff) {
      fetchPendingKYC();
    }
  }, [user]);

  const fetchPendingKYC = async () => {
    try {
      const res = await api.get('accounts/admin/kyc/');
      setPendingKYC(res.data);
    } catch (err) {
      console.error("Failed to fetch pending KYC", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      await api.post(`accounts/admin/kyc/${id}/${action}/`);
      setPendingKYC(pendingKYC.filter(p => p.id !== id));
      setSelectedProfile(null);
    } catch (err) {
      console.error(`Failed to ${action} KYC`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDocument = async (profileId, documentId) => {
    setActionLoading(true);
    try {
      await api.post(`accounts/admin/kyc/${profileId}/reject_document/`, { document_id: documentId });
      
      // Remove just this document from the view, but keep the user in the queue
      setSelectedProfile(prev => ({
        ...prev,
        kyc_documents: prev.kyc_documents.filter(d => d.id !== documentId)
      }));
    } catch (err) {
      console.error('Failed to reject document', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDocument = async (profileId, documentId) => {
    setActionLoading(true);
    try {
      await api.post(`accounts/admin/kyc/${profileId}/approve_document/`, { document_id: documentId });
      
      // Update local state to mark this document as approved
      setSelectedProfile(prev => ({
        ...prev,
        kyc_documents: prev.kyc_documents.map(d => 
          d.id === documentId ? { ...d, status: 'APPROVED', is_verified: true } : d
        )
      }));
    } catch (err) {
      console.error('Failed to approve document', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user?.user?.is_staff) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Shield size={24} color="var(--accent-blue)" />
            <h1>Admin Control Panel</h1>
          </div>
          <p style={styles.subtitle}>Manage platform compliance and user verification.</p>
        </div>

        <div style={styles.grid}>
          {/* KYC Queue List */}
          <div className="glass-card" style={styles.card}>
            <h3 style={styles.cardTitle}>PENDING KYC QUEUE ({pendingKYC.length})</h3>
            
            {loading ? (
              <div style={styles.emptyState}>Loading queue...</div>
            ) : pendingKYC.length === 0 ? (
              <div style={styles.emptyState}>
                <Check size={32} color="var(--emerald)" style={{ marginBottom: '10px' }} />
                No pending KYC applications.
              </div>
            ) : (
              <div style={styles.list}>
                {pendingKYC.map(profile => (
                  <div 
                    key={profile.id} 
                    style={{
                      ...styles.listItem, 
                      background: selectedProfile?.id === profile.id ? 'rgba(0,112,243,0.1)' : 'transparent',
                      borderLeft: selectedProfile?.id === profile.id ? '3px solid var(--accent-blue)' : '3px solid transparent'
                    }}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div style={styles.listMain}>
                      <User size={16} color="var(--text-secondary)" />
                      <span style={styles.listName}>{profile.user.first_name} {profile.user.last_name}</span>
                    </div>
                    <span style={styles.listDate}>{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Details & Document Viewer */}
          <div className="glass-card" style={styles.detailsCard}>
            {selectedProfile ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.detailsContent}>
                <div style={styles.detailsHeader}>
                  <h2>{selectedProfile.user.first_name} {selectedProfile.user.last_name}</h2>
                  <span style={styles.statusBadge}>PENDING REVIEW</span>
                </div>
                
                <div style={styles.infoGrid}>
                  <div style={styles.infoGroup}>
                    <span style={styles.infoLabel}>Email Address</span>
                    <span style={styles.infoValue}>{selectedProfile.user.email}</span>
                  </div>
                  <div style={styles.infoGroup}>
                    <span style={styles.infoLabel}>Phone Number</span>
                    <span style={styles.infoValue}>{selectedProfile.mobile_number || 'N/A'}</span>
                  </div>
                  <div style={styles.infoGroup}>
                    <span style={styles.infoLabel}>Nationality</span>
                    <span style={styles.infoValue}>{selectedProfile.nationality || 'N/A'}</span>
                  </div>
                  <div style={styles.infoGroup}>
                    <span style={styles.infoLabel}>Address</span>
                    <span style={styles.infoValue}>{selectedProfile.address}, {selectedProfile.city}, {selectedProfile.country}</span>
                  </div>
                </div>

                <div style={styles.documentsSection}>
                  <h3 style={styles.docTitle}>UPLOADED DOCUMENTS</h3>
                  {selectedProfile.kyc_documents && selectedProfile.kyc_documents.filter(d => d.status !== 'REJECTED').length > 0 ? (
                    <div style={styles.docGrid}>
                      {selectedProfile.kyc_documents.filter(d => d.status !== 'REJECTED').map(doc => (
                        <div key={doc.id} style={styles.docItem}>
                          <div style={styles.docIcon}><FileText size={24} color="var(--accent-blue)" /></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <div style={{...styles.docInfo, justifyContent: 'space-between'}}>
                              <div>
                                <span style={styles.docType}>{doc.document_type.replace('_', ' ')}</span>
                                {doc.status === 'APPROVED' && <span style={{marginLeft: '8px', color: 'var(--emerald)', fontSize: '12px'}}>(Approved)</span>}
                              </div>
                              <a href={doc.file} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>View Document</a>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleRejectDocument(selectedProfile.id, doc.id)}
                                disabled={actionLoading}
                                style={{...styles.rejectBtn, padding: '6px 12px', fontSize: '10px', flex: 1}}
                              >
                                <X size={12} /> REJECT
                              </button>
                              {doc.status !== 'APPROVED' && (
                                <button 
                                  onClick={() => handleApproveDocument(selectedProfile.id, doc.id)}
                                  disabled={actionLoading}
                                  style={{...styles.approveBtn, padding: '6px 12px', fontSize: '10px', flex: 1}}
                                >
                                  <Check size={12} /> APPROVE
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyState}>No documents uploaded by this user.</div>
                  )}
                </div>

                <div style={styles.actions}>
                  <button 
                    onClick={() => handleAction(selectedProfile.id, 'reject')}
                    disabled={actionLoading}
                    style={styles.rejectBtn}
                  >
                    <X size={16} />
                    REJECT APPLICATION
                  </button>
                  <button 
                    onClick={() => handleAction(selectedProfile.id, 'approve')}
                    disabled={
                      actionLoading || 
                      !selectedProfile.kyc_documents.some(d => d.status === 'APPROVED' && (d.document_type === 'ID_CARD' || d.document_type === 'PASSPORT')) ||
                      !selectedProfile.kyc_documents.some(d => d.status === 'APPROVED' && d.document_type === 'PROOF_OF_ADDRESS')
                    }
                    style={{
                      ...styles.approveBtn, 
                      opacity: actionLoading || 
                      !selectedProfile.kyc_documents.some(d => d.status === 'APPROVED' && (d.document_type === 'ID_CARD' || d.document_type === 'PASSPORT')) ||
                      !selectedProfile.kyc_documents.some(d => d.status === 'APPROVED' && d.document_type === 'PROOF_OF_ADDRESS') ? 0.5 : 1,
                      cursor: actionLoading || 
                      !selectedProfile.kyc_documents.some(d => d.status === 'APPROVED' && (d.document_type === 'ID_CARD' || d.document_type === 'PASSPORT')) ||
                      !selectedProfile.kyc_documents.some(d => d.status === 'APPROVED' && d.document_type === 'PROOF_OF_ADDRESS') ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Check size={16} />
                    APPROVE ACCOUNT
                  </button>
                </div>
              </motion.div>
            ) : (
              <div style={styles.emptyState}>
                Select a user from the queue to review their KYC application.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
  },
  header: {
    marginBottom: '10px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#fff',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    marginTop: '5px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '20px',
    flex: 1,
    minHeight: '0',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflow: 'hidden',
  },
  detailsCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '30px',
    overflowY: 'auto',
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: '900',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    flex: 1,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  listMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  listName: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  listDate: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    textAlign: 'center',
    height: '100%',
  },
  detailsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    height: '100%',
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '20px',
  },
  statusBadge: {
    background: 'rgba(250, 204, 21, 0.1)',
    color: '#facc15',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.05em',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  infoLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  infoValue: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: '500',
  },
  documentsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
  },
  docTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#fff',
    margin: 0,
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  docIcon: {
    padding: '10px',
    background: 'rgba(0,112,243,0.1)',
    borderRadius: '8px',
  },
  docInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  docType: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  viewLink: {
    color: 'var(--accent-blue)',
    fontSize: '11px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'var(--emerald)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  rejectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'transparent',
    color: 'var(--crimson)',
    border: '1px solid var(--crimson)',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }
};

export default AdminDashboard;
