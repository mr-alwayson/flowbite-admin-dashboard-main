import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, FileText, ChevronRight, Search } from 'lucide-react';

const APPROVAL_LEVELS = ['User', 'Supervisor', 'Manager', 'Dept Head'];

function getTimelineStep(status: string) {
  if (status === 'Pending') return 2; // Supervisor is active
  if (status === 'Approved_Supervisor') return 3; // Manager is active
  if (status === 'Approved_Manager') return 4; // Dept Head is active
  if (status === 'Approved_DeptHead') return 5; // Finished
  if (status === 'Rejected') return -1;
  return 1; // User/Submission step
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Pending': return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">Awaiting Supervisor</span>;
    case 'Approved_Supervisor': return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-400">Awaiting Manager</span>;
    case 'Approved_Manager': return <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/30 dark:text-purple-400">Awaiting Dept Head</span>;
    case 'Approved_DeptHead': return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-400">Fully Approved</span>;
    case 'Rejected': return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full dark:bg-red-900/30 dark:text-red-400">Rejected</span>;
    default: return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
  }
}

export default function ApprovalInbox() {
  const [requests, setRequests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') ?? 'inbox');

  useEffect(() => {
    setTab(searchParams.get('tab') ?? 'inbox');
  }, [searchParams]);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [comment, setComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Pagination, Search & Sort States
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingSort, setPendingSort] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const rowsPerPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [reqRes, matRes, userRes] = await Promise.all([
      fetch('http://localhost:5000/requests'),
      fetch('http://localhost:5000/materials'),
      fetch('http://localhost:5000/users')
    ]);
    setRequests(await reqRes.json());
    setMaterials(await matRes.json());
    setUsers(await userRes.json());
  };

  const handleApprove = async (req: any) => {
    let newStatus = req.status;
    if (user?.role === 'Supervisor') newStatus = 'Approved_Supervisor';
    else if (user?.role === 'Manager') newStatus = 'Approved_Manager';
    else if (user?.role === 'Dept Head') newStatus = 'Approved_DeptHead';
    
    await fetch(`http://localhost:5000/requests/${req.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, comment: comment || 'Approved.' })
    });
    setSelectedReq(null); setComment('');
    fetchData();
  };

  const handleReject = async (req: any) => {
    if (!rejectComment.trim()) return alert('Rejection comment is required.');
    await fetch(`http://localhost:5000/requests/${req.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected', comment: rejectComment })
    });
    setSelectedReq(null); setRejectComment(''); setShowRejectForm(false);
    fetchData();
  };

  const getMat = (id: string) => materials.find(m => m.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);

  const getPendingForRole = () => requests.filter(req => {
    if (user?.role === 'Supervisor' && req.status === 'Pending') return true;
    if (user?.role === 'Manager' && req.status === 'Approved_Supervisor') return true;
    if (user?.role === 'Dept Head' && req.status === 'Approved_Manager') return true;
    return false;
  });

  const getHistory = () => {
    return requests.filter(req => user?.role === 'User' ? req.userId === user.id : true);
  };

  const pendingList = getPendingForRole();
  const historyListRaw = getHistory();

  // Process Pending List
  const processedPending = useMemo(() => {
    let result = pendingList.filter(req => {
      const mat = getMat(req.materialId);
      const reqUser = getUser(req.userId);
      const searchLower = pendingSearch.toLowerCase();
      return (
        req.id.toLowerCase().includes(searchLower) ||
        (mat?.description || '').toLowerCase().includes(searchLower) ||
        (reqUser?.name || '').toLowerCase().includes(searchLower)
      );
    });

    if (pendingSort) {
      result.sort((a, b) => {
        let aVal = a[pendingSort.key];
        let bVal = b[pendingSort.key];
        if (pendingSort.key === 'materialId') {
          aVal = getMat(a.materialId)?.description || '';
          bVal = getMat(b.materialId)?.description || '';
        } else if (pendingSort.key === 'userId') {
          aVal = getUser(a.userId)?.name || '';
          bVal = getUser(b.userId)?.name || '';
        }
        if (aVal < bVal) return pendingSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return pendingSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [pendingList, pendingSearch, pendingSort, materials, users]);

  const paginatedPending = processedPending.slice((pendingPage - 1) * rowsPerPage, pendingPage * rowsPerPage);
  const pendingTotalPages = Math.ceil(processedPending.length / rowsPerPage);

  // Process History List
  const processedHistory = useMemo(() => {
    let result = historyListRaw.filter(req => {
      const mat = getMat(req.materialId);
      const reqUser = getUser(req.userId);
      const searchLower = historySearch.toLowerCase();
      return (
        req.id.toLowerCase().includes(searchLower) ||
        (mat?.description || '').toLowerCase().includes(searchLower) ||
        (reqUser?.name || '').toLowerCase().includes(searchLower)
      );
    });

    if (historySort) {
      result.sort((a, b) => {
        let aVal = a[historySort.key];
        let bVal = b[historySort.key];
        if (historySort.key === 'materialId') {
          aVal = getMat(a.materialId)?.description || '';
          bVal = getMat(b.materialId)?.description || '';
        } else if (historySort.key === 'userId') {
          aVal = getUser(a.userId)?.name || '';
          bVal = getUser(b.userId)?.name || '';
        }
        if (aVal < bVal) return historySort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return historySort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }
    return result;
  }, [historyListRaw, historySearch, historySort, materials, users]);

  const paginatedHistory = processedHistory.slice((historyPage - 1) * rowsPerPage, historyPage * rowsPerPage);
  const historyTotalPages = Math.ceil(processedHistory.length / rowsPerPage);

  const requestPendingSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (pendingSort && pendingSort.key === key && pendingSort.direction === 'asc') direction = 'desc';
    setPendingSort({ key, direction });
  };

  const requestHistorySort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (historySort && historySort.key === key && historySort.direction === 'asc') direction = 'desc';
    setHistorySort({ key, direction });
  };

  const tabs = [
    { id: 'inbox', label: `Action Required (${pendingList.length})`, icon: <Clock size={15} /> },
    { id: 'history', label: 'Approval History', icon: <FileText size={15} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Tab Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1 flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Action Required Tab */}
      {tab === 'inbox' && user?.role !== 'User' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Pending Approvals</h2>
              <p className="text-sm text-gray-500 mt-0.5">Click a row to review details and approve/reject</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search requests..." value={pendingSearch} onChange={e => {setPendingSearch(e.target.value); setPendingPage(1);}}
                className="pl-9 pr-4 py-2 w-full md:w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th onClick={() => requestPendingSort('id')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Request ID {pendingSort?.key === 'id' ? (pendingSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPendingSort('userId')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Requester {pendingSort?.key === 'userId' ? (pendingSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPendingSort('materialId')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Material {pendingSort?.key === 'materialId' ? (pendingSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPendingSort('qty')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Qty {pendingSort?.key === 'qty' ? (pendingSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPendingSort('requestedAt')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Date {pendingSort?.key === 'requestedAt' ? (pendingSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPendingSort('status')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Status {pendingSort?.key === 'status' ? (pendingSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedPending.map(req => {
                  const mat = getMat(req.materialId);
                  const reqUser = getUser(req.userId);
                  return (
                    <tr key={req.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => { setSelectedReq(req); setShowRejectForm(false); setComment(''); setRejectComment(''); }}>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">{req.id}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{reqUser?.name}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-medium text-gray-900 dark:text-white">{mat?.materialNo}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{mat?.description}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-400">{req.qty} <span className="text-xs font-normal text-gray-400">{mat?.uom}</span></td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">{getStatusBadge(req.status)}</td>
                      <td className="px-5 py-3.5 text-gray-400"><ChevronRight size={16} /></td>
                    </tr>
                  );
                })}
                {paginatedPending.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No pending requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {processedPending.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{(pendingPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(pendingPage * rowsPerPage, processedPending.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{processedPending.length}</span> items
              </div>
              <div className="flex gap-2">
                <button disabled={pendingPage === 1} onClick={() => setPendingPage(p => p - 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Prev</button>
                <button disabled={pendingPage === pendingTotalPages} onClick={() => setPendingPage(p => p + 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'inbox' && user?.role === 'User' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 text-sm">As a User, you do not have approval privileges. Switch to the <strong>Approval History</strong> tab to track your requests.</p>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Approval Audit Trail</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search history..." value={historySearch} onChange={e => {setHistorySearch(e.target.value); setHistoryPage(1);}}
                className="pl-9 pr-4 py-2 w-full md:w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th onClick={() => requestHistorySort('id')} className="px-5 py-3 cursor-pointer hover:text-blue-600">ID {historySort?.key === 'id' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestHistorySort('requestedAt')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Date {historySort?.key === 'requestedAt' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestHistorySort('userId')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Requester {historySort?.key === 'userId' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestHistorySort('materialId')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Material {historySort?.key === 'materialId' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestHistorySort('qty')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Qty {historySort?.key === 'qty' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestHistorySort('status')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Status {historySort?.key === 'status' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="px-5 py-3">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedHistory.map(req => {
                  const mat = getMat(req.materialId);
                  const reqUser = getUser(req.userId);
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{req.id}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(req.requestedAt).toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{reqUser?.name}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{mat?.materialNo}</td>
                      <td className="px-5 py-3.5">{req.qty}</td>
                      <td className="px-5 py-3.5">{getStatusBadge(req.status)}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 italic max-w-[200px] truncate">{req.comment || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {processedHistory.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{(historyPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(historyPage * rowsPerPage, processedHistory.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{processedHistory.length}</span> items
              </div>
              <div className="flex gap-2">
                <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Prev</button>
                <button disabled={historyPage === historyTotalPages} onClick={() => setHistoryPage(p => p + 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Side Panel */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedReq(null)}></div>
          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <div className="w-screen max-w-lg">
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-gray-700">
                <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between">
                  <h2 className="font-bold text-white">Request Detail — {selectedReq.id}</h2>
                  <button onClick={() => setSelectedReq(null)} className="text-blue-100 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition-colors"><X size={18} /></button>
                </div>

                <div className="p-5 flex-1 space-y-5">
                  {/* Material Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Material</p>
                    <p className="font-bold text-gray-900 dark:text-white">{getMat(selectedReq.materialId)?.description}</p>
                    <p className="font-mono text-sm text-gray-500">{getMat(selectedReq.materialId)?.materialNo}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      <span>Type: <strong className="text-indigo-600 uppercase">{selectedReq.type || 'Request'}</strong></span>
                      <span className="text-gray-400">|</span>
                      <span>Qty: <strong className="text-blue-600">{selectedReq.qty} {getMat(selectedReq.materialId)?.uom}</strong></span>
                      <span className="text-gray-400">|</span>
                      <span>Plant: <strong>{getMat(selectedReq.materialId)?.plant}</strong></span>
                    </div>
                  </div>

                  {/* Requester */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Requester</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {getUser(selectedReq.userId)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{getUser(selectedReq.userId)?.name}</p>
                        <p className="text-xs text-gray-400">{getUser(selectedReq.userId)?.department} · {new Date(selectedReq.requestedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm text-gray-600 dark:text-gray-300 italic">"{selectedReq.justification}"</div>
                  </div>

                  {/* Approval Timeline */}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Approval Timeline</p>
                    <div className="flex items-center gap-1">
                      {APPROVAL_LEVELS.map((level, i) => {
                        const step = getTimelineStep(selectedReq.status);
                        const done = step > i + 1 || step === 5;
                        const active = step === i + 1;
                        const rejected = step === -1;
                        return (
                          <div key={level} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                                ${rejected && active ? 'bg-red-500 border-red-500 text-white' :
                                  done ? 'bg-green-500 border-green-500 text-white' :
                                  active ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                                  'bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-700 dark:border-gray-600'}`}>
                                {done ? <Check size={14} /> : i + 1}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 text-center leading-tight">{level}</p>
                            </div>
                            {i < APPROVAL_LEVELS.length - 1 && (
                              <div className={`h-0.5 flex-1 -mt-5 ${done ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Approve/Reject Actions */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Comment (optional for approval)</label>
                      <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..."
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleApprove(selectedReq)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <Check size={16} />Approve
                      </button>
                      <button onClick={() => setShowRejectForm(!showRejectForm)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                        <X size={16} />Reject
                      </button>
                    </div>
                    {showRejectForm && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-2">
                        <label className="block text-xs font-medium text-red-700 dark:text-red-400">Rejection Reason *</label>
                        <textarea rows={2} value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder="Reason for rejection is required..."
                          className="w-full p-2 text-sm border border-red-200 dark:border-red-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        <button onClick={() => handleReject(selectedReq)}
                          className="w-full py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium transition-colors">
                          Confirm Rejection
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
