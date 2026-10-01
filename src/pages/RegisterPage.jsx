import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Phone, MapPin, Heart, Shield, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const RegisterPage = ({ setActivePage }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'O+',
    age: '',
    weight: '',
    gender: 'Male',
    city: 'New York',
    role: 'donor',
    isAvailable: true
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const ageNum = parseInt(formData.age, 10);
    const weightNum = parseFloat(formData.weight);

    if (ageNum < 18 || ageNum > 65) {
      setErrorMsg('Donors must be between 18 and 65 years old.');
      return;
    }

    if (weightNum < 50) {
      setErrorMsg('Minimum weight requirement for donor safety is 50 kg.');
      return;
    }

    const success = register({
      ...formData,
      age: ageNum,
      weight: weightNum
    });

    if (success) {
      showToast('Welcome to the HemoSync Hero community! You are now registered.', 'success');
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}
      setActivePage('dashboard');
    } else {
      setErrorMsg('An account with this email address already exists.');
    }
  };

  return (
    <div className="register-page section">
      <div className="container" style={{ maxWidth: '560px' }}>
        <div className="card" style={{ padding: '26px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e63946, #9d0208)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 6px 12px rgba(230, 57, 70, 0.25)'
              }}
            >
              <UserPlus size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
              Register as a Lifesaver Donor
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Join our verified registry and help save patients in emergencies.
            </p>
          </div>

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
                textAlign: 'center'
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <div className="input-wrap">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    required
                    className="form-input has-icon"
                    placeholder="e.g. username"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="input-wrap">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    required
                    className="form-input has-icon"
                    placeholder="alex@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-wrap">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-input has-icon"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div className="input-wrap">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    required
                    className="form-input has-icon"
                    placeholder="e.g. 555-019-2831"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Blood Group *</label>
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

              <div className="form-group">
                <label className="form-label">Age (18 - 65) *</label>
                <input
                  type="number"
                  required
                  min="18"
                  max="65"
                  className="form-input"
                  placeholder="e.g. 26"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg, min 50) *</label>
                <input
                  type="number"
                  required
                  min="50"
                  max="200"
                  className="form-input"
                  placeholder="e.g. 68"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <div className="input-wrap">
                  <MapPin className="input-icon" size={18} />
                  <input
                    type="text"
                    required
                    className="form-input has-icon"
                    placeholder="e.g. New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                <span style={{ fontWeight: 600 }}>Mark me as immediately Available to Donate</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
              Complete Donor Registration
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
            Already registered?{' '}
            <button
              onClick={() => setActivePage('login')}
              style={{ background: 'none', border: 'none', color: '#e63946', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign In Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
