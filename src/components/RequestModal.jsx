import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RequestModal = ({ donor, isOpen, onClose }) => {
  const { currentUser, sendMessageToDonor } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);

  // Reset message each time a new donor is selected
  useEffect(() => {
    if (donor) {
      setMessage(
        `Hello ${donor.name}, I urgently require ${donor.bloodGroup} blood for a patient. Please contact me if you are available to donate.`
      );
      setIsUrgent(true);
    }
  }, [donor]);

  if (!isOpen || !donor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in first to send direct donor requests', 'error');
      return;
    }

    const success = sendMessageToDonor(donor.email, message, isUrgent);
    if (success) {
      showToast(`Emergency request sent directly to ${donor.name}!`, 'success');
      onClose();
    } else {
      showToast('Failed to send request. Please try again.', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="bg-badge bg-badge-solid" style={{ fontSize: '1rem', padding: '4px 10px' }}>
              {donor.bloodGroup}
            </span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Request Blood from {donor.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{donor.city} • Verified Donor</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {!currentUser ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <AlertCircle size={40} color="#e63946" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Sign In Required</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Please sign in to send a direct message to this donor.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => { onClose(); window.location.hash = 'login'; }}
              >
                <LogIn size={15} /> Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0', fontSize: '0.88rem' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>From: {currentUser.name} ({currentUser.phone})</div>
                <div style={{ color: '#64748b' }}>Recipient: {donor.name} ({donor.email})</div>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Details</label>
                <textarea
                  className="form-input"
                  rows="4"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Include patient name, hospital, and units needed..."
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                  />
                  <span style={{ fontWeight: 600, color: '#e63946' }}>Mark as Critical Emergency Priority</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Send size={15} /> Send Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
