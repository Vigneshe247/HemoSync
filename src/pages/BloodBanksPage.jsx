import React, { useState } from 'react';
import { Building2, Search, MapPin, Phone, Clock, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BloodBanksPage = ({ setActivePage }) => {
  const { bloodBanks } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = ['All', ...new Set(bloodBanks.map((b) => b.city))];

  const filteredBanks = bloodBanks.filter((bank) => {
    const matchesCity = selectedCity === 'All' || bank.city === selectedCity;
    const matchesSearch =
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="bloodbanks-page section">
      <div className="container">
        {/* Header */}
        <div className="section-head">
          <span className="section-tag">Hospital & Municipal Network</span>
          <h2 className="section-title">Regional Blood Banks & Live Stock</h2>
          <p className="section-desc">
            Check real-time blood unit reserves, operational hours, and emergency contact numbers across recognized municipal blood centers.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div style={{ flex: 1, minWidth: '260px' }} className="input-wrap">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="form-input has-icon"
              placeholder="Search blood banks by hospital name or street..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>City:</span>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 16px' }}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Blood Banks Grid */}
        <div className="bloodbank-grid">
          {filteredBanks.map((bank) => {
            return (
              <div key={bank.id} className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(14, 165, 233, 0.1)',
                        color: '#0ea5e9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{bank.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.84rem', marginTop: '2px' }}>
                        <MapPin size={13} /> {bank.city} • {bank.distanceKm} km away
                      </div>
                    </div>
                  </div>
                  <span className="status-badge fulfilled">
                    <ShieldCheck size={12} /> Certified
                  </span>
                </div>

                <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '16px' }}>
                  {bank.address}
                </p>

                {/* Live Stock Grid */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    <span>LIVE STOCK RESERVE (UNITS)</span>
                    <span style={{ color: '#ef4444' }}>Red: Low Supply (&lt;3)</span>
                  </div>

                  <div className="stock-grid">
                    {BLOOD_GROUPS.map((bg) => {
                      const units = bank.availableBloodGroups[bg] || 0;
                      const isLow = units < 3;

                      return (
                        <div key={bg} className={`stock-cell ${isLow ? 'low' : ''}`}>
                          <div className="grp">{bg}</div>
                          <div className="qty">{units}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operating details & Contact */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', marginBottom: '6px' }}>
                    <Clock size={15} color="#0ea5e9" />
                    <span>{bank.operatingHours}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Phone size={15} color="#e63946" />
                    <span>Emergency Hotline: <strong>{bank.contact}</strong></span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href={`tel:${bank.contact}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Phone size={14} /> Call Blood Bank
                  </a>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActivePage('requests')}
                  >
                    Request Blood
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
