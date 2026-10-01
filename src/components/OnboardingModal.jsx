import React, { useState, useMemo, useEffect } from 'react';
import { indiaStates } from '../data/indiaStates';
import { HeartHandshake } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onSave, currentUser }) {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser?.name || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [state, setState] = useState(currentUser?.state || 'Tamil Nadu');
  const [district, setDistrict] = useState(currentUser?.city || currentUser?.district || 'Madurai');
  const [area, setArea] = useState(currentUser?.address || 'KK Nagar');
  const [isDonorOptIn, setIsDonorOptIn] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser?.name) setName(currentUser.name);
    if (currentUser?.bloodGroup) setBloodGroup(currentUser.bloodGroup);
    if (currentUser?.phone) setPhone(currentUser.phone);
    if (currentUser?.state) setState(currentUser.state);
    if (currentUser?.city || currentUser?.district) setDistrict(currentUser.city || currentUser.district);
    if (currentUser?.address) setArea(currentUser.address);
  }, [currentUser]);

  const availableDistricts = useMemo(() => {
    if (!state || !indiaStates[state]) return [];
    return indiaStates[state];
  }, [state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bloodGroup || !bloodGroup.trim()) {
      setErrorMsg('Blood Group is mandatory! Please select your blood group.');
      return;
    }
    setErrorMsg('');
    onSave({
      name: name.trim(),
      bloodGroup: bloodGroup.trim(),
      phone: phone.trim(),
      age: age ? parseInt(age, 10) : null,
      gender,
      lastDonationDate: lastDonationDate || null,
      state,
      city: district,
      district,
      address: area.trim(),
      role: 'donor',
      availability: isDonorOptIn,
      isAvailable: isDonorOptIn,
      userId: currentUser?.id || currentUser?._id || currentUser?.uid || null
    });
  };

  return (
    <div id="donor-modal-overlay" className="modal-overlay" style={{ display: 'flex', zIndex: 1100, padding: '14px' }} onClick={onClose}>
      <div
        className="glass-card modal-content hide-scrollbar"
        style={{
          maxWidth: '470px',
          width: '94%',
          maxHeight: '92vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          borderRadius: '16px',
          padding: '18px 22px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.24)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button moved to top-right corner without disturbing components */}
        <button
          onClick={onClose}
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', paddingRight: '36px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(193, 18, 31, 0.12)'
            }}
          >
            <img src="/logo.png" alt="HemoSync Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
              Become a Blood Donor
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '2px 0 0' }}>
              Join our active registry to receive emergency donation alerts.
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '10px 0 12px' }} />

        {errorMsg && (
          <div
            style={{
              padding: '8px 12px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '10px',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form id="onboarding-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
              Username <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.88rem' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. username"
            />
          </div>

          {/* Blood Group & Contact Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: '8px', marginBottom: '8px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  Blood Group <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700, background: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>
                  Mandatory
                </span>
              </label>
              <select
                id="donor-blood-group-select"
                className="form-control"
                style={{
                  height: '38px',
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: bloodGroup ? '#b91c1c' : '#64748b',
                  cursor: 'pointer',
                  border: !bloodGroup ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  background: !bloodGroup ? '#fff5f5' : 'white'
                }}
                value={bloodGroup}
                onChange={(e) => {
                  setBloodGroup(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              >
                <option value="">Select Blood Group *</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                Contact Phone Number <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
              </label>
              <input
                type="tel"
                className="form-control"
                style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.88rem' }}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Age, Gender & Last Donation Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr 1.4fr', gap: '8px', marginBottom: '8px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                Age <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
              </label>
              <input
                type="number"
                min="18"
                max="65"
                className="form-control"
                style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.88rem' }}
                placeholder="18-65"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                Gender
              </label>
              <select
                className="form-control"
                style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer' }}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                Last Donation Date
              </label>
              <input
                type="date"
                className="form-control"
                style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '8px', paddingRight: '8px', borderRadius: '8px', fontSize: '0.84rem' }}
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
              />
            </div>
          </div>

          {/* State & District */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                State <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
              </label>
              <select
                className="form-control"
                style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.86rem', cursor: 'pointer' }}
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const dists = indiaStates[e.target.value] || [];
                  setDistrict(dists[0] || '');
                }}
                required
              >
                <option value="">Select State</option>
                {Object.keys(indiaStates).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                District / City <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
              </label>
              <select
                className="form-control"
                style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.86rem', cursor: 'pointer' }}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              >
                <option value="">Select District</option>
                {availableDistricts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Local Area / Address */}
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
              Local Area / Address <span style={{ color: '#c1121f', fontWeight: 800 }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              style={{ height: '38px', paddingTop: 0, paddingBottom: 0, paddingLeft: '10px', paddingRight: '10px', borderRadius: '8px', fontSize: '0.88rem' }}
              placeholder="e.g. KK Nagar, Anna Nagar"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
          </div>

          {/* Availability Opt-in Checkbox */}
          <div
            style={{
              padding: '8px 10px',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <input
              type="checkbox"
              id="donor-optin-checkbox"
              checked={isDonorOptIn}
              onChange={(e) => setIsDonorOptIn(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#c1121f', cursor: 'pointer' }}
            />
            <label htmlFor="donor-optin-checkbox" style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.82rem', cursor: 'pointer', margin: 0 }}>
              Mark me as Available for emergency blood donation
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '0.94rem',
              fontWeight: 700,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #c1121f, #780000)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Save Donor Profile in MongoDB
          </button>
        </form>
      </div>
    </div>
  );
}
