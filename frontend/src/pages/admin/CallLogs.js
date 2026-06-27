import React, { useEffect, useState } from 'react';
import { callsAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import { Search, Download, Play } from 'lucide-react';

function fmtDur(s) { if (!s) return '—'; const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }

export default function CallLogs() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ call_type: '', date_from: '', date_to: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await callsAPI.list(filters);
      setCalls(res.data);
    } catch { toast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const F = k => ({ value: filters[k], onChange: e => setFilters(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div>
      <div className="card">
        <div className="search-row">
          <input type="date" {...F('date_from')} title="From date" />
          <input type="date" {...F('date_to')} title="To date" />
          <select {...F('call_type')}>
            <option value="">All Types</option>
            <option>Incoming</option><option>Outgoing</option><option>Missed</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={load}><Search size={13} /> Search</button>
          <button className="btn btn-sm"><Download size={13} /> Export</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date / Time</th><th>Customer</th><th>Agent</th><th>Branch</th><th>Type</th><th>Duration</th><th>Status</th><th>Recording</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Loading…</td></tr>}
              {!loading && calls.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No calls found.</td></tr>}
              {calls.map(c => (
                <tr key={c.id}>
                  <td style={{ fontSize: 11 }}>{fmtDate(c.start_time)}</td>
                  <td style={{ fontWeight: 600 }}>{c.client?.name || c.customer_number}</td>
                  <td>{c.dealer?.name || '—'}</td>
                  <td>{c.dealer?.branch?.name || '—'}</td>
                  <td><span className={`pill ${c.call_type === 'Incoming' ? 'pill-navy' : 'pill-amber'}`}>{c.call_type}</span></td>
                  <td>{fmtDur(c.duration_seconds)}</td>
                  <td><span className={`pill ${c.status === 'Completed' ? 'pill-green' : c.status === 'Missed' ? 'pill-red' : 'pill-amber'}`}>{c.status}</span></td>
                  <td>
                    {c.recording_path
                      ? <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-xs"><Play size={10} /></button>
                          <button className="btn btn-xs"><Download size={10} /> WAV</button>
                        </div>
                      : <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
