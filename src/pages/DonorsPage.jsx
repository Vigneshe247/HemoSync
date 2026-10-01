import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Award, CheckCircle2, AlertCircle, Send, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RequestModal } from '../components/RequestModal';

const BLOOD_GROUPS = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const DonorsPage = ({ setActivePage }) => {
  const { users, currentUser, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [revealedContacts, setRevealedContacts] = useState({});
  const [activeDonorForRequest, setActiveDonorForRequest] = useState(null);

  // Donors only
  const allDonors = users.filter((u) => u.role === 'donor');

  const filteredDonors = allDonors.filter((donor) => {
    const matchesGroup = selectedGroup === 'All' || donor.bloodGroup === selectedGroup;
    const matchesSearch =
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = !onlyAvailable || donor.isAvailable;

    return matchesGroup && matchesSearch && matchesAvailability;
  });

  const toggleContactReveal = (donorId) => {
    if (!isLoggedIn) {
      showToast('Please sign in to view donor phone and direct contact details', 'info');
      setActivePage('login');
      return;
    }
    setRevealedContacts((prev) => ({
      ...prev,
      [donorId]: !prev[donorId]
    }));
  };

  return (
    <div className="donors-page section">
      <div className="container">
        {/* Header */}
        <div className="section-head">
          <span className="section-tag">Direct Network</span>
          <h2 className="section-title">Verified Blood Donors Directory</h2>
          <p className="section-desc">
            Search active volunteer donors by blood group and location. Contact them directly or broadcast an urgent request.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar">
          <div style={{ flex: 1, minWidth: '260px' }} className="input-wrap">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="form-input has-icon"
              placeholder="Search donor by name or city (e.g., New York, Chicago)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="blood-pills">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                className={`pill-btn ${selectedGroup === bg ? 'active' : ''}`}
                onClick={() => setSelectedGroup(bg)}
              >
                {bg}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            <span>Available Now Only</span>
          </label>
        </div>

        {/* Donor Grid */}
        <div className="donor-grid">
          {filteredDonors.map((donor) => {
            const isRevealed = revealedContacts[donor.id];
            const isMe = currentUser?.id === donor.id;

            return (
              <div key={donor.id} className="donor-card">
                <div>
                  <div className="donor-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="donor-avatar">{donor.name.charAt(0)}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{donor.name}</h4>
                          <ShieldCheck size={16} color="#10b981" title="Verified Donor" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                          <MapPin size={13} /> {donor.city}
                        </div>
                      </div>
                    </div>

                    <span className="bg-badge bg-badge-red" style={{ fontSize: '0.95rem', padding: '4px 12px' }}>
                      {donor.bloodGroup}
                    </span>
                  </div>

                  <div className="donor-details">
                    <div className="donor-detail-item">
                      <span style={{ color: '#64748b' }}>Age / Weight:</span>
                      <strong>{donor.age} yrs • {donor.weight} kg</strong>
                    </div>

                    <div className="donor-detail-item">
                      <span style={{ color: '#64748b' }}>Donations:</span>
                      <strong>{donor.totalDonations || 0} times</strong>
                      {donor.badges?.[0] && (
                        <span className="status-badge standard" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                          <Award size={12} /> {donor.badges[0]}
                        </span>
                      )}
                    </div>

                    <div className="donor-detail-item">
                      <span style={{ color: '#64748b' }}>Status:</span>
                      {donor.isAvailable ? (
                        <span className="status-badge fulfilled">
                          <CheckCircle2 size={12} /> Available to Donate
                        </span>
                      ) : (
                        <span className="status-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                          Temporarily Unavailable
                        </span>
                      )}
                    </div>

                    {/* Contact Info (Revealed) */}
                    {isRevealed && (
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#0f172a', marginBottom: '4px' }}>
                          <Phone size={14} color="#e63946" /> {donor.phone}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#64748b' }}>
                          <Mail size={14} color="#e63946" /> {donor.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => toggleContactReveal(donor.id)}
                  >
                    <Phone size={14} /> {isRevealed ? 'Hide Contact' : 'Show Contact'}
                  </button>

                  {!isMe && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      disabled={!donor.isAvailable}
                      onClick={() => setActiveDonorForRequest(donor)}
                    >
                      <Send size={14} /> Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDonors.length === 0 && (
          <div className="card text-center" style={{ padding: '60px 20px', maxWidth: '520px', margin: '40px auto' }}>
            <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>No Donors Match Your Filter</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Try selecting "All" blood groups or clearing your search keywords.
            </p>
            <button className="btn btn-secondary" onClick={() => { setSelectedGroup('All'); setSearchTerm(''); setOnlyAvailable(false); }}>
              Reset All Filters
            </button>
          </div>
        )}

        {/* CTA Bar */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px 32px',
            marginTop: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px' }}>
              Want to be listed as a Lifesaver Donor?
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Join our community network in under a minute and help someone in an emergency.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setActivePage(isLoggedIn ? 'dashboard' : 'register')}
          >
            <UserCheck size={16} /> {isLoggedIn ? 'View My Donor Profile' : 'Register as a Donor'}
          </button>
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        donor={activeDonorForRequest}
        isOpen={!!activeDonorForRequest}
        onClose={() => setActiveDonorForRequest(null)}
      />
    </div>
  );
};
