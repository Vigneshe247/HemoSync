import React from 'react';
export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1e293b', color: 'white', padding: '40px 20px', textAlign: 'center', marginTop: '60px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <img src="/logo.png" alt="HemoSync Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
          </div>
          <h3 style={{ color: '#ef4444', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>HemoSync</h3>
        </div>
        <p style={{ color: '#cbd5e1', margin: 0 }}>Connecting lives, one drop at a time.</p>
      </div>
      <div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} HemoSync. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
