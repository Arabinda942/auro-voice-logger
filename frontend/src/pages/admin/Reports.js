import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import { Download, FileText } from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ type: 'Call summary report', from: '', to: '' });
  useEffect(() => { dashboardAPI.stats().then(r => setStats(r.data)).catch(() => {}); }, []);
  const F = k => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });
  return (
    <div>
      <div className="two-col">
        <div className="card">
          <div className="card-header"><span className="card-title">Generate Report</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field"><label>Report Type</label>
                <select {...F('type')}>
                  <option>Call summary report</option>
                  <option>Agent performance report</option>
                  <option>Branch-wise call report</option>
                  <option>Missed calls report</option>
                  <option>Recording inventory</option>
                </select>
              </div>
              <div className="form-grid">
                <div className="field"><label>From Date</label><input type="date" {...F('from')} /></div>
                <div className="field"><label>To Date</label><input type="date" {...F('to')} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => toast(`Report exported as Excel`)}><Download size={13} /> Export Excel</button>
                <button className="btn" onClick={() => toast(`Report exported as PDF`)}><FileText size={13} /> Export PDF</button>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Overall Statistics</span></div>
          <div className="card-body">
            {[
              ['Total Calls', stats?.total_calls ?? '—'],
              ['Today\'s Calls', stats?.today_calls ?? '—'],
              ['Missed Today', stats?.missed_today ?? '—'],
              ['Active Agents', stats?.agents_total ?? '—'],
              ['Branches', stats?.branches_total ?? '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--cream-2)', fontSize: 13, fontFamily: 'var(--font-sans)' }}>
                <span style={{ color: 'var(--muted)' }}>{l}</span>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
