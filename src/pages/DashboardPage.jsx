import React, { useState, useEffect } from 'react';
import { User, Droplet, Heart, Award, Bell, CheckCircle2, MessageSquare, Phone, MapPin, AlertCircle, ToggleLeft, ToggleRight, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export const DashboardPage = ({ setActivePage }) => {
  const { currentUser, toggleAvailability, markMessagesRead, updateUser, logout } = useAuth();
  const { bloodRequests, pledgeDonation, hasPledged } = useData();
  const { showToast } = useToast();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || '',
    weight: currentUser?.weight || ''
  });

  // Keep profile form in sync with currentUser (e.g. if user updates from another session)
  useEffect(() => {
    if (currentUser && !isEditingProfile) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        city: currentUser.city || '',
        weight: currentUser.weight || ''
      });
    }
  }, [currentUser, isEditingProfile]);

  if (!currentUser) {
    return (
      <div className="section container text-center" style={{ padding: '80px 20px' }}>
        <AlertCircle size={48} color="#e63946" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Sign In Required</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Please sign in to view your donor dashboard, active requests, and direct messages.
        </p>
        <button className="btn btn-primary" onClick={() => setActivePage('login')}>
          Sign In Now
        </button>
      </div>
    );
  }

  const unreadMessages = (currentUser.messages || []).filter((m) => !m.read);
  const pendingRequests = bloodRequests.filter((r) => r.status === 'pending');
  const myCompatibleRequests = pendingRequests.filter((r) => r.bloodGroup === currentUser.bloodGroup);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUser({
      name: profileForm.name,
      phone: profileForm.phone,
      city: profileForm.city,
      weight: parseFloat(profileForm.weight) || currentUser.weight
    });
    setIsEditingProfile(false);
    showToast('Profile information updated successfully!', 'success');
  };

  const handlePledge = (req) => {
    if (!currentUser) return;
    pledgeDonation(req.id, currentUser.id);
    showToast(`Thank you for pledging to donate for ${req.patientName}!`, 'success');
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (err) {}
  };

  return (
    <div className="dashboard-page section">
      <div className="container">
        {/* Welcome Header */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #e63946, #ba181b)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 8px 16px rgba(230, 57, 70, 0.3)'
              }}
            >
              {currentUser.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                  Welcome back, {currentUser.name}!
                </h2>
                <span className="bg-badge bg-badge-red" style={{ fontSize: '0.95rem', padding: '4px 12px' }}>
                  {currentUser.bloodGroup}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', margin: 0 }}>
                {currentUser.city} • Donor ID: #{currentUser.id} • {currentUser.email}
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              onClick={toggleAvailability}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                background: currentUser.isAvailable ? '#ecfdf5' : '#f1f5f9',
                border: `1.5px solid ${currentUser.isAvailable ? '#a7f3d0' : '#cbd5e1'}`,
                padding: '10px 18px',
                borderRadius: '999px',
                transition: 'all 0.2s'
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: currentUser.isAvailable ? '#10b981' : '#94a3b8'
                }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: currentUser.isAvailable ? '#065f46' : '#64748b' }}>
                {currentUser.isAvailable ? 'Available to Donate Now' : 'Currently Unavailable'}
              </span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Edit Modal / Accordion */}
        {isEditingProfile && (
          <div className="card" style={{ padding: '24px', marginBottom: '32px', background: '#f8fafc' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Update Profile Details</h4>
            <form onSubmit={handleProfileSave} className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(230, 57, 70, 0.1)',
                color: '#e63946',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Droplet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{currentUser.totalDonations || 0}</h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Times Donated</p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                {(currentUser.totalDonations || 0) * 3}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Potential Lives Saved</p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(14, 165, 233, 0.1)',
                color: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{myCompatibleRequests.length}</h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Requests Matching You ({currentUser.bloodGroup})</p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{unreadMessages.length}</h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>Unread Inquiries</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid: Left Messages, Right Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Messages & Direct Inquiries */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} color="#e63946" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Direct Messages & Inquiries</h3>
              </div>
              {unreadMessages.length > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={markMessagesRead}>
                  Mark All as Read
                </button>
              )}
            </div>

            {(currentUser.messages || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentUser.messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: msg.read ? '#f8fafc' : '#fef2f2',
                      border: `1px solid ${msg.read ? '#e2e8f0' : '#fecaca'}`,
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{msg.fromName}</strong>
                        <span className="bg-badge bg-badge-red" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          Needs {msg.fromBloodGroup}
                        </span>
                        {msg.isUrgent && (
                          <span className="status-badge critical" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                            Critical Urgent
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {new Date(msg.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ color: '#334155', fontSize: '0.9rem', margin: '4px 0 10px', lineHeight: 1.5 }}>
                      "{msg.message}"
                    </p>

                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      From: <a href={`mailto:${msg.fromEmail}`} style={{ color: '#0ea5e9' }}>{msg.fromEmail}</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                <p>No messages yet. Direct donation requests sent to you will appear here.</p>
              </div>
            )}
          </div>

          {/* Quick Actions & Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className="btn btn-primary btn-block"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setActivePage('requests')}
                >
                  <AlertCircle size={16} /> Broadcast Emergency Need
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setActivePage('donors')}
                >
                  <User size={16} /> Search Local Donors
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setActivePage('bloodbanks')}
                >
                  <Droplet size={16} /> Check Nearby Blood Reserves
                </button>
              </div>
            </div>

            {/* Donor Badges */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Award size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Lifesaver Honors</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(currentUser.badges || ['Verified Donor']).map((badge) => (
                  <span
                    key={badge}
                    className="status-badge"
                    style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px' }}
                  >
                    <Sparkles size={13} /> {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requests Matching Your Blood Group */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Patients Needing Your Blood Group ({currentUser.bloodGroup})
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '2px', margin: 0 }}>
                These patients can be saved by your donation.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setActivePage('requests')}>
              View All City Requests
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {myCompatibleRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="status-badge critical">{req.urgency}</span>
                    <span className="bg-badge bg-badge-red">{req.bloodGroup}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px' }}>{req.patientName}</h4>
                  <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{req.hospital}, {req.city}</div>
                  <p style={{ color: '#475569', fontSize: '0.84rem', margin: '8px 0 12px' }}>"{req.reason}"</p>
                </div>
                <button
                  className={`btn btn-sm ${hasPledged(req.id, currentUser.id) ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => !hasPledged(req.id, currentUser.id) && handlePledge(req)}
                  disabled={hasPledged(req.id, currentUser.id)}
                >
                  <Heart size={14} fill={hasPledged(req.id, currentUser.id) ? 'none' : 'white'} />
                  {hasPledged(req.id, currentUser.id) ? 'Already Pledged' : 'Pledge to Donate'}
                </button>
              </div>
            ))}

            {myCompatibleRequests.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', gridColumn: 'span 3' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <p>No urgent requests right now for {currentUser.bloodGroup}. Keep up the great spirit!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
