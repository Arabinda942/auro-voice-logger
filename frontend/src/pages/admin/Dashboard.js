import React, { useEffect, useState } from 'react';
import { dashboardAPI, dealersAPI, callsAPI } from '../../utils/api';
import { TrendingUp, Building2 } from 'lucide-react';

function fmtDur(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    dashboardAPI.stats().then(r => setStats(r.data)).catch(() => {});
    dealersAPI.list().then(r => setDealers(r.data.slice(0, 6))).catch(() => {});
    callsAPI.list({}).then(r => setRecentCalls(r.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Calls</div>
          <div className="stat-value">{stats?.today_calls ?? '—'}</div>
          <div className="stat-sub">Total logged today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Missed Today</div>
          <div className="stat-value red">{stats?.missed_today ?? '—'}</div>
          <div className="stat-sub">Require callback</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Duration</div>
          <div className="stat-value gold">{stats ? fmtDur(stats.avg_duration_seconds) : '—'}</div>
          <div className="stat-sub">Per completed call</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value">{stats?.agents_total ?? '—'}</div>
          <div className="stat-sub">Across {stats?.branches_total ?? '—'} branches</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <TrendingUp size={14} style={{ color: 'var(--gold-2)' }} />
            <span className="card-title">Top Agents</span>
          </div>
          {dealers.length === 0 && <div className="empty-state"><p>No agent data yet.</p></div>}
          {dealers.map((d, i) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px', borderBottom: '1px solid var(--cream-2)' }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.branch?.name} · Ext {d.sip_extension}</div>
                <div className="prog"><div className="prog-fill" style={{ width: `${Math.max(30, 90 - i * 12)}%` }} /></div>
              </div>
              <span className="pill pill-navy">#{d.priority}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <Building2 size={14} style={{ color: 'var(--gold-2)' }} />
            <span className="card-title">Recent Call Activity</span>
          </div>
          {recentCalls.length === 0 && <div className="empty-state"><p>No calls logged yet.</p></div>}
          {recentCalls.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '1px solid var(--cream-2)', fontSize: 12 }}>
              <span className={`pill ${c.status === 'Completed' ? 'pill-green' : c.status === 'Missed' ? 'pill-red' : 'pill-amber'}`}>{c.call_type}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{c.client?.name || c.customer_number}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{c.dealer?.name}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{c.duration_seconds ? fmtDur(c.duration_seconds) : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
