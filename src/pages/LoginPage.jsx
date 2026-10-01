import React, { useState } from 'react';
import { LogIn, Mail, Lock, Heart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = ({ setActivePage }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAutoFillDemo = () => {
    setEmail('john.doe@gmail.com');
    setPassword('Password123!');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const success = login(email, password);
    if (success) {
      showToast('Welcome back! You are now signed in.', 'success');
      setActivePage('dashboard');
    } else {
      setErrorMsg('Invalid credentials. Check email & password or click Auto-Fill Demo.');
    }
  };

  return (
    <div className="login-page section" style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            background: 'white',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {/* Left Decorative Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              padding: '48px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #e63946, #9d0208)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}
              >
                <Heart size={24} fill="white" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
                Welcome to HemoSync
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Log in to check your active donation pledges, manage your availability status, and respond to direct patient inquiries.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.86rem', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Verified Network
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0 }}>
                Every donation is tracked to protect donor privacy and patient safety.
              </p>
            </div>
          </div>

          {/* Right Form Card */}
          <div style={{ padding: '48px 40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Sign In</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Access your volunteer donor profile</p>
            </div>

            {/* 1-Click Demo Account Banner */}
            <div
              style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                  <Sparkles size={14} /> Quick Demo Account
                </div>
                <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>
                  john.doe@gmail.com / Password123!
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAutoFillDemo}
                style={{ background: 'white', borderColor: '#93c5fd', color: '#1d4ed8', fontWeight: 700 }}
              >
                Auto-Fill
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  marginBottom: '20px'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    required
                    className="form-input has-icon"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    className="form-input has-icon"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '12px' }}>
                <LogIn size={18} /> Sign In
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <button
                onClick={() => setActivePage('register')}
                style={{ background: 'none', border: 'none', color: '#e63946', fontWeight: 700, cursor: 'pointer' }}
              >
                Join as a Donor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
