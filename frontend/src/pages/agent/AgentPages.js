import React, { useEffect, useState } from 'react';
import { callsAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import { Play, Download, Phone, Plus, Trash2, GripVertical, Save } from 'lucide-react';

function fmtDur(s) { if (!s) return '—'; return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }

// ─── MY CALLS ──────────────────────────────────────────────────
export function MyCalls() {
  const [calls, setCalls] = useState([]);
  const [type, setType] = useState('');
  useEffect(() => { callsAPI.list({ call_type: type }).then(r => setCalls(r.data)).catch(() => {}); }, [type]);
  return (
    <div><div className="card">
      <div className="search-row">
        <input type="date" /><input placeholder="Search customer…" style={{ flex: 1 }} />
        <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--cream)' }}>
          <option value="">All Types</option><option>Incoming</option><option>Outgoing</option><option>Missed</option>
        </select>
      </div>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Time</th><th>Customer</th><th>Number</th><th>Type</th><th>Duration</th><th>Recording</th></tr></thead>
        <tbody>
          {calls.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No calls yet.</td></tr>}
          {calls.map(c => (<tr key={c.id}>
            <td style={{ fontSize: 11 }}>{fmtDate(c.start_time)}</td>
            <td style={{ fontWeight: 600 }}>{c.client?.name || c.customer_number}</td>
            <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.customer_number}</td>
            <td><span className={`pill ${c.call_type === 'Incoming' ? 'pill-navy' : 'pill-amber'}`}>{c.call_type}</span>{c.status === 'Missed' && <span className="pill pill-red" style={{ marginLeft: 4 }}>Missed</span>}</td>
            <td>{fmtDur(c.duration_seconds)}</td>
            <td>{c.recording_path ? <div style={{ display: 'flex', gap: 4 }}><button className="btn btn-xs"><Play size={10} /></button><button className="btn btn-xs"><Download size={10} /></button></div> : '—'}</td>
          </tr>))}
        </tbody>
      </table></div>
    </div></div>
  );
}
export default MyCalls;

// ─── AGENT MISSED ──────────────────────────────────────────────
export function AgentMissed() {
  const [calls, setCalls] = useState([]);
  useEffect(() => { callsAPI.list({}).then(r => setCalls(r.data.filter(c => c.status === 'Missed'))).catch(() => {}); }, []);
  return (
    <div><div className="card">
      <div className="card-header"><span className="card-title" style={{ color: 'var(--red)' }}>Missed Calls — Callback Needed</span></div>
      {calls.length === 0 && <div className="empty-state"><p>No missed calls.</p></div>}
      {calls.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--cream-2)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}><Phone size={16} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.client?.name || c.customer_number}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.customer_number} · {fmtDate(c.start_time)}</div>
          </div>
          <button className="btn btn-success btn-sm" onClick={() => toast(`Calling back ${c.client?.name || c.customer_number}…`)}><Phone size={12} /> Call Back</button>
        </div>
      ))}
    </div></div>
  );
}

// ─── MY NUMBERS ────────────────────────────────────────────────
export function MyNumbers() {
  const [nums, setNums] = useState([
    { id: 1, num: '+91 98765 10101', label: 'Primary', rings: 3, active: true },
    { id: 2, num: '+91 98765 20202', label: 'Secondary', rings: 2, active: true },
    { id: 3, num: '+91 98765 30303', label: 'Backup', rings: 4, active: false },
  ]);
  const add = () => setNums(n => [...n, { id: Date.now(), num: '', label: 'New', rings: 3, active: true }]);
  const remove = id => setNums(n => n.filter(x => x.id !== id));
  const upd = (id, k, v) => setNums(n => n.map(x => x.id === id ? { ...x, [k]: v } : x));
  return (
    <div><div className="card">
      <div className="card-header"><span className="card-title">Configure My Numbers</span>
        <button className="btn btn-primary btn-sm" onClick={() => toast('Numbers saved')}><Save size={12} /> Save Changes</button>
      </div>
      <div style={{ padding: '10px 16px 4px', fontSize: 11, color: 'var(--muted)' }}>Incoming calls hunt through these numbers in priority order.</div>
      {nums.map((n, i) => (
        <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '22px 2fr 1fr 70px 80px auto', gap: 10, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--cream-2)' }}>
          <span style={{ color: 'var(--muted)', cursor: 'grab', display: 'flex', alignItems: 'center' }}><GripVertical size={14} /></span>
          <input value={n.num} onChange={e => upd(n.id, 'num', e.target.value)} style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, fontFamily: 'monospace', background: 'var(--cream)' }} placeholder="Mobile number" />
          <select value={n.label} onChange={e => upd(n.id, 'label', e.target.value)} style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 11, background: 'var(--cream)' }}>
            <option>Primary</option><option>Secondary</option><option>Backup</option><option>Office</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>Rings:</span>
            <input type="number" value={n.rings} min="1" max="10" onChange={e => upd(n.id, 'rings', +e.target.value)} style={{ width: 42, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, textAlign: 'center', background: 'var(--cream)' }} />
          </div>
          <select value={n.active ? 'Active' : 'Inactive'} onChange={e => upd(n.id, 'active', e.target.value === 'Active')} style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 11, background: 'var(--cream)' }}>
            <option>Active</option><option>Inactive</option>
          </select>
          {nums.length > 1 && <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => remove(n.id)}><Trash2 size={11} /></button>}
        </div>
      ))}
      <div style={{ padding: '12px 16px' }}>
        <button className="btn btn-sm btn-primary" onClick={add}><Plus size={12} /> Add Number</button>
      </div>
    </div></div>
  );
}

// ─── PRIORITY & FAILOVER ───────────────────────────────────────
export function PriorityFailover() {
  const [nums] = useState([
    { num: '+91 98765 10101', label: 'Primary', rings: 3 },
    { num: '+91 98765 20202', label: 'Secondary', rings: 2 },
    { num: '+91 98765 30303', label: 'Backup', rings: 4 },
  ]);
  const failover = [
    { name: 'You (Rahul Sharma)', ext: 'Ext 101', label: 'Primary handler' },
    { name: 'Amit Roy', ext: 'Ext 102', label: '1st failover' },
    { name: 'Suman Das', ext: 'Ext 103', label: '2nd failover' },
  ];
  return (
    <div>
      <div className="card">
        <div className="card-header"><span className="card-title">Call Hunt Priority</span>
          <button className="btn btn-primary btn-sm" onClick={() => toast('Priority order saved')}><Save size={12} /> Save Order</button>
        </div>
        <div style={{ padding: '10px 16px 4px', fontSize: 11, color: 'var(--muted)' }}>Drag to reorder. Calls ring each number in sequence.</div>
        {nums.map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--cream-2)' }}>
            <GripVertical size={14} style={{ color: 'var(--muted)', cursor: 'grab' }} />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--navy)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>{n.num}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{n.label}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
              Hunt rings:
              <input type="number" defaultValue={n.rings} min="1" max="10" style={{ width: 44, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, textAlign: 'center', background: 'var(--cream)' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Failover Dealer Chain</span></div>
        <div style={{ padding: '10px 16px 4px', fontSize: 11, color: 'var(--muted)' }}>If you don't answer, calls cascade in this order.</div>
        {failover.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--cream-2)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--cream-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>{i + 1}</div>
            <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{f.name.replace(' (You)','').split(' ').map(n => n[0]).join('').slice(0,2)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{f.name}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{f.ext} · {f.label}</div>
            </div>
            {i === 0 ? <span className="pill pill-navy">You</span> : <button className="btn btn-xs" style={{ color: 'var(--red)' }}><Trash2 size={11} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AGENT RECORDINGS ──────────────────────────────────────────
export function AgentRecordings() {
  const [calls, setCalls] = useState([]);
  useEffect(() => { callsAPI.list({}).then(r => setCalls(r.data.filter(c => c.recording_path))).catch(() => {}); }, []);
  return (
    <div><div className="card">
      <div className="search-row">
        <input type="date" /><input placeholder="Search customer…" style={{ flex: 1 }} />
        <button className="btn btn-sm"><Download size={12} /> Bulk Export</button>
      </div>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Time</th><th>Customer</th><th>Duration</th><th>Size</th><th>Play</th><th>Download</th></tr></thead>
        <tbody>
          {calls.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No recordings yet.</td></tr>}
          {calls.map(c => (<tr key={c.id}>
            <td style={{ fontSize: 11 }}>{fmtDate(c.start_time)}</td>
            <td style={{ fontWeight: 600 }}>{c.client?.name || c.customer_number}</td>
            <td>{fmtDur(c.duration_seconds)}</td>
            <td style={{ fontSize: 11, color: 'var(--muted)' }}>{c.recording_size_mb ? c.recording_size_mb + ' MB' : '—'}</td>
            <td><button className="btn btn-xs"><Play size={11} /> Play</button></td>
            <td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-xs"><Download size={11} /> WAV</button><button className="btn btn-xs"><Download size={11} /> MP3</button></div></td>
          </tr>))}
        </tbody>
      </table></div>
    </div></div>
  );
}
