import React from 'react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      id="toast-container"
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: '90%'
      }}
    >
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const bgColor = isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : '#eff6ff';
        const borderColor = isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6';
        const icon = isSuccess ? '✅' : isError ? '❌' : 'ℹ️';

        return (
          <div
            key={toast.id}
            style={{
              background: bgColor,
              borderLeft: `4px solid ${borderColor}`,
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                {icon} {toast.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
