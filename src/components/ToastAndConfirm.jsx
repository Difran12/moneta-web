import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ToastAndConfirm() {
  const { toast, hideToast, confirmModal, hideConfirm, lang } = useStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return (
    <>
      {/* Toast Popup Notification */}
      {toast && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            background: toast.type === 'danger' ? 'rgba(239, 68, 68, 0.95)' :
                        toast.type === 'warning' ? 'rgba(245, 158, 11, 0.95)' :
                        toast.type === 'info' ? 'rgba(59, 130, 246, 0.95)' :
                        'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            maxWidth: '380px',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          {toast.type === 'danger' && <AlertCircle size={20} className="flex-shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle size={20} className="flex-shrink-0" />}
          {toast.type === 'info' && <Info size={20} className="flex-shrink-0" />}
          {toast.type === 'success' && <CheckCircle2 size={20} className="flex-shrink-0" />}

          <span style={{ flex: 1, lineHeight: 1.3 }}>{toast.message}</span>

          <button 
            onClick={hideToast}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 9998 }}
          onClick={(e) => e.target === e.currentTarget && hideConfirm()}
        >
          <div 
            className="modal-content animate-fade-in" 
            style={{ maxWidth: '400px', textAlign: 'center', padding: '1.75rem 1.5rem' }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: confirmModal.isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: confirmModal.isDanger ? '#ef4444' : '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              {confirmModal.isDanger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {confirmModal.title || (lang === 'en' ? 'Confirm Action' : 'Konfirmasi Tindakan')}
            </h3>

            <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '1.5rem' }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn" 
                style={{ flex: 1, padding: '0.6rem 1rem' }}
                onClick={hideConfirm}
              >
                {confirmModal.cancelText}
              </button>

              <button 
                type="button" 
                className="btn" 
                style={{ 
                  flex: 1, 
                  padding: '0.6rem 1rem',
                  background: confirmModal.isDanger ? '#ef4444' : 'var(--accent-brand)',
                  color: '#ffffff',
                  fontWeight: 700
                }}
                onClick={() => {
                  if (confirmModal.onConfirm) {
                    confirmModal.onConfirm();
                  }
                  hideConfirm();
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
