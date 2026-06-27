import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const Toast = forwardRef((_, ref) => {
  const [toasts, setToasts] = useState([]);

  useImperativeHandle(ref, () => ({
    show: (msg, type = 'success') => {
      const id = Date.now();
      setToasts(t => [...t, { id, msg, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    }
  }));

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast-bar ${t.type}`} style={{ minWidth: 260 }}>
          {t.type === 'success' ? <CheckCircle size={15} /> : t.type === 'error' ? <XCircle size={15} /> : <Info size={15} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
});

export default Toast;

// Simple hook-style global toast
let globalToast = null;
export function setGlobalToast(ref) { globalToast = ref; }
export function toast(msg, type = 'success') { globalToast?.current?.show(msg, type); }
