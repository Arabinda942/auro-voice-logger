import React, { useState, useEffect, useRef } from 'react';
import { callsAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import { Phone, PhoneOff, PhoneIncoming, PhoneOutgoing, Mic, MicOff, Pause, ArrowLeftRight, FileText, Play, Download } from 'lucide-react';

function fmtDur(s) { if (!s) return '—'; return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }

const DEMO_CALLERS = [
  { name: 'Vikas Sharma', num: '+91 98765 43210', ucc: 'UCC001' },
  { name: 'Meena Patel', num: '+91 87654 32109', ucc: 'UCC002' },
  { name: 'Arjun Nair', num: '+91 76543 21098', ucc: 'UCC003' },
];
const MY_NUMBERS = [
  { num: '+91 98765 10101', label: 'Primary' },
  { num: '+91 98765 20202', label: 'Secondary' },
  { num: '+91 98765 30303', label: 'Backup' },
];

export default function AgentDashboard() {
  const [callPhase, setCallPhase] = useState('idle'); // idle | ringing | active
  const [caller, setCaller] = useState(null);
  const [activeNum, setActiveNum] = useState(0);
  const [muted, setMuted] = useState(false);
  const [secs, setSecs] = useState(0);
  const [calls, setCalls] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    callsAPI.list({}).then(r => setCalls(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const simulateRing = () => {
    const c = DEMO_CALLERS[Math.floor(Math.random() * DEMO_CALLERS.length)];
    setCaller(c); setCallPhase('ringing');
  };
  const answer = () => {
    setCallPhase('active'); setSecs(0);
    timerRef.current = setInterval(() => setSecs(x => x + 1), 1000);
  };
  const reject = () => { setCallPhase('idle'); setCaller(null); toast('Call rejected'); };
  const endCall = () => {
    clearInterval(timerRef.current);
    toast(`Call ended · Duration: ${fmtDur(secs)}`);
    setCallPhase('idle'); setCaller(null); setSecs(0); setMuted(false);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const timerStr = `${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`;

  return (
    <div>
      {/* ── INCOMING ── */}
      {callPhase === 'ringing' && (
        <div className="call-banner call-incoming">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(179,106,0,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', flexShrink: 0 }}>
              <Phone size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="call-status-label" style={{ color: 'var(--amber)' }}><div className="ring-dot" />Incoming Call</div>
              <div className="call-caller-name">{caller?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{caller?.num} · UCC: {caller?.ucc}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Preferred agent: <strong>You</strong> · via SIP-1</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-success" onClick={answer}><Phone size={14} /> Answer</button>
              <button className="btn btn-danger" onClick={reject}><PhoneOff size={14} /> Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE CALL ── */}
      {callPhase === 'active' && (
        <div className="call-banner call-active">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(26,110,60,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
              <Phone size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="call-status-label" style={{ color: 'var(--green)' }}><div className="live-dot" />Active Call</div>
              <div className="call-caller-name">{caller?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{caller?.num}</div>
            </div>
            <div className="call-timer">{timerStr}</div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
            Calling from: <strong>{MY_NUMBERS[activeNum].num}</strong> · Switch:
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {MY_NUMBERS.map((n, i) => (
              <button key={i} className={`num-chip${activeNum === i ? ' active' : ''}`} onClick={() => { setActiveNum(i); toast(`Switched to ${n.num}`); }}>
                {n.num} <span style={{ fontSize: 9, color: activeNum === i ? 'var(--gold)' : 'var(--muted)' }}>{n.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={() => setMuted(m => !m)} style={muted ? { background: 'var(--amber)', color: '#fff', border: 'none' } : {}}>
              {muted ? <MicOff size={13} /> : <Mic size={13} />} {muted ? 'Unmute' : 'Mute'}
            </button>
            <button className="btn btn-sm"><Pause size={13} /> Hold</button>
            <button className="btn btn-sm"><ArrowLeftRight size={13} /> Transfer</button>
            <button className="btn btn-sm"><FileText size={13} /> Note</button>
            <button className="btn btn-danger btn-sm" onClick={endCall}><PhoneOff size={13} /> End Call</button>
          </div>
        </div>
      )}

      {/* ── STATS ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card"><div className="stat-label">Calls Today</div><div className="stat-value">{calls.length}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Duration</div><div className="stat-value gold">4:12</div></div>
        <div className="stat-card"><div className="stat-label">Missed</div><div className="stat-value red">{calls.filter(c => c.status === 'Missed').length}</div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header"><PhoneIncoming size={14} style={{ color: 'var(--gold-2)' }} /><span className="card-title">Recent Calls</span></div>
          {calls.length === 0 && <div className="empty-state"><p>No calls yet.</p></div>}
          {calls.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid var(--cream-2)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.status === 'Missed' ? 'var(--red-bg)' : c.call_type === 'Incoming' ? 'var(--green-bg)' : 'var(--amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.status === 'Missed' ? 'var(--red)' : c.call_type === 'Incoming' ? 'var(--green)' : 'var(--amber)', flexShrink: 0 }}>
                {c.status === 'Missed' ? <PhoneOff size={14} /> : c.call_type === 'Incoming' ? <PhoneIncoming size={14} /> : <PhoneOutgoing size={14} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{c.client?.name || c.customer_number}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtDate(c.start_time)}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDur(c.duration_seconds)}</span>
              {c.recording_path && <button className="btn btn-xs"><Play size={10} /></button>}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><Phone size={14} style={{ color: 'var(--gold-2)' }} /><span className="card-title">My Numbers</span></div>
          {MY_NUMBERS.map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--cream-2)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--navy)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>{n.num}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{n.label}</div>
              </div>
              <span className="pill pill-green">Active</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={simulateRing} disabled={callPhase !== 'idle'}>
          <Phone size={14} /> Simulate Incoming Call (Demo)
        </button>
      </div>
    </div>
  );
}
