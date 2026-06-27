// DialPad.js
import React, { useState } from 'react';
import { toast } from '../../components/Toast';
import { Phone, Delete } from 'lucide-react';
export function DialPad() {
  const [num, setNum] = useState('');
  const [from, setFrom] = useState(0);
  const NUMS = ['+91 98765 10101 (Primary)', '+91 98765 20202 (Secondary)', '+91 98765 30303 (Backup)'];
  const dial = d => setNum(n => n + d);
  const call = () => { if (!num) { toast('Enter a number', 'error'); return; } toast(`Calling ${num} from ${NUMS[from].split(' ')[0]}…`); setNum(''); };
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header"><Phone size={14} style={{ color: 'var(--gold-2)' }} /><span className="card-title">Dial Pad</span></div>
        <div className="card-body">
          <div className="field" style={{ marginBottom: 12 }}><label>Calling From</label>
            <select value={from} onChange={e => setFrom(+e.target.value)}>{NUMS.map((n, i) => <option key={i} value={i}>{n}</option>)}</select>
          </div>
          <input value={num} readOnly style={{ width: '100%', fontSize: 22, textAlign: 'center', letterSpacing: '0.1em', padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--cream)', fontFamily: 'monospace', marginBottom: 10 }} placeholder="Enter number" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map(d => (
              <button key={d} className="btn" style={{ justifyContent: 'center', padding: 12, fontSize: 18, fontWeight: 700 }} onClick={() => dial(d)}>{d}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center', padding: 10 }} onClick={call}><Phone size={16} /> Call</button>
            <button className="btn" style={{ padding: '10px 14px' }} onClick={() => setNum(n => n.slice(0, -1))}><Delete size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DialPad;
