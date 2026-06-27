// Recordings.js
import React, { useEffect, useState } from 'react';
import { callsAPI } from '../../utils/api';
import { Play, Download } from 'lucide-react';
function fmtDur(s) { if (!s) return '—'; return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
export default function Recordings() {
  const [calls, setCalls] = useState([]);
  useEffect(() => { callsAPI.list({}).then(r => setCalls(r.data.filter(c => c.recording_path))).catch(() => {}); }, []);
  return (
    <div><div className="card">
      <div className="card-header"><span className="card-title">All Recordings</span>
        <button className="btn btn-sm"><Download size={13} /> Bulk Download</button>
      </div>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Date / Time</th><th>Agent</th><th>Customer</th><th>Duration</th><th>Size</th><th>Play</th><th>Download</th></tr></thead>
        <tbody>
          {calls.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:24,color:'var(--muted)'}}>No recordings yet.</td></tr>}
          {calls.map(c => (<tr key={c.id}>
            <td style={{fontSize:11}}>{fmtDate(c.start_time)}</td>
            <td style={{fontWeight:600}}>{c.dealer?.name||'—'}</td>
            <td>{c.client?.name||c.customer_number}</td>
            <td>{fmtDur(c.duration_seconds)}</td>
            <td style={{fontSize:11,color:'var(--muted)'}}>{c.recording_size_mb ? c.recording_size_mb+' MB' : '—'}</td>
            <td><button className="btn btn-xs"><Play size={11}/> Play</button></td>
            <td><div style={{display:'flex',gap:4}}>
              <button className="btn btn-xs"><Download size={11}/> WAV</button>
              <button className="btn btn-xs"><Download size={11}/> MP3</button>
            </div></td>
          </tr>))}
        </tbody>
      </table></div>
    </div></div>
  );
}
