import React, { useEffect, useState, useCallback } from 'react';
import { branchesAPI, sipAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const EMPTY = { name: '', location: '', sip_line_id: '', status: 'Active' };

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [sips, setSips] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    branchesAPI.list().then(r => setBranches(r.data)).catch(() => toast('Failed to load', 'error'));
    sipAPI.list().then(r => setSips(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = b => { setEditing(b); setForm({ ...b, sip_line_id: b.sip_line_id || '' }); setModal(true); };

  const save = async () => {
    if (!form.name) { toast('Branch name required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, sip_line_id: form.sip_line_id || null };
      editing ? await branchesAPI.update(editing.id, payload) : await branchesAPI.create(payload);
      toast(`Branch "${form.name}" ${editing ? 'updated' : 'created'}`);
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.detail || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const del = async b => {
    try { await branchesAPI.delete(b.id); toast(`Branch "${b.name}" deleted`); load(); }
    catch { toast('Delete failed', 'error'); }
  };

  const F = k => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div>
      <div className="btn-group">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Branch</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Branch Name</th><th>Location</th><th>SIP Line</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {branches.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No branches yet.</td></tr>}
              {branches.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{b.location || '—'}</td>
                  <td><span className="tag">{b.sip_line?.label || '—'}</span></td>
                  <td><span className={`pill ${b.status === 'Active' ? 'pill-green' : 'pill-gray'}`}>{b.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-xs" onClick={() => openEdit(b)}><Edit2 size={11} /></button>
                      <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => setConfirm(b)}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Branch' : 'Add Branch'}>
        <div className="form-grid">
          <div className="field"><label>Branch Name *</label><input placeholder="Kolkata HQ" {...F('name')} /></div>
          <div className="field"><label>Location / City</label><input placeholder="Kolkata, West Bengal" {...F('location')} /></div>
          <div className="field"><label>SIP Line</label>
            <select {...F('sip_line_id')}>
              <option value="">— None —</option>
              {sips.map(s => <option key={s.id} value={s.id}>{s.label} ({s.number})</option>)}
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select {...F('status')}><option>Active</option><option>Inactive</option></select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create Branch'}</button>
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)}
        title="Delete Branch" message={`Delete branch "${confirm?.name}"?`} />
    </div>
  );
}
