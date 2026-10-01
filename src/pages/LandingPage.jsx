import React, { useState } from 'react';
import { Droplet, Heart, Shield, Users, Clock, ArrowRight, Activity, MapPin, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CompatibilityMatrix } from '../components/CompatibilityMatrix';
import { EligibilityModal } from '../components/EligibilityModal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ setActivePage }) => {
  const { bloodRequests } = useData();
  const { isLoggedIn } = useAuth();
  const [eligibilityOpen, setEligibilityOpen] = useState(false);

  const criticalRequest = bloodRequests.find((r) => r.urgency === 'Critical' && r.status === 'pending');

  return (
    <div className="landing-page">
      {/* Emergency Alert Ticker */}
      {criticalRequest && (
        <div className="emergency-ticker">
          <div className="container ticker-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="ticker-tag">Urgent Alert</span>
              <span>
                Critical blood need: <strong>{criticalRequest.bloodGroup}</strong> at {criticalRequest.hospital}, {criticalRequest.city} ({criticalRequest.unitsRequired} units required)
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('requests')}
              style={{ background: 'white', color: '#9d0208', fontWeight: 700 }}
            >
              Respond Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="container hero-grid">
          <div className="hero-left">
            <div className="hero-badge-pill">
              <Sparkles size={14} /> 24/7 Verified Donor & Emergency Hospital Network
            </div>
            <h1 className="hero-title">
              Donate Blood, <br />
              <span className="highlight">Save Precious Lives.</span>
            </h1>
            <p className="hero-desc">
              Connect instantly with nearby volunteer blood donors, locate real-time blood bank reserves, and broadcast emergency transfusion requests across your city.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => setActivePage('donors')}>
                <Users size={18} /> Find Donors Nearby
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => setActivePage('requests')}>
                <Droplet size={18} color="#e63946" /> Request Blood
              </button>
              <button className="btn btn-outline" onClick={() => setEligibilityOpen(true)}>
                Can I Donate? Check Now
              </button>
            </div>

            <div className="hero-stats-inline">
              <div className="stat-item">
                <h4>8,540+</h4>
                <p>Verified Donors</p>
              </div>
              <div className="stat-item">
                <h4>15,200+</h4>
                <p>Lives Touched</p>
              </div>
              <div className="stat-item">
                <h4>100%</h4>
                <p>Free Community</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="hero-right">
            <div className="hero-visual-card">
              <div className="pulse-beacon">
                <div className="pulse-circle"></div>
                <div className="pulse-circle-2"></div>
                <div className="pulse-core">
                  <Droplet size={38} fill="white" />
                </div>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>Be A Lifesaver Today</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
                A single whole blood donation takes less than 15 minutes and can rescue three accident or surgery patients.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>Ready to donate?</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Takes 30 seconds to sign up</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActivePage(isLoggedIn ? 'dashboard' : 'register')}
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Join as Donor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Why HemoSync Works</span>
            <h2 className="section-title">Designed for Urgency, Trust & Speed</h2>
            <p className="section-desc">
              In critical situations, every second counts. HemoSync simplifies blood coordination so patients receive urgent blood without bureaucratic delays.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            <div className="card" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(230, 57, 70, 0.1)',
                  color: '#e63946',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Activity size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Instant Emergency Broadcasts</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Hospitals and families can broadcast urgent requirements to local compatible donors within seconds with live status tracking.
              </p>
            </div>

            <div className="card" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(14, 165, 233, 0.1)',
                  color: '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Verified Local Donors</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Search by exact blood group and neighborhood. Filter by active availability and reach out directly with safe contact protocols.
              </p>
            </div>

            <div className="card" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Shield size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Real-time Bank Inventory</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Check live blood unit reserves across municipal hospitals and Red Cross hubs to avoid traveling between centers unnecessarily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Compatibility Section */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">Educational Matrix</span>
            <h2 className="section-title">Know Your Blood Compatibility</h2>
            <p className="section-desc">
              Understand which blood groups match your own. Universal donors (O-) and universal recipients (AB+) play special lifesaver roles.
            </p>
          </div>

          <CompatibilityMatrix />
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="section" style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '24px',
              padding: '60px 40px',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
            }}
          >
            <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                Ready to Make a Difference?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.6 }}>
                Join our nationwide community of donors and volunteers. When someone nearby calls for help, you could be the miracle they prayed for.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setActivePage(isLoggedIn ? 'dashboard' : 'register')}
                >
                  {isLoggedIn ? 'Go to My Dashboard' : 'Register as a Donor Today'}
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => setEligibilityOpen(true)}>
                  Take Eligibility Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Modal */}
      <EligibilityModal
        isOpen={eligibilityOpen}
        onClose={() => setEligibilityOpen(false)}
        onRegisterClick={() => setActivePage('register')}
      />
    </div>
  );
};
