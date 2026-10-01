import React, { useState } from 'react';
import { AlertCircle, PlusCircle, CheckCircle2, Clock, MapPin, Building, Phone, Send, Heart, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const RequestBloodPage = ({ setActivePage }) => {
  const { bloodRequests, addRequest, pledgeDonation, fulfillRequest, hasPledged } = useData();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'create'
  const [selectedGroup, setSelectedGroup] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    hospital: '',
    bloodGroup: 'O+',
    unitsRequired: 2,
    contactNumber: currentUser?.phone || '',
    requiredDate: new Date().toISOString().split('T')[0],
    hospitalAddress: '',
    city: currentUser?.city || 'New York',
    reason: '',
    urgency: 'Critical'
  });

  const handleCreateRequest = (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('Please sign in to post an emergency blood request', 'error');
      setActivePage('login');
      return;
    }

    if (!formData.patientName || !formData.hospital || !formData.contactNumber) {
      showToast('Please fill in all mandatory fields', 'error');
      return;
    }

    addRequest({
      ...formData,
      unitsRequired: parseInt(formData.unitsRequired, 10)
    });

    showToast('Emergency blood request broadcasted successfully!', 'success');
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}

    setActiveTab('feed');
    setFormData({
      patientName: '',
      hospital: '',
      bloodGroup: 'O+',
      unitsRequired: 2,
      contactNumber: currentUser?.phone || '',
      requiredDate: new Date().toISOString().split('T')[0],
      hospitalAddress: '',
      city: currentUser?.city || 'New York',
      reason: '',
      urgency: 'Critical'
    });
  };

  const handlePledge = (req) => {
    if (!currentUser) {
      showToast('Please sign in to pledge a donation', 'error');
      setActivePage('login');
      return;
    }
    if (hasPledged(req.id, currentUser.id)) {
      showToast('You have already pledged for this request.', 'info');
      return;
    }
    pledgeDonation(req.id, currentUser.id);
    showToast(`Thank you! Your pledge to donate for ${req.patientName} was recorded.`, 'success');
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (err) {}
  };

  // Show pending requests by default; fulfilled ones still visible but visually distinct
  const filteredRequests = bloodRequests.filter((r) => {
    const matchesGroup = selectedGroup === 'All' || r.bloodGroup === selectedGroup;
    return matchesGroup;
  });

  return (
    <div className="requests-page section">
      <div className="container">
        {/* Header */}
        <div className="section-head">
          <span className="section-tag">Emergency Dispatch</span>
          <h2 className="section-title">Emergency Blood Requests Board</h2>
          <p className="section-desc">
            Broadcast an urgent blood request to local donors or volunteer to donate for patients currently in surgery and critical care.
          </p>

          {/* Tab Switcher */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '4px', borderRadius: '999px', marginTop: '24px' }}>
            <button
              className={`pill-btn ${activeTab === 'feed' ? 'active' : ''}`}
              style={{ padding: '8px 24px', fontSize: '0.9rem' }}
              onClick={() => setActiveTab('feed')}
            >
              Active Requests Feed ({bloodRequests.filter((r) => r.status === 'pending').length})
            </button>
            <button
              className={`pill-btn ${activeTab === 'create' ? 'active' : ''}`}
              style={{ padding: '8px 24px', fontSize: '0.9rem' }}
              onClick={() => setActiveTab('create')}
            >
              <PlusCircle size={15} /> Post New Request
            </button>
          </div>
        </div>

        {/* Create Request Form */}
        {activeTab === 'create' && (
          <div className="card" style={{ maxWidth: '780px', margin: '0 auto', padding: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(230, 57, 70, 0.1)',
                  color: '#e63946',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Flame size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Broadcast Emergency Blood Request</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                  Fill in accurate patient and hospital details to alert nearby donors immediately.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateRequest}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. David Miller"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group Needed *</label>
                  <select
                    className="form-input"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Units (Bags) Required *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    className="form-input"
                    value={formData.unitsRequired}
                    onChange={(e) => setFormData({ ...formData, unitsRequired: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Level *</label>
                  <select
                    className="form-input"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="Critical">Critical (Within 6 hours)</option>
                    <option value="Urgent">Urgent (Within 24 hours)</option>
                    <option value="Standard">Standard (2-3 days)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Required By *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.requiredDate}
                    onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. City General Hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hospital Address / Ward / Room No. *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. 123 Medical Parkway, Emergency Ward, 4th Floor"
                  value={formData.hospitalAddress}
                  onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="e.g. 555-019-2831"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Reason / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Emergency bypass surgery, trauma"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('feed')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <Send size={16} /> Broadcast Emergency Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests Feed */}
        {activeTab === 'feed' && (
          <div>
            {/* Filter pills */}
            <div className="filter-bar" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>Filter by Group:</span>
                <div className="blood-pills">
                  {['All', ...BLOOD_GROUPS].map((bg) => (
                    <button
                      key={bg}
                      className={`pill-btn ${selectedGroup === bg ? 'active' : ''}`}
                      onClick={() => setSelectedGroup(bg)}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('create')}>
                <PlusCircle size={15} /> Broadcast Request
              </button>
            </div>

            {/* Request Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredRequests.map((req) => {
                const isFulfilled = req.status === 'fulfilled';
                const isCritical = req.urgency === 'Critical' && !isFulfilled;

                return (
                  <div
                    key={req.id}
                    className={`request-card-item ${isCritical ? 'critical-border' : 'urgent-border'}`}
                    style={{ opacity: isFulfilled ? 0.75 : 1 }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              className={`status-badge ${
                                isFulfilled ? 'fulfilled' : req.urgency === 'Critical' ? 'critical' : 'urgent'
                              }`}
                            >
                              {isFulfilled ? 'Fulfilled' : `${req.urgency} Urgency`}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                              Needed by: {req.requiredDate}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', marginBottom: '2px' }}>
                            {req.patientName}
                          </h4>
                          <div style={{ color: '#64748b', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building size={14} /> {req.hospital}, {req.city}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <span className="bg-badge bg-badge-solid" style={{ fontSize: '1.15rem', padding: '6px 14px' }}>
                            {req.bloodGroup}
                          </span>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e63946', marginTop: '4px' }}>
                            {req.unitsRequired} {req.unitsRequired === 1 ? 'Unit' : 'Units'}
                          </div>
                        </div>
                      </div>

                      {/* Address & Reason */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.86rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', marginBottom: '6px' }}>
                          <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{req.hospitalAddress}</span>
                        </div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>
                          <strong>Reason:</strong> {req.reason || 'Medical Transfusion'}
                        </div>
                      </div>

                      {/* Contact & Pledges Counter */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: '#64748b', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#e63946" /> {req.contactNumber}
                        </div>
                        <div>
                          <strong>{req.pledgesCount}</strong> donors pledged
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      {!isFulfilled ? (
                        <button
                          className={`btn btn-sm ${currentUser && hasPledged(req.id, currentUser.id) ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ flex: 1 }}
                          onClick={() => handlePledge(req)}
                          disabled={!!(currentUser && hasPledged(req.id, currentUser.id))}
                        >
                          <Heart size={14} fill={currentUser && hasPledged(req.id, currentUser.id) ? 'none' : 'white'} />
                          {currentUser && hasPledged(req.id, currentUser.id) ? 'Already Pledged' : 'Pledge Donation'}
                        </button>
                      ) : (
                        <span style={{ color: '#10b981', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} /> Blood Acquired
                        </span>
                      )}

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => fulfillRequest(req.id)}
                        title="Toggle fulfillment status"
                      >
                        {isFulfilled ? 'Reopen' : 'Mark Fulfilled'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRequests.length === 0 && (
              <div className="card text-center" style={{ padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No Active Requests for {selectedGroup}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Great news! Currently there are no unfulfilled emergency requests matching this blood group.
                </p>
                <button className="btn btn-secondary" onClick={() => setSelectedGroup('All')}>
                  Show All Groups
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
