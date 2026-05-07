import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { UserPlus, Shield, Mail, Calendar, Trash2, Edit2, CheckCircle, XCircle, ToggleLeft, ToggleRight, UserCog } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'counselor' });

  const fetchUsers = () => {
    setLoading(true);
    api.get('/auth/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/auth/users/${user.userId}`, { is_active: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.patch(`/auth/users/${editingUser.userId}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/auth/register', formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'counselor' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.error || 'Operation failed'); }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Staff Management</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Manage administrative and counselor access</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }} style={{ padding: '12px 24px', borderRadius: 14 }}>
          <UserPlus size={20} /> Create New User
        </button>
      </div>

      <div className="card" style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid var(--primary-50)' }}>
        {loading ? <div className="page-loader"><span className="spinner spinner-dark" /></div> : (
          <div className="table-container">
            <table>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: '20px 24px' }}>USER</th>
                  <th>ROLE</th>
                  <th>ACCOUNT STATUS</th>
                  <th>CREATED ON</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId} style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{u.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-dropped' : 'badge-enrolled'}`} style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.isActive ? <CheckCircle size={14} color="var(--success)" /> : <XCircle size={14} color="var(--danger)" />}
                        <span style={{ fontSize: 13, fontWeight: 600, color: u.isActive ? 'var(--success)' : 'var(--danger)' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> {new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button className="btn btn-icon btn-secondary" onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <ToggleRight size={20} color="var(--success)" /> : <ToggleLeft size={20} color="var(--gray-400)" />}
                        </button>
                        <button className="btn btn-icon btn-secondary" onClick={() => openEditModal(u)} title="Edit User">
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                <UserCog size={22} color="var(--primary)" /> {editingUser ? 'Edit Staff Member' : 'Create Staff Member'}
              </h2>
              <button className="btn btn-icon btn-secondary" style={{ borderRadius: '50%', width: 32, height: 32 }} onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '32px' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Full Name</label>
                  <input className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" style={{ height: 48 }} />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Email Address</label>
                  <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@nunukkam.com" style={{ height: 48 }} />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>{editingUser ? 'New Password (Leave blank to keep same)' : 'Security Password'}</label>
                  <input className="form-input" type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" style={{ height: 48 }} />
                </div>
                <div className="form-group" style={{ marginBottom: 32 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Access Role</label>
                  <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ height: 48 }}>
                    <option value="counselor">Counselor (Standard Access)</option>
                    <option value="admin">Administrator (Full Control)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, height: 48, borderRadius: 12 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1.5, height: 48, borderRadius: 12, fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>{editingUser ? 'Update Profile' : 'Register Staff'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
