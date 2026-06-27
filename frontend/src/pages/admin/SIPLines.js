// SIPLines.js
import React, { useEffect, useState, useCallback } from 'react';
import { sipAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
const EMPTY = { label: '', number: '', status: 'Active' };
export default function SIPLines() {
  const [sips, setSips] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => { sipAPI.list().then(r => setSips(r.data)).catch(() => toast('Failed', 'error')); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = s => { setEditing(s); setForm(s); setModal(true); };
  const save = async () => {
    if (!form.label || !form.number) { toast('Label and number required', 'error'); return; }
    setSaving(true);
    try { editing ? await sipAPI.update(editing.id, form) : await sipAPI.create(form); toast(`SIP line "${form.label}" ${editing ? 'updated' : 'created'}`); setModal(false); load(); }
    catch (e) { toast(e.response?.data?.detail || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };
  const del = async s => { try { await sipAPI.delete(s.id); toast('Deleted'); load(); } catch { toast('Delete failed', 'error'); } };
  const F = k => ({ value: form[k] ?? '', onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });
  return (
    <div>
      <div className="btn-group"><button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add SIP Line</button></div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Label</th><th>Number</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {sips.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No SIP lines yet.</td></tr>}
              {sips.map(s => (
                <tr key={s.id}>
                  <td><span className="tag">{s.label}</span></td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{s.number}</td>
                  <td><span className={`pill ${s.status === 'Active' ? 'pill-green' : 'pill-gray'}`}>{s.status}</span></td>
                  <td><div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-xs" onClick={() => openEdit(s)}><Edit2 size={11} /></button>
                    <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => setConfirm(s)}><Trash2 size={11} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit SIP Line' : 'Add SIP Line'} maxWidth={420}>
        <div className="form-grid">
          <div className="field"><label>Label *</label><input placeholder="SIP-1" {...F('label')} /></div>
          <div className="field"><label>Phone Number *</label><input placeholder="+91 33 4000 1000" {...F('number')} /></div>
          <div className="field"><label>Status</label><select {...F('status')}><option>Active</option><option>Inactive</option></select></div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)} title="Delete SIP Line" message={`Delete "${confirm?.label}"?`} />
    </div>
  );
}
