import React, { useState } from 'react';
import { User, Mail, Shield, HeartHandshake, MapPin, Phone, Droplet, CheckCircle, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';

export default function DashboardTab({
  currentUser,
  donors,
  requests,
  onToggleAvailability,
  onBecomeDonor,
  onOpenCreateRequest,
  onSignInClick,
  onRegisterClick,
  onDeleteRequest,
  onUpdateRequest,
  onDeleteDonor,
  onUpdateDonor,
  onUpdateUserProfile,
  onDeleteAccount
}) {
  const [editingRequest, setEditingRequest] = useState(null);
  const [editUnits, setEditUnits] = useState(1);
  const [editStatus, setEditStatus] = useState('OPEN');

  const [isEditingUserModal, setIsEditingUserModal] = useState(false);
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const [isEditingDonorModal, setIsEditingDonorModal] = useState(false);
  const [donorEditForm, setDonorEditForm] = useState({
    name: '',
    phone: '',
    bloodGroup: 'O+',
    city: '',
    state: '',
    address: ''
  });

  if (!currentUser) {
    return (
      <div id="view-dashboard" className="tab-view active" style={{ display: 'block', textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 30px', borderRadius: '20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>Sign In Required</h2>
          <p style={{ color: '#64748b', marginTop: '10px', marginBottom: '24px', lineHeight: 1.5 }}>
            Please sign in with your email and password or Google account to access your personal dashboard.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={onSignInClick} style={{ padding: '10px 20px' }}>
              Sign In
            </button>
            <button className="btn btn-primary" onClick={onRegisterClick} style={{ padding: '10px 22px' }}>
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if current user has an active donor profile
  const donorProfile = currentUser.donorProfile || donors.find(d =>
    (d.userId && (d.userId === currentUser.id || d.userId === currentUser._id || d.userId === currentUser.uid)) ||
    (d.email && d.email.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const isDonor = !!donorProfile;
  const isAvailable = donorProfile ? (donorProfile.availability ?? donorProfile.isAvailable ?? true) : false;

  const myPledges = requests.filter(r =>
    r.acceptedDonorId === currentUser.id ||
    r.acceptedDonorId === currentUser.uid ||
    (donorProfile && r.acceptedDonorId === (donorProfile._id || donorProfile.uid))
  );

  const myRequests = requests.filter(r =>
    r.email === currentUser.email ||
    (donorProfile && r.mobile === donorProfile.phone) ||
    r.userId === currentUser.id ||
    r.userId === currentUser._id
  );

  // Open Edit Request
  const handleOpenEditRequest = (req) => {
    setEditingRequest(req);
    setEditUnits(req.unitsRequired || 1);
    setEditStatus(req.status || 'OPEN');
  };

  // Submit Edit Request
  const handleSaveRequestEdit = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;
    if (onUpdateRequest) {
      await onUpdateRequest(editingRequest._id || editingRequest.requestId, {
        unitsRequired: editUnits,
        status: editStatus
      });
    }
    setEditingRequest(null);
  };

  // Open Edit Donor Profile
  const handleOpenEditDonor = () => {
    if (!donorProfile) return;
    setDonorEditForm({
      name: donorProfile.name || currentUser.name || '',
      phone: donorProfile.phone || '',
      bloodGroup: donorProfile.bloodGroup || 'O+',
      city: donorProfile.city || '',
      state: donorProfile.state || 'Tamil Nadu',
      address: donorProfile.address || ''
    });
    setIsEditingDonorModal(true);
  };

  // Submit Donor Edit
  const handleSaveDonorEdit = async (e) => {
    e.preventDefault();
    if (!donorProfile) return;
    if (onUpdateDonor) {
      await onUpdateDonor(donorProfile._id || donorProfile.uid, donorEditForm);
    }
    setIsEditingDonorModal(false);
  };

  // Delete Donor Profile
  const handleDeleteDonorClick = () => {
    if (!donorProfile) return;
    if (window.confirm('Are you sure you want to remove your Donor profile from MongoDB?')) {
      if (onDeleteDonor) {
        onDeleteDonor(donorProfile._id || donorProfile.uid);
      }
    }
  };

  // Delete Request
  const handleDeleteRequestClick = (req) => {
    if (window.confirm(`Are you sure you want to cancel and delete this request for ${req.patientName}?`)) {
      if (onDeleteRequest) {
        onDeleteRequest(req._id || req.requestId);
      }
    }
  };

  // Open Edit User Account
  const handleOpenEditUser = () => {
    setUserEditForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
      password: ''
    });
    setIsEditingUserModal(true);
  };

  // Submit User Account Edit
  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (onUpdateUserProfile) {
      await onUpdateUserProfile(userEditForm);
    }
    setIsEditingUserModal(false);
  };

  // Delete User Account
  const handleDeleteAccountClick = () => {
    if (window.confirm('WARNING: Are you sure you want to delete your entire account from MongoDB? This cannot be undone.')) {
      if (onDeleteAccount) {
        onDeleteAccount();
      }
    }
  };

  return (
    <div id="view-dashboard" className="tab-view active" style={{ display: 'block', maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>

      {/* Grid: User Identity Card vs Donor Profile Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>

        {/* Card 1: User Account Profile */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800
              }}
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                {currentUser.name}
              </h3>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginTop: '4px'
                }}
              >
                Role: {currentUser.role || 'user'}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
              <Mail size={16} color="#64748b" />
              <span><strong>Email:</strong> {currentUser.email}</span>
            </div>
            {currentUser.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
                <Phone size={16} color="#64748b" />
                <span><strong>Phone:</strong> {currentUser.phone}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
              <Shield size={16} color="#64748b" />
              <span><strong>Auth:</strong> {currentUser.authProviders?.join(', ') || 'Email/Password'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
              <CheckCircle size={16} color="#10b981" />
              <span><strong>Database:</strong> MongoDB Atlas (users collection)</span>
            </div>
          </div>

          {/* User Account Profile CRUD Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleOpenEditUser}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <Edit2 size={13} /> Edit Profile (CRUD)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleDeleteAccountClick}
              title="Delete Account from MongoDB"
              style={{ borderColor: '#fee2e2', color: '#ef4444', background: '#fff5f5' }}
            >
              <Trash2 size={13} /> Delete Account
            </button>
          </div>
        </div>

        {/* Card 2: Blood Donor Profile (or Become a Donor CTA) */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: isDonor ? 'white' : '#fffaf0',
            border: isDonor ? '1px solid #e2e8f0' : '1.5px dashed #fbd38d'
          }}
        >
          {isDonor ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#c1121f' }}>
                    Verified Donor Profile
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                      {donorProfile.name || currentUser.name}
                    </h3>
                    <span className="blood-badge sm" style={{ background: '#c1121f', color: 'white', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      {donorProfile.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: isAvailable ? '#059669' : '#dc2626', background: isAvailable ? '#ecfdf5' : '#fef2f2', padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${isAvailable ? '#a7f3d0' : '#fecaca'}` }}>
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => onToggleAvailability(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <span>{isAvailable ? '✓ I want to be a donor' : '✗ Unchecked / Removed from list'}</span>
                  </label>
                  <div style={{ fontSize: '0.72rem', color: isAvailable ? '#059669' : '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                    {isAvailable ? 'Visible in Live Donor Search' : 'Excluded from Live Donor Search'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#c1121f" />
                  <span>{[donorProfile.address, donorProfile.city, donorProfile.state].filter(Boolean).join(', ')}</span>
                </div>
                {donorProfile.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#c1121f" />
                    <span>{donorProfile.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="#64748b" />
                  <span>Stored in MongoDB Atlas (<strong>bloodDonors</strong> collection)</span>
                </div>
              </div>

              {/* Donor Profile CRUD Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleOpenEditDonor}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                >
                  <Edit2 size={13} /> Edit Donor Details
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleDeleteDonorClick}
                  title="Remove Donor Profile"
                  style={{ borderColor: '#fee2e2', color: '#ef4444', background: '#fff5f5' }}
                >
                  <Trash2 size={13} /> Delete Profile
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#feebc8',
                  color: '#c05621',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <HeartHandshake size={24} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: '#7b341e' }}>
                Join the Donor Registry
              </h3>
              <p style={{ color: '#744210', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
                You have a user account, but you haven't created a blood donor profile yet. Register in MongoDB Atlas to save lives!
              </p>
              <button
                className="btn btn-primary"
                onClick={onBecomeDonor}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #c1121f, #780000)',
                  border: 'none',
                  fontWeight: 700
                }}
              >
                Become a Blood Donor
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
          My Emergency Activity (MongoDB)
        </h3>
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenCreateRequest}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px' }}
        >
          + Request Blood Immediately
        </button>
      </div>

      {/* Grid: My Pledges & My Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Pledges */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', background: 'white' }}>
          <h4 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>
            My Active Pledges ({myPledges.length})
          </h4>
          {myPledges.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              You haven't pledged for any emergency requests yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myPledges.map((req, i) => (
                <div key={req._id || i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.88rem' }}>
                    <span>{req.patientName}</span>
                    <span style={{ color: '#c1121f' }}>{req.bloodGroup}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px' }}>
                    {req.hospitalName}, {req.city}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requests (With Edit and Delete CRUD) */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', background: 'white' }}>
          <h4 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>
            My Blood Requests ({myRequests.length})
          </h4>
          {myRequests.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              You haven't posted any emergency requests.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myRequests.map((req, i) => (
                <div key={req._id || i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #c1121f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.88rem' }}>
                    <span>{req.patientName}</span>
                    <span className="blood-badge sm">{req.bloodGroup} ({req.unitsRequired} units)</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                    Hospital: {req.hospitalName} • Status: <strong style={{ color: req.status === 'PLEDGED' ? '#059669' : '#dc2626' }}>{req.status}</strong>
                    {req.acceptedDonorName && ` (Pledged by ${req.acceptedDonorName})`}
                  </div>

                  {/* Request CRUD Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenEditRequest(req)}
                      style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDeleteRequestClick(req)}
                      style={{ padding: '4px 8px', fontSize: '0.78rem', borderColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Request Modal */}
      {editingRequest && (
        <div className="modal-overlay" onClick={() => setEditingRequest(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px', background: 'white', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800 }}>Edit Request Details</h3>
            <form onSubmit={handleSaveRequestEdit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Units Required</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-control"
                  value={editUnits}
                  onChange={(e) => setEditUnits(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Request Status</label>
                <select
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="OPEN">OPEN (Need Donors)</option>
                  <option value="PLEDGED">PLEDGED (Donor Promised)</option>
                  <option value="FULFILLED">FULFILLED (Completed)</option>
                  <option value="CLOSED">CLOSED (Cancelled)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingRequest(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Donor Profile Modal */}
      {isEditingDonorModal && (
        <div className="modal-overlay" onClick={() => setIsEditingDonorModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px', background: 'white', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800 }}>Edit Donor Profile</h3>
            <form onSubmit={handleSaveDonorEdit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Donor Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={donorEditForm.name}
                  onChange={(e) => setDonorEditForm({ ...donorEditForm, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Contact Phone</label>
                <input
                  type="tel"
                  required
                  className="form-control"
                  value={donorEditForm.phone}
                  onChange={(e) => setDonorEditForm({ ...donorEditForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>City / District</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={donorEditForm.city}
                  onChange={(e) => setDonorEditForm({ ...donorEditForm, city: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Address / Area</label>
                <input
                  type="text"
                  className="form-control"
                  value={donorEditForm.address}
                  onChange={(e) => setDonorEditForm({ ...donorEditForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditingDonorModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Account Profile Modal (CRUD) */}
      {isEditingUserModal && (
        <div className="modal-overlay" onClick={() => setIsEditingUserModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px', background: 'white', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                Edit Account Profile (MongoDB Atlas)
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingUserModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={userEditForm.name}
                  onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={userEditForm.email}
                  onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={userEditForm.phone}
                  onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="form-control"
                  value={userEditForm.password}
                  onChange={(e) => setUserEditForm({ ...userEditForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditingUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #c1121f, #780000)' }}>
                  Save to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
