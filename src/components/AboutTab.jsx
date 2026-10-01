import React from 'react';

export default function AboutTab() {
  return (
    <div id="view-about" className="tab-view active" style={{ display: 'block' }}>
      <div className="glass-card">
        <h2>About HemoSync</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px' }}>
          HemoSync is India's most trusted community-driven blood donation network. 
          Our mission is to eliminate blood shortages by connecting willing donors directly with patients in critical need, 
          leveraging real-time geolocation technology.
        </p>
        <h3 style={{ marginTop: '30px' }}>How It Works</h3>
        <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)', lineHeight: '1.8', marginTop: '10px' }}>
          <li>Register seamlessly using your Google account or email.</li>
          <li>Search for available donors using our advanced filtering system across all Indian states and districts.</li>
          <li>Send an emergency request directly to nearby verified donors.</li>
          <li>Save a life and become a hero in your community.</li>
        </ul>
      </div>

      {/* Mission / Vision Section */}
      <div className="mission-vision-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '40px' }}>
        <div style={{ backgroundColor: '#c1121f', color: 'white', padding: '40px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <i className="fas fa-quote-left" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'white' }}>Our Mission</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            To build a trusted, technology-enabled blood donation ecosystem that mobilises communities to ensure timely and reliable access to blood.
          </p>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Community"
            style={{ width: '100%', height: '100%', minHeight: '260px', objectFit: 'cover', borderRadius: '12px' }}
          />
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1542884748-2b87b36c6b90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Hands Together"
            style={{ width: '100%', height: '100%', minHeight: '260px', objectFit: 'cover', borderRadius: '12px' }}
          />
        </div>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <i className="fas fa-quote-left" style={{ fontSize: '3rem', marginBottom: '20px', color: '#c1121f' }}></i>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Our Vision</h2>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c1121f', marginBottom: '10px', fontStyle: 'italic' }}>
            No life lost for the want of blood.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#64748b' }}>
            A future where access to lifesaving blood is organised, dependable, and universally accessible.
          </p>
        </div>
      </div>
    </div>
  );
}
