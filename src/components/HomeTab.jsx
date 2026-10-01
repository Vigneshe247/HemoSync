import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { indiaStates } from '../data/indiaStates';
import { Radio, Send, Share2, Phone, AlertTriangle, CheckCircle2, Plus, MapPin, ExternalLink, CheckSquare, Square, Users, X, Bell } from 'lucide-react';

export default function HomeTab({
  currentUser,
  donors = [],
  requests = [],
  loadingData,
  dbError,
  onRetryConnection,
  onAcceptRequest,
  onOpenCreateRequest,
  onSignInClick,
  onRegisterClick,
  onBecomeDonorClick,
  onLoginClick,
  onSubmitRequest
}) {
  const [filterBlood, setFilterBlood] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterArea, setFilterArea] = useState('');

  // Multi-selection state for recipients (select one, two, many, or all)
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [targetedDonorsList, setTargetedDonorsList] = useState([]);

  // Modals for Recipient actions
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);

  // Broadcast Modal Form Data
  const [broadcastForm, setBroadcastForm] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsRequired: 2,
    hospitalName: '',
    state: 'Tamil Nadu',
    city: 'Madurai',
    address: '',
    mobile: currentUser?.phone || '',
    emergencyLevel: 'CRITICAL',
    purpose: '',
    broadcastToAll: true
  });

  const [isTargetedModal, setIsTargetedModal] = useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  // Available districts for the selected state
  const availableDistricts = useMemo(() => {
    if (!filterState || !indiaStates[filterState]) return [];
    return indiaStates[filterState];
  }, [filterState]);

  // Filtered Donors from MongoDB:
  // Strict rule: if donor checked out (availability is false or role !== 'donor'), they are REMOVED from the list!
  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      // Must be an active available donor (if opted out/unchecked, remove from list)
      const isAvail = d.availability === true || d.isAvailable === true;
      if (!isAvail) return false;

      if (filterBlood && d.bloodGroup !== filterBlood) return false;
      if (filterState && (!d.state || d.state.toLowerCase() !== filterState.toLowerCase())) return false;
      if (filterDistrict && (!d.city || d.city.toLowerCase() !== filterDistrict.toLowerCase())) return false;
      if (filterArea && (!d.address || !d.address.toLowerCase().includes(filterArea.toLowerCase()))) return false;
      return true;
    });
  }, [donors, filterBlood, filterState, filterDistrict, filterArea]);

  // Filtered Public Emergency Broadcasts from MongoDB:
  // Only requests that are public broadcasts (not targeted to specific donors) are shown in this list!
  const broadcastRequests = useMemo(() => {
    return requests.filter(r => {
      if (r.status !== 'OPEN' && r.status !== 'PLEDGED') return false;
      // Do not include requests that were targeted directly to pointed-out donors
      if (r.isTargeted && r.broadcastToAll === false) return false;
      if (filterBlood && r.bloodGroup !== filterBlood) return false;
      if (filterState && (!r.state || r.state.toLowerCase() !== filterState.toLowerCase())) return false;
      if (filterDistrict && (!r.city || r.city.toLowerCase() !== filterDistrict.toLowerCase())) return false;
      if (filterArea && (!r.address || !r.address.toLowerCase().includes(filterArea.toLowerCase()))) return false;
      return true;
    });
  }, [requests, filterBlood, filterState, filterDistrict, filterArea]);

  // Multi-selection handlers:
  const handleToggleSelectDonor = (donorId) => {
    setSelectedDonorIds(prev =>
      prev.includes(donorId) ? prev.filter(id => id !== donorId) : [...prev, donorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDonorIds.length === filteredDonors.length) {
      setSelectedDonorIds([]);
    } else {
      setSelectedDonorIds(filteredDonors.map(d => d._id || d.uid));
    }
  };

  // Open Direct or Pointed-out Donor Request Modal
  const handleOpenRequestForSelected = (specificDonor = null) => {
    let targetDonors = [];
    let initialBg = 'O+';
    let targetState = filterState || 'Tamil Nadu';
    let targetCity = filterDistrict || 'Madurai';

    if (specificDonor) {
      targetDonors = [specificDonor];
      setSelectedDonorIds([specificDonor._id || specificDonor.uid]);
      initialBg = specificDonor.bloodGroup || 'O+';
      targetState = specificDonor.state || targetState;
      targetCity = specificDonor.city || targetCity;
    } else if (selectedDonorIds.length > 0) {
      targetDonors = filteredDonors.filter(d => selectedDonorIds.includes(d._id || d.uid));
      if (targetDonors.length > 0) {
        initialBg = targetDonors[0].bloodGroup || 'O+';
        targetState = targetDonors[0].state || targetState;
        targetCity = targetDonors[0].city || targetCity;
      }
    }

    setTargetedDonorsList(targetDonors);
    setIsTargetedModal(true);
    setBroadcastForm(prev => ({
      ...prev,
      patientName: prev.patientName || (currentUser?.name ? `${currentUser.name} (Patient)` : 'Emergency Patient'),
      hospitalName: prev.hospitalName || 'Apollo Speciality Hospitals',
      purpose: prev.purpose || 'Emergency Blood Requirement',
      bloodGroup: initialBg,
      state: targetState,
      city: targetCity,
      mobile: currentUser?.phone || prev.mobile || '+91 98940 12345'
    }));
    setIsBroadcastModalOpen(true);
  };

  // Open Public Broadcast Modal (broadcast to all)
  const handleOpenBroadcastModal = () => {
    setSelectedDonorIds([]);
    setTargetedDonorsList([]);
    setIsTargetedModal(false);
    setBroadcastForm(prev => ({
      ...prev,
      patientName: prev.patientName || (currentUser?.name ? `${currentUser.name} (Patient)` : 'Emergency Patient'),
      hospitalName: prev.hospitalName || 'Government Rajaji Hospital',
      purpose: prev.purpose || 'Immediate Blood Transfusion',
      bloodGroup: filterBlood || prev.bloodGroup || 'O+',
      state: filterState || prev.state || 'Tamil Nadu',
      city: filterDistrict || prev.city || 'Madurai',
      mobile: currentUser?.phone || prev.mobile || '+91 98940 12345'
    }));
    setIsBroadcastModalOpen(true);
  };

  // Submit Broadcast or Direct Pointed-out Request
  const handleSubmitBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.patientName || !broadcastForm.hospitalName || !broadcastForm.mobile) {
      alert('Please fill in the Patient Name, Hospital Name, and Contact Mobile Number.');
      return;
    }

    setSubmittingBroadcast(true);
    try {
      const isTargeted = isTargetedModal || targetedDonorsList.length > 0 || selectedDonorIds.length > 0;
      const targetIds = isTargeted
        ? (targetedDonorsList.length > 0
            ? targetedDonorsList.map(d => d._id || d.uid)
            : selectedDonorIds)
        : [];
      const selectedNames = isTargeted
        ? (targetedDonorsList.length > 0
            ? targetedDonorsList.map(d => d.name)
            : filteredDonors.filter(d => targetIds.includes(d._id || d.uid)).map(d => d.name))
        : [];

      const payload = {
        ...broadcastForm,
        unitsRequired: parseInt(broadcastForm.unitsRequired) || 1,
        broadcast: !isTargeted,
        broadcastToAll: !isTargeted,
        isTargeted: isTargeted,
        targetDonorIds: targetIds,
        targetDonorNames: selectedNames,
        email: currentUser?.email || null,
        createdAt: new Date().toISOString()
      };

      if (onSubmitRequest) {
        await onSubmitRequest(payload);
      }

      setIsBroadcastModalOpen(false);
      setSelectedDonorIds([]);
      setTargetedDonorsList([]);
      setIsTargetedModal(false);
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      alert('Failed to send request: ' + (err.message || 'Error occurred'));
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  // Share Request with all
  const handleShareRequest = (req) => {
    const shareText = `🚨 URGENT BLOOD NEEDED!\n🩸 Blood Group: ${req.bloodGroup}\n👤 Patient: ${req.patientName}\n🏥 Hospital: ${req.hospitalName}, ${req.city}\n📞 Contact: ${req.mobile || 'Contact immediately'}\nUnits: ${req.unitsRequired} units needed urgently. Please help or share!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopySuccess(req._id || req.requestId);
      setTimeout(() => setCopySuccess(null), 3000);
    } else {
      alert(shareText);
    }
  };

  const selectedCount = selectedDonorIds.length;

  return (
    <div id="view-home" className="tab-view active" style={{ display: 'block' }}>
      

      {/* Hero Section */}
      <div className="hero-section-clean">
        <h1 className="hero-title">
          No life lost for<br />the want of <span>blood.</span>
        </h1>
        <p className="hero-subtitle">
          Connecting blood donors and recipients through a <strong>community-driven web platform.</strong>
        </p>

        <div className="app-store-buttons" id="home-cta-container">
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleOpenBroadcastModal}
              style={{
                borderRadius: '30px',
                padding: '14px 32px',
                fontSize: '1.08rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #c1121f, #780000)',
                boxShadow: '0 10px 24px rgba(193,18,31,0.3)',
                cursor: 'pointer'
              }}
            >
              <Radio size={20} className="pulse-icon" /> Broadcast Emergency Request to All
            </button>

            {!currentUser ? (
              <button
                className="btn btn-outline"
                id="hero-signin-btn"
                style={{
                  borderRadius: '30px',
                  padding: '14px 28px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  background: 'white',
                  borderColor: '#cbd5e1',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
                onClick={onSignInClick || onLoginClick}
              >
                Sign In
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* FEATURE SECTION: Real-Time Blood Inventory linked to Government eRaktKosh Portal */}
      <div style={{ marginTop: '50px', background: 'white', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <span
          style={{
            color: '#c1121f',
            border: '1.5px solid #c1121f',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.05em'
          }}
        >
          GOVERNMENT BLOOD INVENTORY
        </span>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', color: '#1e293b', fontWeight: 800, margin: 0 }}>
              Real-Time Blood <span style={{ color: '#c1121f' }}>Inventory</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '650px', marginTop: '10px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Instantly check blood unit availability across certified government hospitals, regional blood centers, and municipal hubs through the official Government of India <strong>eRaktKosh portal</strong>. During emergencies, know exactly where reserves are located.
            </p>
          </div>

          <a
            href="https://eraktkosh.mohfw.gov.in/eraktkoshPortal/#/publicPages/bloodAvailabilitySearch"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              borderRadius: '24px',
              padding: '13px 30px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #c1121f, #780000)',
              boxShadow: '0 6px 18px rgba(193,18,31,0.25)'
            }}
          >
            <ExternalLink size={16} /> Check Availability (eRaktKosh Govt Portal)
          </a>
        </div>
      </div>

      {/* Modern Filter: Find Blood Donors & Active Requests in MongoDB */}
      <div className="glass-card" style={{ marginTop: '40px', padding: '30px', background: 'white', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#1e293b', fontWeight: 800 }}>
              Search Available Donors & Active Emergency Requests
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              Select one, two, or all donors to request blood, or broadcast an urgent request to all donors stored in MongoDB.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleOpenBroadcastModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #c1121f, #780000)'
            }}
          >
            <Radio size={16} /> Broadcast to All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Blood Group Needed</label>
            <select
              id="filter-blood"
              className="form-control"
              style={{ padding: '10px' }}
              value={filterBlood}
              onChange={(e) => setFilterBlood(e.target.value)}
            >
              <option value="">Any Blood Group</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Country</label>
            <select id="filter-country" className="form-control" style={{ padding: '10px' }} defaultValue="India">
              <option value="India">India</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>State</label>
            <select
              id="filter-state"
              className="form-control"
              style={{ padding: '10px' }}
              value={filterState}
              onChange={(e) => {
                setFilterState(e.target.value);
                setFilterDistrict('');
              }}
            >
              <option value="">All States</option>
              {Object.keys(indiaStates).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>District</label>
            <select
              id="filter-district"
              className="form-control"
              style={{ padding: '10px' }}
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              disabled={!filterState}
            >
              <option value="">All Districts</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Area / Locality</label>
            <input
              type="text"
              id="filter-area"
              className="form-control"
              style={{ padding: '10px' }}
              placeholder="Search area..."
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: ACTIVE EMERGENCY BLOOD BROADCASTS (Broadcast Requests Only)
          ========================================================================= */}
      <div style={{ marginTop: '36px', marginBottom: '36px' }}>
        <div
          className="filter-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🚨</span>
              <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800, color: '#991b1b' }}>
                Active Emergency Blood Broadcasts ({broadcastRequests.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                ((•)) Community Broadcasts
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Public emergency blood appeals broadcasted live across the network. Registered donors can accept and pledge immediately.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleOpenBroadcastModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c1121f, #780000)',
              boxShadow: '0 4px 12px rgba(193,18,31,0.25)',
              fontWeight: 700,
              padding: '10px 20px',
              borderRadius: '12px'
            }}
          >
            <Radio size={16} /> Broadcast Request to All
          </button>
        </div>

        {broadcastRequests.length === 0 ? (
          <div
            className="glass-card"
            style={{
              background: 'white',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}
          >
            <Radio size={40} color="#c1121f" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#1e293b', fontWeight: 800 }}>
              No Active Public Emergency Broadcasts
            </h4>
            <p style={{ margin: '0 0 18px', fontSize: '0.88rem' }}>
              Currently no public emergency broadcasts match your filter. You can broadcast an urgent request to all donors now!
            </p>
            <button
              className="btn btn-primary"
              onClick={handleOpenBroadcastModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #c1121f, #780000)',
                padding: '9px 20px',
                borderRadius: '10px',
                fontWeight: 700
              }}
            >
              <Radio size={15} /> Broadcast Request to All
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {broadcastRequests.map(req => {
              const isCritical = req.emergencyLevel === 'CRITICAL';
              const isUrgent = req.emergencyLevel === 'URGENT';
              const borderColor = isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#c1121f';
              const canAccept = currentUser && currentUser.role === 'donor' && !req.acceptedDonorId;
              const isCopied = copySuccess === (req._id || req.requestId);

              return (
                <div
                  key={req._id || req.requestId}
                  className="glass-card card-item"
                  style={{
                    borderLeft: `5px solid ${borderColor}`,
                    background: 'white',
                    padding: '20px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                >
                  <div>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <span
                            style={{
                              background: isCritical ? '#fef2f2' : '#fffbeb',
                              color: isCritical ? '#dc2626' : '#b45309',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isCritical ? '🚨 CRITICAL EMERGENCY' : isUrgent ? '⚡ URGENT NEED' : '🩸 BLOOD REQUEST'}
                          </span>

                          <span
                            style={{
                              background: '#fef2f2',
                              color: '#c1121f',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Radio size={12} /> Broadcasted
                          </span>
                        </div>

                        <h3 className="card-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                          {req.patientName || 'Emergency Patient'}
                        </h3>
                      </div>

                      <div className="blood-badge sm" style={{ background: '#c1121f', color: 'white', padding: '6px 12px', borderRadius: '10px', fontWeight: 900, fontSize: '1.1rem' }}>
                        {req.bloodGroup}
                      </div>
                    </div>

                    <div className="card-meta" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: '#475569' }}>
                      <div className="meta-row"><i className="fas fa-hospital" style={{ color: '#c1121f', width: '18px' }}></i> {req.hospitalName}</div>
                      <div className="meta-row"><i className="fas fa-map-marker-alt" style={{ color: '#c1121f', width: '18px' }}></i> {[req.city, req.state].filter(Boolean).join(', ')}{req.address ? ` • ${req.address}` : ''}</div>
                      <div className="meta-row"><i className="fas fa-tint" style={{ color: '#c1121f', width: '18px' }}></i> <strong>{req.unitsRequired} unit(s) required</strong></div>
                      {req.purpose && <div className="meta-row"><i className="fas fa-notes-medical" style={{ color: '#64748b', width: '18px' }}></i> {req.purpose}</div>}
                      <div className="meta-row"><i className="far fa-clock" style={{ color: '#94a3b8', width: '18px' }}></i> {new Date(req.createdAt).toLocaleString()}</div>
                    </div>

                    {req.acceptedDonorId && (
                      <div style={{ marginTop: '12px', padding: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.84rem', color: '#065f46', fontWeight: 700 }}>
                        ✅ Donor {req.acceptedDonorName} pledged for this request
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Request Card */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    {canAccept && (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ flex: 1, fontWeight: 700 }}
                        onClick={() => onAcceptRequest(req._id || req.requestId)}
                      >
                        ✅ Accept & Donate
                      </button>
                    )}

                    {req.mobile && (
                      <a
                        href={`tel:${req.mobile}`}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', borderRadius: '8px' }}
                      >
                        <Phone size={14} /> Call
                      </a>
                    )}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleShareRequest(req)}
                      title="Share Request"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px', padding: '8px 12px' }}
                    >
                      <Share2 size={14} /> {isCopied ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: AVAILABLE VERIFIED BLOOD DONORS (Donors Only)
          ========================================================================= */}
      <div style={{ marginTop: '40px', marginBottom: '50px' }}>
        <div
          className="filter-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🩸</span>
              <h2 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800, color: '#1e293b' }}>
                Available Verified Blood Donors ({filteredDonors.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                Verified Donors Only
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Point out & select one or two donors using the checkboxes to send direct requests to their Notification Bell (🔔 icon), or request individually.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {filteredDonors.length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleSelectAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '9px 16px',
                  borderColor: '#cbd5e1'
                }}
              >
                {selectedCount === filteredDonors.length ? (
                  <>
                    <CheckSquare size={16} color="#c1121f" /> Deselect All Donors
                  </>
                ) : (
                  <>
                    <Square size={16} /> Select All Donors ({filteredDonors.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Floating Multi-Selected Bar (when recipient selects 1, 2, or many donors) */}
        {selectedCount > 0 && (
          <div
            style={{
              position: 'sticky',
              top: '80px',
              zIndex: 100,
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: 'white',
              padding: '14px 24px',
              borderRadius: '14px',
              margin: '16px 0 24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              animation: 'slideUp 0.25s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#c1121f', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {selectedCount}
              </div>
              <div>
                <strong>{selectedCount} Donor(s) Pointed Out & Selected</strong>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  This direct request will be delivered straight to their Notification Bell (🔔 icon)!
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenRequestForSelected(null)}
                style={{
                  background: 'linear-gradient(135deg, #c1121f, #780000)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '8px'
                }}
              >
                <Send size={14} /> Send Direct Request to Pointed Donors ({selectedCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDonorIds([])}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Clear Selection"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

      {/* ONLY DONORS GRID - STRICTLY RENDERS VERIFIED DONORS */}
      <div className="grid-3" id="donors-grid" style={{ marginTop: '20px' }}>
        {/* Loading Skeletons */}
        {loadingData && donors.length === 0 && (
          [1, 2, 3].map(n => (
            <div key={'skeleton-' + n} className="glass-card card-item" style={{ padding: '24px', opacity: 0.6 }}>
              <div style={{ height: '20px', width: '50%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '28px', width: '75%', background: '#cbd5e1', borderRadius: '4px', marginBottom: '16px' }} />
              <div style={{ height: '14px', width: '60%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }} />
            </div>
          ))
        )}

        {/* RENDER REAL DONORS FROM MONGODB (Recipient can select one, two, many, or all) */}
        {filteredDonors.map(donor => {
          const donorId = donor._id || donor.uid;
          const isSelected = selectedDonorIds.includes(donorId);
          const isMe = currentUser && (donor.userId === currentUser.id || donor.userId === currentUser._id || donor.email === currentUser.email);

          return (
            <div
              key={donorId}
              className="glass-card card-item"
              style={{
                borderLeft: '5px solid #10b981',
                background: isSelected ? '#f0fdf4' : 'white',
                border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                padding: '22px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 6px 20px rgba(16,185,129,0.15)' : '0 4px 16px rgba(0,0,0,0.05)',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Top Row: Checkbox Selection + Name + Blood Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Checkbox for Recipient to select one or many */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectDonor(donorId)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#10b981'
                      }}
                      title="Select this donor"
                    />

                    <div>
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '20px',
                          marginBottom: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🟢 Verified Active Donor
                      </span>
                      <h3 className="card-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                        {donor.name}
                      </h3>
                    </div>
                  </div>

                  <div className="blood-badge sm" style={{ background: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '10px', fontWeight: 900, fontSize: '1.1rem' }}>
                    {donor.bloodGroup}
                  </div>
                </div>

                <div className="card-meta" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: '#475569' }}>
                  <div className="meta-row">
                    <i className="fas fa-map-marker-alt" style={{ color: '#10b981', width: '18px' }}></i>
                    {[donor.city, donor.state].filter(Boolean).join(', ')}{donor.address ? ` • ${donor.address}` : ''}
                  </div>
                  {donor.phone && (
                    <div className="meta-row">
                      <i className="fas fa-phone" style={{ color: '#10b981', width: '18px' }}></i> {donor.phone}
                    </div>
                  )}
                  {donor.totalDonations !== undefined && donor.totalDonations > 0 && (
                    <div className="meta-row">
                      <i className="fas fa-award" style={{ color: '#f59e0b', width: '18px' }}></i> {donor.totalDonations} previous donation(s)
                    </div>
                  )}
                </div>
              </div>

              {/* RECIPIENT SELECT & REQUEST BLOOD BUTTON */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '18px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenRequestForSelected(donor)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #c1121f, #780000)'
                  }}
                >
                  <Send size={14} /> Request Blood from {donor.name.split(' ')[0]}
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state for Donors */}
        {!loadingData && filteredDonors.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🩸</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              No Active Donors Matching Filter
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
              No verified blood donors are currently available for this search criteria. You can broadcast an urgent blood request to all users or check Government Blood Banks.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleOpenBroadcastModal}
              style={{ padding: '10px 24px', fontWeight: 700, borderRadius: '20px', background: 'linear-gradient(135deg, #c1121f, #780000)' }}
            >
              <Radio size={16} /> Broadcast Emergency Request to All
            </button>
          </div>
        )}
      </div>
      </div>

      {/* BROADCAST / SELECTED DONORS REQUEST MODAL */}
      {isBroadcastModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBroadcastModalOpen(false)}>
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '580px',
              width: '92%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '20px',
              background: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: (isTargetedModal || selectedCount > 0) ? '#2563eb' : '#c1121f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {(isTargetedModal || selectedCount > 0)
                    ? `🎯 Direct Pointed Request (${selectedCount} Donor${selectedCount > 1 ? 's' : ''})`
                    : '📢 Community Emergency Broadcast'}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                  {(isTargetedModal || selectedCount > 0)
                    ? `Request Blood from Pointed Donor${selectedCount > 1 ? 's' : ''}`
                    : 'Broadcast Emergency Blood Request to All'}
                </h3>
                {(isTargetedModal || selectedCount > 0) && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#047857', fontWeight: 700 }}>
                    Targeted to: {filteredDonors.filter(d => selectedDonorIds.includes(d._id || d.uid)).map(d => d.name).join(', ') || 'Selected Donor'}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitBroadcast}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Patient Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Meenakshi Sundaram"
                    value={broadcastForm.patientName}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Blood Group Needed *</label>
                  <select
                    className="form-control"
                    value={broadcastForm.bloodGroup}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, bloodGroup: e.target.value })}
                  >
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Hospital Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Government Rajaji Hospital"
                    value={broadcastForm.hospitalName}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, hospitalName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Units Required *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    className="form-control"
                    value={broadcastForm.unitsRequired}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, unitsRequired: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>State *</label>
                  <select
                    className="form-control"
                    value={broadcastForm.state}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, state: e.target.value, city: '' })}
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
                    value={broadcastForm.city}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-control"
                    placeholder="e.g. +91 98940 12345"
                    value={broadcastForm.mobile}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Emergency Urgency Level</label>
                  <select
                    className="form-control"
                    value={broadcastForm.emergencyLevel}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, emergencyLevel: e.target.value })}
                  >
                    <option value="CRITICAL">🚨 Critical (Immediate Transfusion)</option>
                    <option value="URGENT">⚡ Urgent (Within 4-6 hours)</option>
                    <option value="NORMAL">Standard (Scheduled Procedure)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Reason / Purpose</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Trauma Surgery, Heart Surgery, Chemotherapy support"
                  value={broadcastForm.purpose}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, purpose: e.target.value })}
                />
              </div>

              {/* Banner explaining delivery */}
              {(isTargetedModal || selectedCount > 0) ? (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1.5px solid #93c5fd',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Bell size={24} color="#2563eb" />
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>
                    <strong>Direct Notification Bell Delivery:</strong> This request is targeted specifically to the pointed donor(s). It will be delivered directly to their <strong>Notification Bell (🔔 icon)</strong> with an instant option to Accept & Pledge.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(193, 18, 31, 0.06)',
                    border: '1px solid rgba(193, 18, 31, 0.2)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Radio size={24} color="#c1121f" />
                  <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                    <strong>Public Community Broadcast:</strong> This request will be instantly stored in MongoDB Atlas and shown separately on this page under <strong>Active Emergency Blood Broadcasts</strong>.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  disabled={submittingBroadcast}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingBroadcast}
                  style={{
                    background: (isTargetedModal || selectedCount > 0) ? 'linear-gradient(135deg, #1d4ed8, #1e40af)' : 'linear-gradient(135deg, #c1121f, #780000)',
                    padding: '10px 24px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {(isTargetedModal || selectedCount > 0) ? (
                    <>
                      <Send size={15} /> {submittingBroadcast ? 'Sending to Donors...' : `Send Direct Request to Pointed Donor${selectedCount > 1 ? 's' : ''}`}
                    </>
                  ) : (
                    <>
                      <Radio size={15} /> {submittingBroadcast ? 'Broadcasting...' : 'Broadcast Request to All Donors'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
