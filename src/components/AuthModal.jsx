import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, AlertCircle, Loader2, Droplet } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { api } from '../services/api';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync mode whenever initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBirthDate('');
    setBloodGroup('O+');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setLoading(false);
    setGoogleLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Google Sign-In & Registration handler via Firebase + MongoDB Atlas Sync
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      // 1. Authenticate with Google via Firebase Auth
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // 2. Sync verified Google identity into MongoDB Atlas 'users' collection
      let authenticatedUser = null;
      try {
        const syncResult = await api.googleAuth({
          email: fbUser.email,
          name: fbUser.displayName || 'Google User',
          googleId: fbUser.uid,
          photoURL: fbUser.photoURL
        });
        authenticatedUser = syncResult.user;
      } catch (syncErr) {
        console.warn('MongoDB Atlas sync notice (will use Firebase profile):', syncErr.message);
        // Fallback user session from verified Google Firebase account
        authenticatedUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          email: fbUser.email,
          role: 'user',
          authProviders: ['google']
        };
      }

      onSuccess(authenticatedUser, `Welcome, ${authenticatedUser.name}! Signed in via Google.`);
      handleClose();
    } catch (err) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. Please try again.');
      } else {
        setErrorMsg(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email/Password Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();

    // REGISTER VALIDATION
    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!trimmedEmail) {
        setErrorMsg('Please enter a valid Gmail / Email address.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid phone number with at least 10 digits.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        // 1. Create account in Firebase Auth
        let fbUser = null;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name.trim() });
            fbUser = userCredential.user;
          }
        } catch (fbErr) {
          console.warn('Firebase register notice:', fbErr.message);
        }

        // 2. Register and persist user into MongoDB Atlas 'users' collection
        let resUser = null;
        try {
          const res = await api.register({
            name: name.trim(),
            email: trimmedEmail,
            phone: phone.trim(),
            bloodGroup: bloodGroup.trim(),
            birthDate: birthDate || null,
            password
          });
          resUser = res.user;
        } catch (apiErr) {
          console.warn('MongoDB Atlas backend API notice:', apiErr.message);
          if (fbUser) {
            resUser = {
              id: fbUser.uid,
              name: name.trim(),
              email: trimmedEmail,
              phone: phone.trim(),
              bloodGroup: bloodGroup.trim(),
              birthDate: birthDate || null,
              role: 'user',
              authProviders: ['password']
            };
          } else {
            throw apiErr;
          }
        }

        if (resUser && !resUser.bloodGroup) {
          resUser.bloodGroup = bloodGroup.trim();
        }

        onSuccess(resUser, `Account created successfully! Welcome, ${resUser.name}.`);
        handleClose();
      } catch (err) {
        setErrorMsg(err.message || 'Failed to create account. Please check details.');
      } finally {
        setLoading(false);
      }
    } else {
      // SIGN IN (LOGIN) VALIDATION: "only ask Email & password"
      if (!trimmedEmail || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      setLoading(true);
      try {
        let loggedInUser = null;
        // 1. Authenticate with Firebase Auth
        let fbUser = null;
        try {
          const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
          fbUser = cred.user;
        } catch (fbErr) {
          console.warn('Firebase login notice:', fbErr.message);
        }

        // 2. Authenticate against MongoDB Atlas
        try {
          const res = await api.login({
            email: trimmedEmail,
            password
          });
          loggedInUser = res.user;
        } catch (apiErr) {
          console.warn('MongoDB Atlas API login notice:', apiErr.message);
          if (fbUser) {
            loggedInUser = {
              id: fbUser.uid,
              name: fbUser.displayName || 'User',
              email: fbUser.email,
              role: 'user',
              authProviders: ['password']
            };
          } else {
            throw apiErr;
          }
        }

        onSuccess(loggedInUser, `Welcome back, ${loggedInUser.name}!`);
        handleClose();
      } catch (err) {
        setErrorMsg(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="modal-overlay"
      style={{ display: 'flex', zIndex: 1200, padding: '14px' }}
      onClick={handleClose}
    >
      <div
        className="glass-card modal-content hide-scrollbar"
        style={{
          maxWidth: '410px',
          width: '94%',
          maxHeight: '92vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          padding: '18px 22px',
          borderRadius: '16px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.22)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button moved to top right without disturbing components */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#64748b',
            zIndex: 30,
            transition: 'all 0.2s',
            padding: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '14px',
            marginRight: '28px'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '7px 10px',
              border: 'none',
              borderRadius: '7px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? '#c1121f' : '#64748b',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '7px 10px',
              border: 'none',
              borderRadius: '7px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: mode === 'register' ? 'white' : 'transparent',
              color: mode === 'register' ? '#c1121f' : '#64748b',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
            {mode === 'login'
              ? 'Enter your email and password to access your account'
              : 'Join HemoSync to access blood donation and emergency network'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.86rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Continue Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '9px 14px',
            background: 'white',
            border: '1.5px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          {googleLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '14px 0',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ padding: '0 10px' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit}>
          {/* Register Mode Only: Username & Blood Group */}
          {mode === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={15}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '32px', height: '38px', borderRadius: '8px', fontSize: '0.86rem' }}
                    placeholder="e.g. username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Blood Group
                </label>
                <div style={{ position: 'relative' }}>
                  <Droplet
                    size={14}
                    style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#dc2626', pointerEvents: 'none' }}
                  />
                  <select
                    className="form-control"
                    style={{
                      paddingLeft: '28px',
                      paddingRight: '6px',
                      paddingTop: 0,
                      paddingBottom: 0,
                      height: '38px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#b91c1c',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    required
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Both Modes: Email Address */}
          <div className="form-group" style={{ marginBottom: mode === 'register' ? '8px' : '12px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
              {mode === 'register' ? 'Gmail / Email Address' : 'Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '32px', height: '38px', borderRadius: '8px', fontSize: '0.86rem' }}
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Register Mode Only: Phone Number & Date */}
          {mode === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={15}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="tel"
                    className="form-control"
                    style={{ paddingLeft: '32px', height: '38px', borderRadius: '8px', fontSize: '0.86rem' }}
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control"
                  style={{ height: '38px', borderRadius: '8px', fontSize: '0.82rem', padding: '0 8px' }}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Password (Both Modes) & Confirm Password (Register Mode) */}
          {mode === 'register' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={14}
                    style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '28px', height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                  Confirm Pass
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={14}
                    style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '28px', height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                    placeholder="Re-enter"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '36px', height: '38px', borderRadius: '8px', fontSize: '0.88rem' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '0.94rem',
              fontWeight: 700,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #c1121f, #780000)',
              border: 'none',
              cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px'
            }}
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Footer switch */}
        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.84rem', color: '#64748b' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c1121f',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c1121f',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
