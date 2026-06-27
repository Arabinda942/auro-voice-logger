import React, { useEffect, useState, useCallback } from 'react';
import { clientsAPI, branchesAPI, dealersAPI, sipAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit2, Trash2, Upload, Download } from 'lucide-react';

const EMPTY = { name: '', mobile: '', ucc_code: '', email: '', preferred_dealer_id: '', sip_line_id: '', branch_id: '', status: 'Active' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [sips, setSips] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    clientsAPI.list().then(r => setClients(r.data)).catch(() => toast('Failed to load', 'error'));
    branchesAPI.list().then(r => setBranches(r.data)).catch(() => {});
    dealersAPI.list().then(r => setDealers(r.data)).catch(() => {});
    sipAPI.list().then(r => setSips(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = c => { setEditing(c); setForm({ ...c, preferred_dealer_id: c.preferred_dealer_id || '', sip_line_id: c.sip_line_id || '', branch_id: c.branch_id || '' }); setModal(true); };

  const save = async () => {
    if (!form.name || !form.mobile) { toast('Name and mobile are required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        preferred_dealer_id: form.preferred_dealer_id ? parseInt(form.preferred_dealer_id) : null,
        sip_line_id: form.sip_line_id ? parseInt(form.sip_line_id) : null,
        branch_id: form.branch_id ? parseInt(form.branch_id) : null,
      };
      editing ? await clientsAPI.update(editing.id, payload) : await clientsAPI.create(payload);
      toast(`Client "${form.name}" ${editing ? 'updated' : 'created'}`);
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.detail || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const del = async c => {
    try { await clientsAPI.delete(c.id); toast(`Client "${c.name}" deleted`); load(); }
    catch { toast('Delete failed', 'error'); }
  };

  const F = k => ({ value: form[k] ?? '', onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search) ||
    (c.ucc_code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="btn-group">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Client</button>
        <button className="btn"><Upload size={14} /> Import Excel</button>
        <button className="btn"><Download size={14} /> Export Excel</button>
      </div>
      <div className="card">
        <div className="search-row">
          <input className="search-input" placeholder="Search name / mobile / UCC…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Client Name</th><th>Mobile</th><th>UCC Code</th><th>Email</th><th>Preferred Agent</th><th>SIP Line</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No clients found.</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.mobile}</td>
                  <td><span className="tag">{c.ucc_code || '—'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--muted)' }}>{c.email || '—'}</td>
                  <td>{c.preferred_dealer?.name || '—'}</td>
                  <td><span className="tag">{c.sip_line?.label || '—'}</span></td>
                  <td><span className={`pill ${c.status === 'Active' ? 'pill-green' : 'pill-gray'}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-xs" onClick={() => openEdit(c)}><Edit2 size={11} /></button>
                      <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => setConfirm(c)}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <div className="form-grid">
          <div className="field"><label>Client Name *</label><input placeholder="Vikas Sharma" {...F('name')} /></div>
          <div className="field"><label>Mobile Number *</label><input placeholder="+91 98765 43210" {...F('mobile')} /></div>
          <div className="field"><label>UCC Code</label><input placeholder="UCC001" {...F('ucc_code')} /></div>
          <div className="field"><label>Email</label><input type="email" placeholder="client@email.com" {...F('email')} /></div>
          <div className="field"><label>Preferred Agent</label>
            <select {...F('preferred_dealer_id')}>
              <option value="">— None —</option>
              {dealers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.branch?.name})</option>)}
            </select>
          </div>
          <div className="field"><label>SIP Line</label>
            <select {...F('sip_line_id')}>
              <option value="">— None —</option>
              {sips.map(s => <option key={s.id} value={s.id}>{s.label} ({s.number})</option>)}
            </select>
          </div>
          <div className="field"><label>Branch</label>
            <select {...F('branch_id')}>
              <option value="">— None —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select {...F('status')}><option>Active</option><option>Inactive</option></select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Client' : 'Create Client'}</button>
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)}
        title="Delete Client" message={`Delete client "${confirm?.name}"?`} />
    </div>
  );
}
