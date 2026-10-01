import React, { useState } from 'react';
import { LogIn, UserPlus, LogOut, Bell, HeartHandshake, User } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onSignInClick,
  onRegisterClick,
  onBecomeDonorClick,
  onLogoutClick,
  notifications = [],
  onAcceptRequest,
  onMarkNotifRead,
  onClearAllNotifs
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="navbar">
      <a
        href="#home"
        className="brand"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('home');
        }}
      >
        <img
          src="/logo.png"
          alt="HemoSync Logo"
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
        />
        <span style={{ color: '#c1121f', fontWeight: 800 }}>HemoSync</span>
      </a>

      <ul className="nav-links">
        <li>
          <a
            href="#home"
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#create-request"
            className={`nav-item ${activeTab === 'create-request' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('create-request');
            }}
          >
            Request Blood
          </a>
        </li>
        <li>
          <a
            href="#dashboard"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
          >
            Dashboard
          </a>
        </li>
        <li>
          <a
            href="#about"
            className={`nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('about');
            }}
          >
            About
          </a>
        </li>
      </ul>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* NOTIFICATION BELL - Always accessible in Navbar */}
        <div
          className="notif-bell"
          id="notif-btn"
          onClick={() => setShowNotifDropdown(!showNotifDropdown)}
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Direct Requests & Notifications"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: unreadCount > 0 ? '#fef2f2' : '#f1f5f9',
              border: unreadCount > 0 ? '1.5px solid #f87171' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={19} color={unreadCount > 0 ? '#c1121f' : '#475569'} />
          </div>

          {unreadCount > 0 && (
            <div
              className="notif-badge"
              id="notif-badge"
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#c1121f',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 900,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(193, 18, 31, 0.4)',
                animation: 'pulse 1.8s infinite'
              }}
            >
              {unreadCount}
            </div>
          )}

          {showNotifDropdown && (
            <>
              {/* Backdrop to close dropdown on outside click */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifDropdown(false);
                }}
              />

              <div
                id="notif-dropdown"
                className="glass-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '360px',
                  maxWidth: '90vw',
                  padding: '16px',
                  zIndex: 1000,
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                  cursor: 'default',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={16} color="#c1121f" />
                    <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#1e293b' }}>
                      Notifications {unreadCount > 0 && <span style={{ color: '#c1121f', fontSize: '0.82rem' }}>({unreadCount} new)</span>}
                    </h4>
                  </div>

                  {notifications.length > 0 && onClearAllNotifs && (
                    <button
                      type="button"
                      onClick={onClearAllNotifs}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div
                  id="notif-list"
                  style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}
                >
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.88rem', color: '#64748b', textAlign: 'center', padding: '24px 10px' }}>
                      <Bell size={32} color="#cbd5e1" style={{ margin: '0 auto 8px', display: 'block' }} />
                      No new notifications
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                        Direct requests targeted to you will appear here!
                      </div>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => {
                      const isTargeted = notif.type === 'targeted_request' || notif.targetDonorNames?.length;
                      const isPledged = notif.request?.status === 'PLEDGED';

                      return (
                        <div
                          key={notif.id || idx}
                          style={{
                            padding: '12px',
                            background: notif.read ? '#f8fafc' : '#fff5f5',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${notif.read ? '#cbd5e1' : '#c1121f'}`,
                            fontSize: '0.85rem',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: isTargeted ? '#b91c1c' : '#475569',
                                background: isTargeted ? '#fee2e2' : '#f1f5f9',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isTargeted ? '🎯 DIRECT REQUEST' : 'BROADCAST ALERT'}
                            </span>

                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{notif.createdAt}</span>
                          </div>

                          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', marginBottom: '4px' }}>
                            {notif.title}
                          </div>

                          <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '0.82rem', lineHeight: 1.45 }}>
                            {notif.message}
                          </p>

                          {/* Targeted donor info tag */}
                          {notif.targetDonorNames && notif.targetDonorNames.length > 0 && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: '#047857',
                                background: '#ecfdf5',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                marginBottom: '8px',
                                fontWeight: 700
                              }}
                            >
                              Pointed to: {notif.targetDonorNames.join(', ')}
                            </div>
                          )}

                          {isPledged && (
                            <div style={{ fontSize: '0.78rem', color: '#065f46', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, marginBottom: '8px' }}>
                              ✅ Pledged & Accepted
                            </div>
                          )}

                          {/* Action Buttons inside notification item */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                            {notif.request && onAcceptRequest && !isPledged && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  onAcceptRequest(notif.request._id || notif.requestId);
                                  if (onMarkNotifRead) onMarkNotifRead(notif.id);
                                }}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  borderRadius: '8px',
                                  border: 'none',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                              >
                                ✅ Accept & Pledge
                              </button>
                            )}

                            {notif.request?.mobile && (
                              <a
                                href={`tel:${notif.request.mobile}`}
                                className="btn btn-outline btn-sm"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  color: '#1e293b',
                                  borderColor: '#cbd5e1'
                                }}
                              >
                                📞 Call
                              </a>
                            )}

                            {!notif.read && onMarkNotifRead && (
                              <button
                                type="button"
                                onClick={() => onMarkNotifRead(notif.id)}
                                style={{
                                  marginLeft: 'auto',
                                  background: 'none',
                                  border: 'none',
                                  color: '#94a3b8',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* AUTH ACTIONS */}
        {!currentUser ? (
          <>
            {/* Dedicated Sign In Button */}
            <button
              className="btn btn-outline"
              id="navbar-signin-btn"
              onClick={onSignInClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: 'white',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <LogIn size={16} /> Sign In
            </button>

            {/* Dedicated Register Button */}
            <button
              className="btn btn-primary"
              id="navbar-register-btn"
              onClick={onRegisterClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #c1121f, #780000)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(193, 18, 31, 0.25)'
              }}
            >
              <UserPlus size={16} /> Register
            </button>
          </>
        ) : (
          <>
            {/* Become a Donor CTA if user is not yet a donor */}
            {(!currentUser.donorProfile && currentUser.role !== 'donor') && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={onBecomeDonorClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  borderColor: '#c1121f',
                  color: '#c1121f',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  background: '#fff5f5',
                  cursor: 'pointer'
                }}
              >
                <HeartHandshake size={16} /> Become a Donor
              </button>
            )}

            {/* User Profile */}
            <div
              className="user-profile-btn"
              id="user-profile-display"
              onClick={() => setActiveTab('dashboard')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div
                className="avatar"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c1121f, #780000)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                  {currentUser.name || 'User'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.2 }}>
                  {currentUser.email ? (currentUser.email.length > 18 ? currentUser.email.substring(0, 16) + '...' : currentUser.email) : 'Logged In'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              className="btn btn-outline"
              id="logout-btn"
              onClick={onLogoutClick}
              title="Logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderColor: '#e2e8f0',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
