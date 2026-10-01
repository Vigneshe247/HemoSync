import React, { useState } from 'react';
import { Check, Minus, Info } from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Can donor (row) donate to recipient (col)?
const COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Only AB+
};

export const CompatibilityMatrix = () => {
  const [selectedGroup, setSelectedGroup] = useState('O-');

  const canGiveTo = COMPATIBILITY[selectedGroup] || [];
  const canReceiveFrom = Object.keys(COMPATIBILITY).filter((donor) =>
    COMPATIBILITY[donor].includes(selectedGroup)
  );

  return (
    <div className="card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>
            Interactive Blood Compatibility Matrix
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Select your blood group to see who you can help and who can help you.
          </p>
        </div>

        {/* Selector pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
      </div>

      {/* Visual Summary Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e63946', textTransform: 'uppercase', marginBottom: '8px' }}>
            You ({selectedGroup}) Can Donate Blood To:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {canGiveTo.map((bg) => (
              <span key={bg} className="bg-badge bg-badge-red" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                {bg}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '8px' }}>
            You ({selectedGroup}) Can Receive Blood From:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {canReceiveFrom.map((bg) => (
              <span
                key={bg}
                className="bg-badge"
                style={{ background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd', fontSize: '0.9rem', padding: '4px 12px' }}
              >
                {bg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full Cross Reference Table */}
      <div className="matrix-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Donor Blood Group</th>
              {BLOOD_GROUPS.map((recipient) => (
                <th key={recipient}>
                  <span className={recipient === selectedGroup ? 'bg-badge bg-badge-red' : ''}>
                    {recipient}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOOD_GROUPS.map((donor) => (
              <tr
                key={donor}
                style={{
                  background: donor === selectedGroup ? 'rgba(230, 57, 70, 0.04)' : undefined
                }}
              >
                <td style={{ textAlign: 'left', fontWeight: 700, paddingLeft: '20px' }}>
                  <span className={donor === selectedGroup ? 'bg-badge bg-badge-solid' : 'bg-badge bg-badge-red'}>
                    {donor}
                  </span>
                </td>
                {BLOOD_GROUPS.map((recipient) => {
                  const compatible = COMPATIBILITY[donor]?.includes(recipient);
                  return (
                    <td key={recipient}>
                      {compatible ? (
                        <span className="check-pill">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="dash-pill">
                          <Minus size={14} />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
