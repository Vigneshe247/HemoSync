import React, { useState, useMemo } from 'react';
import { Building2, Search, MapPin, Phone, Clock, Plus, Edit2, Trash2, ShieldCheck, AlertCircle, Droplet, RefreshCw } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodBanksTab({
  bloodBanks = [],
  loading = false,
  currentUser,
  onCreateBank,
  onUpdateBank,
  onDeleteBank,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    hospitalName: '',
    address: '',
    city: 'Madurai',
    state: 'Tamil Nadu',
    contact: '',
    operatingHours: '24/7 Emergency Service',
    availableBloodGroups: {
      'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5,
      'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 5
    }
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Unique cities list
  const cities = useMemo(() => {
    const set = new Set(bloodBanks.map(b => b.city).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [bloodBanks]);

  // Filtered banks
  const filteredBanks = useMemo(() => {
    return bloodBanks.filter(bank => {
      const matchesCity = selectedCity === 'All' || bank.city?.toLowerCase() === selectedCity.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        bank.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.city?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroup =
        selectedBloodGroup === 'All' ||
        (bank.availableBloodGroups?.[selectedBloodGroup] || 0) > 0;

      return matchesCity && matchesSearch && matchesGroup;
    });
  }, [bloodBanks, selectedCity, searchTerm, selectedBloodGroup]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      hospitalName: '',
      address: '',
      city: 'Madurai',
      state: 'Tamil Nadu',
      contact: '',
      operatingHours: '24/7 Emergency Service',
      availableBloodGroups: {
        'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5,
        'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 5
      }
    });
    setEditingBank(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (bank) => {
    setFormData({
      name: bank.name || '',
      hospitalName: bank.hospitalName || bank.name || '',
      address: bank.address || '',
      city: bank.city || 'Madurai',
      state: bank.state || 'Tamil Nadu',
      contact: bank.contact || bank.phone || '',
      operatingHours: bank.operatingHours || '24/7 Emergency Service',
      availableBloodGroups: {
        'A+': bank.availableBloodGroups?.['A+'] ?? 10,
        'A-': bank.availableBloodGroups?.['A-'] ?? 5,
        'B+': bank.availableBloodGroups?.['B+'] ?? 10,
        'B-': bank.availableBloodGroups?.['B-'] ?? 5,
        'AB+': bank.availableBloodGroups?.['AB+'] ?? 5,
        'AB-': bank.availableBloodGroups?.['AB-'] ?? 2,
        'O+': bank.availableBloodGroups?.['O+'] ?? 15,
        'O-': bank.availableBloodGroups?.['O-'] ?? 5
      }
    });
    setEditingBank(bank);
    setIsAddModalOpen(true);
  };

  // Handle Stock Unit change in form
  const handleStockChange = (bg, deltaOrVal, isDelta = false) => {
    setFormData(prev => {
      const current = prev.availableBloodGroups[bg] || 0;
      const nextVal = isDelta ? Math.max(0, current + deltaOrVal) : Math.max(0, parseInt(deltaOrVal) || 0);
      return {
        ...prev,
        availableBloodGroups: {
          ...prev.availableBloodGroups,
          [bg]: nextVal
        }
      };
    });
  };

  // Handle Form Submit (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.contact) {
      alert('Please fill out the Hospital Name, City, and Emergency Contact.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingBank) {
        await onUpdateBank(editingBank._id || editingBank.id, formData);
      } else {
        await onCreateBank(formData);
      }
      setIsAddModalOpen(false);
      setEditingBank(null);
    } catch (err) {
      alert('Operation failed: ' + (err.message || 'Error occurred'));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete with confirmation
  const handleDeleteClick = (bank) => {
    const confirmMsg = `Are you sure you want to delete "${bank.name}" from MongoDB?`;
    if (window.confirm(confirmMsg)) {
      onDeleteBank(bank._id || bank.id);
    }
  };

  return (
    <div id="view-bloodbanks" className="tab-view active" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ color: '#c1121f', background: 'rgba(193,18,31,0.08)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MongoDB Atlas Network
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 6px' }}>
            Blood Banks & Live Inventory
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '650px' }}>
            Explore verified hospital blood banks, check real-time stock units by blood type, and perform full CRUD management stored directly in MongoDB.
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
              background: 'linear-gradient(135deg, #c1121f, #780000)',
              boxShadow: '0 4px 12px rgba(193,18,31,0.25)',
              fontWeight: 700
            }}
          >
            <Plus size={18} /> Add New Blood Bank
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          
          {/* Search Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Search Blood Bank / Hospital
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rajaji Hospital, Apollo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* City Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Filter by City
            </label>
            <select
              className="form-control"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Blood Group In Stock Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Available Blood Group
            </label>
            <select
              className="form-control"
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
            >
              <option value="All">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>In Stock: {bg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Blood Banks */}
      {loading && bloodBanks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw size={32} className="fa-spin" style={{ marginBottom: '12px', color: '#c1121f' }} />
          <p>Connecting to MongoDB & fetching Blood Banks...</p>
        </div>
      ) : filteredBanks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', background: 'white' }}>
          <AlertCircle size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>No Blood Banks Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            No centers match your filters. Try resetting your search or add a new blood bank.
          </p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add First Blood Bank
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
          {filteredBanks.map(bank => {
            const stock = bank.availableBloodGroups || {};
            const totalUnits = Object.values(stock).reduce((acc, v) => acc + (Number(v) || 0), 0);

            return (
              <div
                key={bank._id || bank.id}
                className="glass-card"
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Icon + Name + Certified Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(193, 18, 31, 0.08)',
                          color: '#c1121f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.3 }}>
                          {bank.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                          <MapPin size={13} color="#c1121f" />
                          <span>{bank.city}{bank.state ? `, ${bank.state}` : ''}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '3px 8px',
                        borderRadius: '20px'
                      }}
                    >
                      <ShieldCheck size={12} /> Certified
                    </span>
                  </div>

                  {/* Address */}
                  {bank.address && (
                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.4 }}>
                      {bank.address}
                    </p>
                  )}

                  {/* Live Stock Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      LIVE STOCK RESERVES ({totalUnits} UNITS)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
                      Red: Low Supply (&lt;4)
                    </span>
                  </div>

                  {/* 8-Grid Blood Groups Stock */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '18px' }}>
                    {BLOOD_GROUPS.map(bg => {
                      const qty = stock[bg] || 0;
                      const isLow = qty < 4;

                      return (
                        <div
                          key={bg}
                          style={{
                            background: isLow ? '#fef2f2' : '#f8fafc',
                            border: `1.5px solid ${isLow ? '#fecaca' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            padding: '6px 4px',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isLow ? '#dc2626' : '#1e293b' }}>
                            {bg}
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 900, color: isLow ? '#b91c1c' : '#0f172a' }}>
                            {qty} <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8' }}>u</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contact & Hours Info Box */}
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', marginBottom: '5px' }}>
                      <Clock size={14} color="#0284c7" />
                      <span>{bank.operatingHours || '24/7 Emergency Service'}</span>
                    </div>
                    {(bank.contact || bank.phone) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                        <Phone size={14} color="#c1121f" />
                        <span>Hotline: <strong>{bank.contact || bank.phone}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CRUD Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  {(bank.contact || bank.phone) && (
                    <a
                      href={`tel:${bank.contact || bank.phone}`}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none', borderRadius: '8px', fontSize: '0.84rem' }}
                    >
                      <Phone size={13} /> Call
                    </a>
                  )}

                  {/* UPDATE STOCK / DETAILS */}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenEdit(bank)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRadius: '8px', fontSize: '0.84rem' }}
                  >
                    <Edit2 size={13} /> Edit / Stock
                  </button>

                  {/* DELETE BLOOD BANK */}
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDeleteClick(bank)}
                    title="Delete Blood Bank"
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      borderColor: '#fee2e2',
                      color: '#ef4444',
                      background: '#fff5f5',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & UPDATE MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '620px',
              width: '92%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '20px',
              background: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                  {editingBank ? '✏️ Edit Blood Bank & Stock' : '🏥 Register New Blood Bank'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Changes will be synchronized live with MongoDB
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Hospital / Bank Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Government General Hospital"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Emergency Contact Phone *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. +91 0452-2532535"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
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

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tamil Nadu"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Address / Street Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Alagar Kovil Road, Goripalayam"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Operating Hours</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 24/7 Emergency Service or 8:00 AM - 8:00 PM"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                />
              </div>

              {/* LIVE STOCK EDITING SECTION */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Droplet size={16} color="#c1121f" /> Current Blood Stock Units Reserve
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Direct stock quantity</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {BLOOD_GROUPS.map(bg => {
                    const count = formData.availableBloodGroups[bg] || 0;
                    return (
                      <div
                        key={bg}
                        style={{
                          background: 'white',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '8px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c1121f' }}>{bg}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleStockChange(bg, -1, true)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              background: '#f1f5f9',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={count}
                            onChange={(e) => handleStockChange(bg, e.target.value, false)}
                            style={{
                              width: '38px',
                              textAlign: 'center',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              border: 'none',
                              padding: 0
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(bg, 1, true)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              background: '#f1f5f9',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
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
                    background: 'linear-gradient(135deg, #c1121f, #780000)',
                    padding: '10px 24px',
                    fontWeight: 700
                  }}
                >
                  {formSubmitting ? 'Saving to MongoDB...' : (editingBank ? 'Save Stock & Details' : 'Add Blood Bank')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
