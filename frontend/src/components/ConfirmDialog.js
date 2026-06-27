import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <AlertTriangle size={16} style={{ color: 'var(--red)' }} />
          <span className="modal-title">{title || 'Confirm'}</span>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>{message}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Yes, delete</button>
            <button className="btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
