import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Shield, ScrollText, Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';

const ROLES = [
  { role: 'User', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', desc: 'Can create material requests and view inventory data.', perms: ['View Master Data', 'Create Requests', 'View Own Approval History'] },
  { role: 'Supervisor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', desc: 'Level 1 approver. Reviews and approves/rejects User requests.', perms: ['All User Permissions', 'Approve/Reject Requests (Level 1)', 'View All Requests'] },
  { role: 'Manager', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', desc: 'Level 2 approver for high-value or cross-dept transactions.', perms: ['All Supervisor Permissions', 'Approve/Reject Requests (Level 2)', 'View Reports'] },
  { role: 'Dept Head', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', desc: 'Final approver. Full visibility into department activities.', perms: ['All Manager Permissions', 'Final Approval Authority', 'Export All Reports', 'View System Logs'] },
  { role: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', desc: 'Full system access. Manages users, roles, and configurations.', perms: ['Full System Access', 'User CRUD', 'Role Configuration', 'System Logs'] },
];

const ACTION_COLOR: Record<string, string> = {
  LOGIN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  APPROVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  REJECT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CREATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  EXPORT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') ?? 'users');
  
  useEffect(() => {
    setTab(searchParams.get('tab') ?? 'users');
  }, [searchParams]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'User', department: '', status: 'Active' });

  // Pagination, Search & Sort States
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersSort, setUsersSort] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const [logsPage, setLogsPage] = useState(1);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsSort, setLogsSort] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const rowsPerPage = 10;

  useEffect(() => {
    fetch('http://localhost:5000/users').then(r => r.json()).then(setUsers);
    fetch('http://localhost:5000/logs').then(r => r.json()).then(setLogs);
  }, []);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? id;

  const processedUsers = useMemo(() => {
    let result = users.filter(u => {
      const searchLower = usersSearch.toLowerCase();
      return u.name.toLowerCase().includes(searchLower) ||
             u.email.toLowerCase().includes(searchLower) ||
             u.department.toLowerCase().includes(searchLower);
    });
    if (usersSort) {
      result.sort((a, b) => {
        const aVal = a[usersSort.key];
        const bVal = b[usersSort.key];
        if (aVal < bVal) return usersSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return usersSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [users, usersSearch, usersSort]);

  const paginatedUsers = processedUsers.slice((usersPage - 1) * rowsPerPage, usersPage * rowsPerPage);
  const usersTotalPages = Math.ceil(processedUsers.length / rowsPerPage);

  const processedLogs = useMemo(() => {
    let result = [...logs].reverse().filter(log => {
      const searchLower = logsSearch.toLowerCase();
      const userName = getUserName(log.userId).toLowerCase();
      return log.action.toLowerCase().includes(searchLower) ||
             log.target.toLowerCase().includes(searchLower) ||
             log.detail.toLowerCase().includes(searchLower) ||
             userName.includes(searchLower);
    });

    if (logsSort) {
      result.sort((a, b) => {
        let aVal = a[logsSort.key];
        let bVal = b[logsSort.key];
        if (logsSort.key === 'userId') {
          aVal = getUserName(a.userId);
          bVal = getUserName(b.userId);
        }
        if (aVal < bVal) return logsSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return logsSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [logs, logsSearch, logsSort, users]);

  const paginatedLogs = processedLogs.slice((logsPage - 1) * rowsPerPage, logsPage * rowsPerPage);
  const logsTotalPages = Math.ceil(processedLogs.length / rowsPerPage);

  const requestUsersSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (usersSort && usersSort.key === key && usersSort.direction === 'asc') direction = 'desc';
    setUsersSort({ key, direction });
  };

  const requestLogsSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (logsSort && logsSort.key === key && logsSort.direction === 'asc') direction = 'desc';
    setLogsSort({ key, direction });
  };

  const openAdd = () => { setEditUser(null); setForm({ name: '', email: '', role: 'User', department: '', status: 'Active' }); setShowForm(true); };
  const openEdit = (u: any) => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status }); setShowForm(true); };

  const handleSave = async () => {
    if (editUser) {
      await fetch(`http://localhost:5000/users/${editUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      const newUser = { ...form, id: Date.now().toString(), password: 'password123' };
      await fetch('http://localhost:5000/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    }
    fetch('http://localhost:5000/users').then(r => r.json()).then(setUsers);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`http://localhost:5000/users/${id}`, { method: 'DELETE' });
    setUsers(u => u.filter(x => x.id !== id));
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: <Users size={16} /> },
    { id: 'roles', label: 'Role & Permission', icon: <Shield size={16} /> },
    { id: 'logs', label: 'System Logs', icon: <ScrollText size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1 flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* User Management Tab */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">User Management</h3>
              <p className="text-sm text-gray-500 mt-0.5">{users.length} users registered</p>
            </div>
            <div className="flex w-full md:w-auto gap-3 items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search users..." value={usersSearch} onChange={e => {setUsersSearch(e.target.value); setUsersPage(1);}}
                  className="pl-9 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <button onClick={openAdd} className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={16} />Add User
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th onClick={() => requestUsersSort('name')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Name {usersSort?.key === 'name' ? (usersSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestUsersSort('email')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Email {usersSort?.key === 'email' ? (usersSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestUsersSort('role')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Role {usersSort?.key === 'role' ? (usersSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestUsersSort('department')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Department {usersSort?.key === 'department' ? (usersSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestUsersSort('status')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Status {usersSort?.key === 'status' ? (usersSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">{u.name.charAt(0)}</div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ROLES.find(r => r.role === u.role)?.color}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>{u.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {processedUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{(usersPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(usersPage * rowsPerPage, processedUsers.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{processedUsers.length}</span> items
              </div>
              <div className="flex gap-2">
                <button disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Prev</button>
                <button disabled={usersPage === usersTotalPages} onClick={() => setUsersPage(p => p + 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role & Permission Tab */}
      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map(r => (
            <div key={r.role} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${r.color}`}>{r.role}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{r.desc}</p>
              <ul className="space-y-2">
                {r.perms.map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check size={14} className="text-green-500 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* System Logs Tab */}
      {tab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">System Activity Logs</h3>
              <p className="text-sm text-gray-500 mt-0.5">All user actions and system events</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search logs..." value={logsSearch} onChange={e => {setLogsSearch(e.target.value); setLogsPage(1);}}
                className="pl-9 pr-4 py-2 w-full md:w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th onClick={() => requestLogsSort('timestamp')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Timestamp {logsSort?.key === 'timestamp' ? (logsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestLogsSort('userId')} className="px-6 py-3 cursor-pointer hover:text-blue-600">User {logsSort?.key === 'userId' ? (logsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestLogsSort('action')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Action {logsSort?.key === 'action' ? (logsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestLogsSort('target')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Target {logsSort?.key === 'target' ? (logsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestLogsSort('detail')} className="px-6 py-3 cursor-pointer hover:text-blue-600">Detail {logsSort?.key === 'detail' ? (logsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white">{getUserName(log.userId)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${ACTION_COLOR[log.action] ?? 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">{log.target}</td>
                    <td className="px-6 py-3.5 text-gray-500 max-w-xs truncate">{log.detail}</td>
                  </tr>
                ))}
                {paginatedLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">No activity logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {processedLogs.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{(logsPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(logsPage * rowsPerPage, processedLogs.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{processedLogs.length}</span> items
              </div>
              <div className="flex gap-2">
                <button disabled={logsPage === 1} onClick={() => setLogsPage(p => p - 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Prev</button>
                <button disabled={logsPage === logsTotalPages} onClick={() => setLogsPage(p => p + 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {(['name', 'email', 'department'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field}</label>
                  <input type="text" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  {ROLES.map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Save User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
