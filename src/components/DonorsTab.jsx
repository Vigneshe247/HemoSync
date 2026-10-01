import React, { useState, useMemo } from 'react';
import { Search, MapPin, Phone, Mail, Award, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, ShieldCheck, HeartHandshake, RefreshCw } from 'lucide-react';
import { indiaStates } from '../data/indiaStates';

const BLOOD_GROUPS = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function DonorsTab({
  donors = [],
  loading = false,
  currentUser,
  onCreateDonor,
  onUpdateDonor,
  onDeleteDonor,
  onToggleAvailability,
  onRefresh
}) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [revealedContacts, setRevealedContacts] = useState({});

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    age: 25,
    gender: 'Male',
    lastDonationDate: '',
    state: 'Tamil Nadu',
    city: 'Madurai',
    address: '',
    availability: true
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Available districts for selected state
  const availableDistricts = useMemo(() => {
    if (!formData.state || !indiaStates[formData.state]) return [];
    return indiaStates[formData.state];
  }, [formData.state]);

  // Filtered Donors
  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const isAvail = donor.availability ?? donor.isAvailable ?? true;
      if (onlyAvailable && !isAvail) return false;
      if (selectedGroup !== 'All' && donor.bloodGroup !== selectedGroup) return false;
      if (selectedState && (!donor.state || donor.state.toLowerCase() !== selectedState.toLowerCase())) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = donor.name?.toLowerCase().includes(term);
        const matchesCity = donor.city?.toLowerCase().includes(term);
        const matchesAddress = donor.address?.toLowerCase().includes(term);
        if (!matchesName && !matchesCity && !matchesAddress) return false;
      }
      return true;
    });
  }, [donors, selectedGroup, selectedState, onlyAvailable, searchTerm]);

  // Toggle reveal
  const toggleContactReveal = (id) => {
    setRevealedContacts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: currentUser?.name || '',
      bloodGroup: 'O+',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      age: 25,
      gender: 'Male',
      state: 'Tamil Nadu',
      city: 'Madurai',
      address: '',
      availability: true
    });
    setEditingDonor(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (donor) => {
    setFormData({
      name: donor.name || '',
      bloodGroup: donor.bloodGroup || 'O+',
      phone: donor.phone || '',
      email: donor.email || '',
      age: donor.age || 25,
      gender: donor.gender || 'Male',
      state: donor.state || 'Tamil Nadu',
      city: donor.city || 'Madurai',
      address: donor.address || '',
      availability: donor.availability ?? donor.isAvailable ?? true
    });
    setEditingDonor(donor);
    setIsAddModalOpen(true);
  };

  // Submit form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.city) {
      alert('Please fill in Donor Name, Phone Number, and City.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingDonor) {
        await onUpdateDonor(editingDonor._id || editingDonor.uid, formData);
      } else {
        await onCreateDonor(formData);
      }
      setIsAddModalOpen(false);
      setEditingDonor(null);
    } catch (err) {
      alert('Operation failed: ' + (err.message || 'Error occurred'));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Donor
  const handleDeleteClick = (donor) => {
    if (window.confirm(`Are you sure you want to delete donor "${donor.name}" from MongoDB?`)) {
      onDeleteDonor(donor._id || donor.uid);
    }
  };

  return (
    <div id="view-donors" className="tab-view active" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MongoDB Atlas Donor Registry
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 6px' }}>
            Verified Blood Donors Directory
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '650px' }}>
            Directly connect with voluntary blood donors stored in MongoDB Atlas. Perform full CRUD donor profile management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={onRefresh}
            title="Refresh from MongoDB"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              fontWeight: 700
            }}
          >
            <Plus size={18} /> Register as Donor
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search donor by name, city or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* State Filter */}
            <select
              className="form-control"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              {Object.keys(indiaStates).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Availability Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
              <span>🟢 Available To Donate Now Only</span>
            </label>
          </div>

          {/* Blood Groups Selector Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>Blood Group:</span>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                type="button"
                onClick={() => setSelectedGroup(bg)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedGroup === bg ? '1.5px solid #c1121f' : '1px solid #cbd5e1',
                  background: selectedGroup === bg ? '#c1121f' : 'white',
                  color: selectedGroup === bg ? 'white' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Donors */}
      {loading && donors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw size={32} className="fa-spin" style={{ marginBottom: '12px', color: '#10b981' }} />
          <p>Connecting to MongoDB & fetching Donors...</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', background: 'white' }}>
          <AlertCircle size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>No Donors Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            No donors match your current filter. Try resetting blood group or search terms.
          </p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add First Donor
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredDonors.map(donor => {
            const isAvail = donor.availability ?? donor.isAvailable ?? true;
            const isRevealed = revealedContacts[donor._id || donor.uid];
            const isMe = currentUser && (
              donor.userId === currentUser.id ||
              donor.userId === currentUser._id ||
              donor.email === currentUser.email
            );

            return (
              <div
                key={donor._id || donor.uid}
                className="glass-card"
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
                  border: `1.5px solid ${isAvail ? '#e2e8f0' : '#f1f5f9'}`,
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: isAvail ? 'linear-gradient(135deg, #10b981, #059669)' : '#94a3b8',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem'
                        }}
                      >
                        {donor.name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                            {donor.name}
                          </h4>
                          <ShieldCheck size={16} color="#10b981" title="Verified Donor" />
                          {isMe && (
                            <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                              You
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                          <MapPin size={13} color="#c1121f" />
                          <span>{[donor.city, donor.state].filter(Boolean).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        background: '#c1121f',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        padding: '4px 10px',
                        borderRadius: '8px'
                      }}
                    >
                      {donor.bloodGroup}
                    </span>
                  </div>

                  {/* Status & Stats */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: isAvail ? '#ecfdf5' : '#f1f5f9',
                        color: isAvail ? '#059669' : '#64748b'
                      }}
                    >
                      <CheckCircle2 size={12} /> {isAvail ? 'Available to Donate' : 'Unavailable'}
                    </span>

                    {donor.age && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                        {donor.age} yrs • {donor.gender || 'Donor'}
                      </span>
                    )}

                    {donor.totalDonations !== undefined && donor.totalDonations > 0 && (
                      <span style={{ fontSize: '0.78rem', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        🏆 {donor.totalDonations} Donations
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  {donor.address && (
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px' }}>
                      📍 {donor.address}
                    </div>
                  )}

                  {/* Revealed Contact Details */}
                  {isRevealed && (
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', marginBottom: '4px' }}>
                        <Phone size={14} color="#c1121f" /> <strong>{donor.phone}</strong>
                      </div>
                      {donor.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                          <Mail size={14} color="#0284c7" /> {donor.email}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '10px' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => toggleContactReveal(donor._id || donor.uid)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRadius: '8px' }}
                  >
                    <Phone size={13} /> {isRevealed ? 'Hide Phone' : 'Contact'}
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenEdit(donor)}
                    title="Edit Donor Profile"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px', padding: '6px 12px' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDeleteClick(donor)}
                    title="Delete Donor from MongoDB"
                    style={{
                      borderRadius: '8px',
                      padding: '6px 10px',
                      borderColor: '#fee2e2',
                      color: '#ef4444',
                      background: '#fff5f5',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT DONOR MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ padding: '14px' }} onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content glass-card hide-scrollbar"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '94%',
              maxHeight: '92vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              position: 'relative',
              padding: '18px 22px',
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 16px 36px rgba(0,0,0,0.22)'
            }}
          >
            {/* Close button moved to top-right corner */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#64748b',
                zIndex: 30,
                transition: 'all 0.2s',
                padding: 0
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', paddingRight: '36px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                {editingDonor ? '✏️ Edit Donor Profile' : '🩸 Register Blood Donor'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Synchronizes with MongoDB (bloodDonors collection)
              </span>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Username *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    style={{ height: '38px', borderRadius: '8px', fontSize: '0.88rem' }}
                    placeholder="e.g. username"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Blood Group *</label>
                  <select
                    className="form-control"
                    style={{ height: '38px', borderRadius: '8px', fontSize: '0.88rem' }}
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {BLOOD_GROUPS.filter(b => b !== 'All').map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-control"
                    style={{ height: '38px', borderRadius: '8px', fontSize: '0.88rem' }}
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ height: '38px', borderRadius: '8px', fontSize: '0.88rem' }}
                    placeholder="e.g. donor@hemosync.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr 1.3fr', gap: '8px', marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '3px' }}>Age</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    className="form-control"
                    style={{ height: '35px', borderRadius: '8px', fontSize: '0.85rem' }}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '3px' }}>Gender</label>
                  <select
                    className="form-control"
                    style={{ height: '35px', borderRadius: '8px', fontSize: '0.85rem' }}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '3px' }}>Last Donation Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ height: '35px', borderRadius: '8px', fontSize: '0.82rem' }}
                    value={formData.lastDonationDate || ''}
                    onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>State *</label>
                  <select
                    className="form-control"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
                  >
                    {Object.keys(indiaStates).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>City / District *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Madurai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Locality / Area Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. KK Nagar, Near Bus Stand"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    padding: '10px 24px',
                    fontWeight: 700
                  }}
                >
                  {formSubmitting ? 'Saving to MongoDB...' : (editingDonor ? 'Update Profile' : 'Register Donor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
