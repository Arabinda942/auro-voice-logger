import React, { useEffect, useState } from 'react';
import { callsAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import { Phone } from 'lucide-react';
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
export default function MissedCalls() {
  const [calls, setCalls] = useState([]);
  useEffect(() => { callsAPI.list({ call_type: 'Missed' }).then(r => setCalls(r.data.filter(c => c.status === 'Missed'))).catch(() => {}); }, []);
  return (
    <div><div className="card">
      <div className="card-header">
        <span className="card-title" style={{color:'var(--red)'}}>Missed Calls — Action Required</span>
        <button className="btn btn-sm btn-primary" onClick={() => toast('All marked as attended')}>Mark All Attended</button>
      </div>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Time</th><th>Customer</th><th>Agent</th><th>Branch</th><th>Action</th></tr></thead>
        <tbody>
          {calls.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:24,color:'var(--muted)'}}>No missed calls.</td></tr>}
          {calls.map(c => (<tr key={c.id}>
            <td style={{color:'var(--red)',fontSize:11}}>{fmtDate(c.start_time)}</td>
            <td style={{fontWeight:600}}>{c.client?.name||c.customer_number}</td>
            <td>{c.dealer?.name||'—'}</td>
            <td>{c.dealer?.branch?.name||'—'}</td>
            <td><button className="btn btn-xs btn-success" onClick={() => toast(`Initiating callback to ${c.client?.name||c.customer_number}`)}><Phone size={11}/> Callback</button></td>
          </tr>))}
        </tbody>
      </table></div>
    </div></div>
  );
}
