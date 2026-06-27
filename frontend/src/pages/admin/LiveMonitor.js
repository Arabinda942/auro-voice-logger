import React, { useEffect, useState } from 'react';
import { dealersAPI } from '../../utils/api';

export default function LiveMonitor({ onLiveCount }) {
  const [dealers, setDealers] = useState([]);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    dealersAPI.list().then(r => { setDealers(r.data); onLiveCount?.(Math.min(r.data.length, 5)); }).catch(() => {});
    const t = setInterval(() => setTicker(x => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const statuses = ['On call', 'On call', 'Ringing', 'Available', 'Available'];
  const colors   = ['green',  'green',  'amber',   'gray',      'gray'];

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card"><div className="stat-label">Active Calls</div><div className="stat-value green">5</div></div>
        <div className="stat-card"><div className="stat-label">Ringing</div><div className="stat-value" style={{color:'var(--amber)'}}>2</div></div>
        <div className="stat-card"><div className="stat-label">Agents Online</div><div className="stat-value">{dealers.length}</div></div>
        <div className="stat-card"><div className="stat-label">Missed Today</div><div className="stat-value red">3</div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',animation:'blink 1.5s infinite'}} />
            <span className="card-title">Live Call Feed</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 }}>
            {[
              { status: 'ACTIVE', name: 'Rahul Sharma', client: 'Vikas Sharma', branch: 'Kolkata', time: '04:32', color: 'green' },
              { status: 'ACTIVE', name: 'Amit Roy', client: 'Meena Patel', branch: 'Mumbai', time: '02:11', color: 'green' },
              { status: 'RINGING', name: 'Suman Das', client: 'Arjun Nair', branch: 'Delhi', time: '…', color: 'amber' },
              { status: 'MISSED', name: 'Priya Sen', client: 'Unknown', branch: 'Chennai', time: '10:15 AM', color: 'red' },
            ].map((c, i) => (
              <div key={i} style={{
                border: `1px solid var(--${c.color === 'green' ? 'green' : c.color === 'amber' ? 'amber' : 'red'})`,
                borderRadius: 6, padding: 12, opacity: 0.9,
                background: c.color === 'green' ? 'var(--green-bg)' : c.color === 'amber' ? 'var(--amber-bg)' : 'var(--red-bg)'
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: `var(--${c.color})`, marginBottom: 4, fontFamily: 'var(--font-sans)' }}>{c.status}</div>
                <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 13, fontFamily: 'var(--font-serif)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.client}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{c.branch}</div>
                <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 4, fontSize: 13, fontFamily: 'var(--font-sans)' }}>{c.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Agent Status — Real Time</span></div>
          {dealers.slice(0, 8).map((d, i) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid var(--cream-2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${colors[i % 5]})`, flexShrink: 0 }} />
              <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{d.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.branch?.name} · Ext {d.sip_extension}</div>
              </div>
              <span className={`pill pill-${colors[i % 5] === 'green' ? 'green' : colors[i % 5] === 'amber' ? 'amber' : 'gray'}`}>{statuses[i % 5]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
