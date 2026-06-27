import React, { useEffect, useState, useCallback } from 'react';
import { dealersAPI, branchesAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit2, Trash2, Upload, Download, X } from 'lucide-react';

const EMPTY_MOB = { mobile: '', label: 'Primary', priority_order: 1, hunt_rings: 3, is_active: true };
const EMPTY = { name: '', branch_id: '', email: '', sip_extension: '', priority: 1, hunt_rings: 3, failover_dealer_id: '', status: 'Active', mobiles: [{ ...EMPTY_MOB }] };

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    dealersAPI.list().then(r => setDealers(r.data)).catch(() => toast('Failed to load', 'error'));
    branchesAPI.list().then(r => setBranches(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, mobiles: [{ ...EMPTY_MOB }] }); setModal(true); };
  const openEdit = d => {
    setEditing(d);
    setForm({
      ...d,
      branch_id: d.branch_id || '',
      failover_dealer_id: d.failover_dealer_id || '',
      mobiles: d.mobiles.length > 0 ? d.mobiles : [{ ...EMPTY_MOB }]
    });
    setModal(true);
  };

  const addMobile = () => setForm(p => ({
    ...p,
    mobiles: [...p.mobiles, { ...EMPTY_MOB, label: 'Secondary', priority_order: p.mobiles.length + 1 }]
  }));
  const removeMobile = i => setForm(p => ({ ...p, mobiles: p.mobiles.filter((_, idx) => idx !== i) }));
  const updateMobile = (i, k, v) => setForm(p => ({
    ...p, mobiles: p.mobiles.map((m, idx) => idx === i ? { ...m, [k]: v } : m)
  }));

  const save = async () => {
    if (!form.name || !form.branch_id) { toast('Name and branch are required', 'error'); return; }
    if (form.mobiles.length === 0 || !form.mobiles[0].mobile) { toast('At least one mobile number required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, branch_id: parseInt(form.branch_id), failover_dealer_id: form.failover_dealer_id ? parseInt(form.failover_dealer_id) : null };
      editing ? await dealersAPI.update(editing.id, payload) : await dealersAPI.create(payload);
      toast(`Agent "${form.name}" ${editing ? 'updated' : 'created'}`);
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.detail || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const del = async d => {
    try { await dealersAPI.delete(d.id); toast(`Agent "${d.name}" deleted`); load(); }
    catch { toast('Delete failed', 'error'); }
  };

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const filtered = dealers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter ? String(d.branch_id) === branchFilter : true;
    return matchSearch && matchBranch;
  });

  return (
    <div>
      <div className="btn-group">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Agent</button>
        <button className="btn"><Upload size={14} /> Import Excel</button>
        <button className="btn"><Download size={14} /> Export Excel</button>
      </div>

      <div className="card">
        <div className="search-row">
          <input className="search-input" placeholder="Search agent name…" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Agent</th><th>Branch</th><th>Mobiles</th><th>SIP Ext</th><th>Priority</th><th>Hunt Rings</th><th>Failover</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No agents found.</td></tr>}
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                    </div>
                  </td>
                  <td>{d.branch?.name || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {d.mobiles.slice(0, 2).map(m => m.mobile).join(', ')}{d.mobiles.length > 2 ? ` +${d.mobiles.length - 2}` : ''}
                  </td>
                  <td><span className="tag">{d.sip_extension || '—'}</span></td>
                  <td><span className="pill pill-navy">#{d.priority}</span></td>
                  <td style={{ textAlign: 'center' }}>{d.hunt_rings}</td>
                  <td style={{ fontSize: 11, color: 'var(--muted)' }}>{d.failover?.name || '—'}</td>
                  <td><span className={`pill ${d.status === 'Active' ? 'pill-green' : 'pill-gray'}`}>{d.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-xs" onClick={() => openEdit(d)}><Edit2 size={11} /></button>
                      <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => setConfirm(d)}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Agent' : 'Add Agent'} maxWidth={640}>
        <div className="form-grid">
          <div className="field"><label>Full Name *</label><input placeholder="Rahul Sharma" {...F('name')} /></div>
          <div className="field"><label>Branch *</label>
            <select {...F('branch_id')}>
              <option value="">— Select Branch —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Email</label><input type="email" placeholder="rahul@auro.in" {...F('email')} /></div>
          <div className="field"><label>SIP Extension</label><input placeholder="101" {...F('sip_extension')} /></div>
          <div className="field"><label>Priority in Branch</label><input type="number" min="1" {...F('priority')} /></div>
          <div className="field"><label>Default Hunt Rings</label><input type="number" min="1" max="10" {...F('hunt_rings')} /></div>
          <div className="field"><label>Failover Agent</label>
            <select {...F('failover_dealer_id')}>
              <option value="">— None —</option>
              {dealers.filter(d => !editing || d.id !== editing.id).map(d => <option key={d.id} value={d.id}>{d.name} ({d.branch?.name})</option>)}
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select {...F('status')}><option>Active</option><option>Inactive</option></select>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mobile Numbers</span>
            <button className="btn btn-xs btn-primary" onClick={addMobile}><Plus size={11} /> Add Number</button>
          </div>
          {form.mobiles.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 60px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input placeholder="Mobile number" value={m.mobile} onChange={e => updateMobile(i, 'mobile', e.target.value)} style={{ padding: '7px 10px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: 12, background: 'var(--cream)', fontFamily: 'var(--font-sans)' }} />
              <select value={m.label} onChange={e => updateMobile(i, 'label', e.target.value)} style={{ padding: '7px 8px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: 12, background: 'var(--cream)' }}>
                <option>Primary</option><option>Secondary</option><option>Backup</option><option>Office</option>
              </select>
              <input type="number" value={m.hunt_rings} min="1" max="10" title="Hunt rings" onChange={e => updateMobile(i, 'hunt_rings', parseInt(e.target.value))} style={{ padding: '7px 8px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: 12, textAlign: 'center', background: 'var(--cream)' }} />
              <select value={m.is_active ? 'Active' : 'Inactive'} onChange={e => updateMobile(i, 'is_active', e.target.value === 'Active')} style={{ padding: '7px 6px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: 11, background: 'var(--cream)' }}>
                <option>Active</option><option>Inactive</option>
              </select>
              {form.mobiles.length > 1 && <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => removeMobile(i)}><X size={11} /></button>}
            </div>
          ))}
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Hunt rings = how many times this number rings before moving to next</div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Agent' : 'Create Agent'}</button>
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)}
        title="Delete Agent" message={`Delete agent "${confirm?.name}"? All associated data will remain.`} />
    </div>
  );
}
