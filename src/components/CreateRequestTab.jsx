import React, { useState, useMemo } from 'react';
import { indiaStates } from '../data/indiaStates';

export default function CreateRequestTab({
  currentUser,
  donors,
  onSubmitRequest,
  onCancel
}) {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    mobile: currentUser?.phone || '',
    email: currentUser?.email || '',
    purpose: '',
    hospitalName: '',
    state: currentUser?.state || 'Tamil Nadu',
    district: currentUser?.city || 'Madurai',
    area: '',
    urgency: 'URGENT',
    units: 1
  });

  const availableDistricts = useMemo(() => {
    if (!formData.state || !indiaStates[formData.state]) return [];
    return indiaStates[formData.state];
  }, [formData.state]);

  // Live Matching Donors
  const matchingDonors = useMemo(() => {
    return donors.filter(d => {
      if (!d.isAvailable) return false;
      const matchBlood = !formData.bloodGroup || d.bloodGroup === formData.bloodGroup;
      const matchState = !formData.state || (d.state && d.state.toLowerCase() === formData.state.toLowerCase());
      const matchDistrict = !formData.district || (d.city && d.city.toLowerCase() === formData.district.toLowerCase());
      return matchBlood && (matchState || matchDistrict);
    });
  }, [donors, formData.bloodGroup, formData.state, formData.district]);

  React.useEffect(() => {
    if (currentUser?.phone && !formData.mobile) {
      setFormData(prev => ({ ...prev, mobile: currentUser.phone }));
    }
    if (currentUser?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);

  const handleChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'state') {
        const dists = indiaStates[val] || [];
        updated.district = dists.length > 0 ? dists[0] : '';
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientName.trim()) {
      alert('Please fill in the patient name.');
      return;
    }
    if (!formData.hospitalName || !formData.hospitalName.trim()) {
      alert('Please fill in the hospital name.');
      return;
    }
    const cleanMobile = (formData.mobile || '').replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      alert('Please enter a valid 10-digit contact mobile number.');
      return;
    }

    onSubmitRequest({
      patientName: formData.patientName,
      bloodGroup: formData.bloodGroup,
      unitsRequired: parseInt(formData.units) || 1,
      hospitalName: formData.hospitalName,
      state: formData.state,
      city: formData.district,
      address: formData.area,
      emergencyLevel: formData.urgency,
      purpose: formData.purpose,
      mobile: formData.mobile,
      email: formData.email
    });
  };

  return (
    <div id="view-create-request" className="tab-view active" style={{ display: 'block' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🩸 Request Blood</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Fill in the details below. Matching donors will be shown for you to contact.
          </p>

          <form id="create-request-form" onSubmit={handleSubmit}>
            {/* Patient Details */}
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#c1121f',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              Patient Information
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full name"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group Needed</label>
                <select
                  className="form-control"
                  value={formData.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  required
                >
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose / Condition</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Surgery, Accident, Cancer treatment"
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
              />
            </div>

            {/* Hospital Details */}
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#c1121f',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '20px 0 12px',
                paddingBottom: '6px',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              Hospital & Location
            </div>

            <div className="form-group">
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Apollo Hospital"
                value={formData.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">State</label>
                <select
                  className="form-control"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                >
                  <option value="">Select State</option>
                  {Object.keys(indiaStates).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">District / City</label>
                <select
                  className="form-control"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  required
                >
                  <option value="">Select District</option>
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Local Area (optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Anna Nagar, Velachery"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
              />
            </div>

            {/* Request Details */}
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#c1121f',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '20px 0 12px',
                paddingBottom: '6px',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              Request Details
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <select
                  className="form-control"
                  value={formData.urgency}
                  onChange={(e) => handleChange('urgency', e.target.value)}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent (Within 24h)</option>
                  <option value="CRITICAL">🚨 CRITICAL (Immediate)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units Required</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="10"
                  value={formData.units}
                  onChange={(e) => handleChange('units', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Matching Donors Section */}
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#c1121f',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '20px 0 12px',
                paddingBottom: '6px',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              Matching Donors Nearby ({matchingDonors.length} Found)
            </div>

            <div id="matching-donors-list" style={{ marginBottom: '16px' }}>
              {matchingDonors.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  No registered active donors found in this area for blood group {formData.bloodGroup}. The broadcast will still alert all regional networks.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {matchingDonors.map((donor, idx) => (
                    <div
                      key={donor._id || donor.uid || idx}
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div>
                        <strong>{donor.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          <i className="fas fa-map-marker-alt"></i> {donor.city}, {donor.state}
                        </div>
                      </div>
                      <span className="blood-badge sm">{donor.bloodGroup}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px', padding: '14px', fontSize: '1rem' }}
            >
              Broadcast Request <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
