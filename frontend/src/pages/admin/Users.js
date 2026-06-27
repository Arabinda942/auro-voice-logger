import React, { useEffect, useState, useCallback } from 'react';
import { usersAPI, branchesAPI } from '../../utils/api';
import { toast } from '../../components/Toast';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';

const ROLES = ['Agent', 'Branch Admin', 'Super Admin'];
const EMPTY = { name: '', login_id: '', password: '', role: 'Agent', branch_id: '', sip_extension: '', email: '', mobile: '', status: 'Active' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    usersAPI.list().then(r => setUsers(r.data)).catch(() => toast('Failed to load users', 'error'));
    branchesAPI.list().then(r => setBranches(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ ...u, password: '' }); setModal(true); };

  const save = async () => {
    if (!form.name || !form.login_id) { toast('Name and Login ID are required', 'error'); return; }
    if (!editing && !form.password) { toast('Password is required for new user', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, branch_id: form.branch_id || null };
      if (editing) {
        if (!payload.password) delete payload.password;
        await usersAPI.update(editing.id, payload);
        toast(`User "${form.name}" updated`);
      } else {
        await usersAPI.create(payload);
        toast(`User "${form.name}" created`);
      }
      setModal(false);
      load();
    } catch (e) {
      toast(e.response?.data?.detail || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const del = async (u) => {
    try {
      await usersAPI.delete(u.id);
      toast(`User "${u.name}" deleted`);
      load();
    } catch { toast('Delete failed', 'error'); }
  };

  const F = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.login_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="btn-group">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add User</button>
        <button className="btn"><Download size={14} /> Export</button>
      </div>

      <div className="card">
        <div className="search-row">
          <input className="search-input" placeholder="Search name or login ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Login ID</th><th>Role</th><th>Branch</th>
                <th>SIP Ext</th><th>Mobile</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No users found.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td><span className="tag">{u.login_id}</span></td>
                  <td><span className={`pill ${u.role === 'Super Admin' ? 'pill-navy' : u.role === 'Branch Admin' ? 'pill-amber' : 'pill-green'}`}>{u.role}</span></td>
                  <td>{u.branch?.name || '—'}</td>
                  <td><span className="tag">{u.sip_extension || '—'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--muted)' }}>{u.mobile || '—'}</td>
                  <td><span className={`pill ${u.status === 'Active' ? 'pill-green' : 'pill-gray'}`}>{u.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-xs" onClick={() => openEdit(u)}><Edit2 size={11} /></button>
                      <button className="btn btn-xs" style={{ color: 'var(--red)' }} onClick={() => setConfirm(u)}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit User' : 'Add New User'}>
        <div className="form-grid">
          <div className="field"><label>Full Name *</label><input placeholder="Rahul Sharma" {...F('name')} /></div>
          <div className="field"><label>Login ID *</label><input placeholder="rahul.sharma" {...F('login_id')} disabled={!!editing} /></div>
          <div className="field"><label>{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" placeholder="Set password" {...F('password')} /></div>
          <div className="field"><label>Role</label>
            <select {...F('role')}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field"><label>Branch</label>
            <select {...F('branch_id')}>
              <option value="">— None —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field"><label>SIP Extension</label><input placeholder="101" {...F('sip_extension')} /></div>
          <div className="field"><label>Email</label><input type="email" placeholder="user@auro.in" {...F('email')} /></div>
          <div className="field"><label>Mobile</label><input placeholder="+91 98765 43210" {...F('mobile')} /></div>
          <div className="field"><label>Status</label>
            <select {...F('status')}><option>Active</option><option>Inactive</option></select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update User' : 'Create User'}</button>
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => del(confirm)}
        title="Delete User"
        message={`Delete user "${confirm?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
