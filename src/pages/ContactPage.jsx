import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Clock, Users, Send, CheckCircle2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

const FAQS = [
  {
    q: 'How long does a whole blood donation take?',
    a: 'The actual blood drawing process takes only about 8 to 10 minutes. The entire visit, including health screening, mini-checkup, and refreshments, takes roughly 45 minutes.'
  },
  {
    q: 'How often can I donate blood?',
    a: 'Healthy donors can donate whole blood every 56 days (8 weeks), platelets every 7 days (up to 24 times a year), and double red cells every 112 days.'
  },
  {
    q: 'What should I do before coming to donate?',
    a: 'Drink an extra 16 oz of water, eat a healthy low-fat meal, avoid aspirin 48 hours prior if donating platelets, and make sure to bring your photo ID.'
  },
  {
    q: 'Who can receive my blood?',
    a: 'O- is the universal red blood cell donor and can be transfused to any patient. AB+ individuals are universal plasma donors. Our compatibility matrix shows full details!'
  }
];

export const ContactPage = () => {
  const { camps, registerForCamp } = useData();
  const { showToast } = useToast();

  const [openFaq, setOpenFaq] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleCampRegister = (camp) => {
    registerForCamp(camp.id);
    showToast(`You have successfully registered for the ${camp.title}!`, 'success');
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    showToast('Your message has been received! Our support team will reply within 24 hours.', 'success');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page section">
      <div className="container">
        {/* Header */}
        <div className="section-head">
          <span className="section-tag">Community & Support</span>
          <h2 className="section-title">Blood Donation Drives & Support</h2>
          <p className="section-desc">
            Find upcoming neighborhood blood donation camps, register to volunteer, or send an inquiry to our medical coordination team.
          </p>
        </div>

        {/* Upcoming Blood Donation Camps Section */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Calendar size={24} color="#e63946" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Upcoming Community Blood Camps</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {camps.map((camp) => (
              <div key={camp.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="status-badge fulfilled">Upcoming Drive</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0ea5e9' }}>
                      <Users size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {camp.registeredCount} Donors Registered
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>{camp.title}</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: '#475569', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} color="#e63946" /> {camp.location}, {camp.city}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="#e63946" /> {camp.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={15} color="#e63946" /> {camp.time}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                    Organized by: <strong>{camp.organizer}</strong>
                  </div>
                </div>

                <button className="btn btn-primary btn-block btn-sm" onClick={() => handleCampRegister(camp)}>
                  Register to Attend Drive
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form & Contact Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginBottom: '60px' }}>
          {/* Form */}
          <div className="card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>Send Us a Message</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Want to organize a corporate or college donation drive? Reach out to our team below.
            </p>

            <form onSubmit={handleContactSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Full name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="email@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Host a Blood Donation Drive"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea
                  required
                  rows="4"
                  className="form-input"
                  placeholder="Tell us more about your request or inquiry..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                <Send size={16} /> Submit Inquiry
              </button>
            </form>
          </div>

          {/* Contact Information Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>24/7 Lifeline Contacts</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#e63946', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Emergency Transfusion Hotline</strong>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: '2px 0 0' }}>
                      Toll-Free: <strong>1-800-543-3669</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>General Support Email</strong>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: '2px 0 0' }}>
                      support@hemosync-network.org
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Headquarters & Logistics</strong>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: '2px 0 0' }}>
                      National Health Complex, Central Atrium, New York
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '6px' }}>Need Urgent Blood Right Now?</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '14px' }}>
                Don't wait for email responses. Head straight to our emergency board to broadcast to volunteer donors immediately.
              </p>
              <a href="#requests" className="btn btn-outline btn-sm">
                Go to Emergency Dispatch
              </a>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Frequently Asked Questions</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Everything you need to know about whole blood donation.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="card" style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => setOpenFaq(isOpen ? null : idx)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: isOpen ? '#e63946' : '#0f172a' }}>
                      {faq.q}
                    </h4>
                    {isOpen ? <ChevronUp size={18} color="#e63946" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </div>
                  {isOpen && (
                    <p style={{ color: '#475569', fontSize: '0.92rem', marginTop: '12px', lineHeight: 1.6, margin: '12px 0 0' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
