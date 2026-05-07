import { useState, useEffect, useMemo } from 'react';
import { mockApi } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, Send, Zap, ClipboardList, PackageSearch } from 'lucide-react';

export default function MRP() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [plannedOrders, setPlannedOrders] = useState<any[]>([]);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') ?? 'safety');

  const [showForm, setShowForm] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState('');
  const [reqQty, setReqQty] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Sorting States
  const [plannedPage, setPlannedPage] = useState(1);
  const [plannedSort, setPlannedSort] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [safetyPage, setSafetyPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') ?? 'safety';
    setTab(tabFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mats, orders] = await Promise.all([
        mockApi.getMaterials(),
        mockApi.getPlannedOrders()
      ]);
      setMaterials(mats);
      setPlannedOrders(orders);
    } catch (err) {
      setMaterials([]);
      setPlannedOrders([]);
    }
  };

  const criticalMaterials = materials.filter(m => m.stock < m.minLevel);
  
  const getMaterial = (id: string) => materials.find(m => m.id === id);

  const sortedPlannedOrders = useMemo(() => {
    let result = [...plannedOrders];
    if (plannedSort) {
      result.sort((a, b) => {
        let aVal = a[plannedSort.key];
        let bVal = b[plannedSort.key];
        
        // Handle nested or computed values for sorting
        if (plannedSort.key === 'materialNo') {
          aVal = getMaterial(a.materialId)?.materialNo || '';
          bVal = getMaterial(b.materialId)?.materialNo || '';
        }
        
        if (aVal < bVal) return plannedSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return plannedSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [plannedOrders, plannedSort, materials]);

  const paginatedPlannedOrders = sortedPlannedOrders.slice((plannedPage - 1) * rowsPerPage, plannedPage * rowsPerPage);
  const plannedTotalPages = Math.ceil(sortedPlannedOrders.length / rowsPerPage);

  const paginatedCriticalMaterials = criticalMaterials.slice((safetyPage - 1) * rowsPerPage, safetyPage * rowsPerPage);
  const safetyTotalPages = Math.ceil(criticalMaterials.length / rowsPerPage);

  const requestPlannedSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (plannedSort && plannedSort.key === key && plannedSort.direction === 'asc') direction = 'desc';
    setPlannedSort({ key, direction });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newRequest = {
      id: 'R' + Math.floor(Math.random() * 90000 + 10000),
      userId: user?.id,
      materialId: selectedMatId,
      qty: parseInt(reqQty, 10),
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      justification,
      comment: ''
    };
    await mockApi.createRequest(newRequest);
    setShowForm(false);
    setReqQty(''); setJustification(''); setSelectedMatId('');
    setSuccessMsg('Material request submitted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
    setIsSubmitting(false);
  };

  const handleGeneratePlannedOrders = async () => {
    const newOrders = criticalMaterials.map(m => ({
      id: 'PO' + Date.now() + m.id,
      materialId: m.id,
      suggestedQty: m.maxLevel - m.stock,
      status: 'Open',
      createdAt: new Date().toISOString(),
      reason: 'Auto-generated: stock below minimum level'
    }));
    await Promise.all(newOrders.map(o => mockApi.createPlannedOrder(o)));
    fetchData();
    setSuccessMsg(`${newOrders.length} planned order(s) generated!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const tabs = [
    { id: 'safety', label: 'Safety Stock Alert', icon: <AlertTriangle size={15} /> },
    { id: 'planned', label: 'Planned Orders', icon: <ClipboardList size={15} /> },
    { id: 'request', label: 'Request Material', icon: <PackageSearch size={15} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>{successMsg}
        </div>
      )}

      {/* Tab Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1 flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
            {t.icon}{t.label}
            {t.id === 'safety' && criticalMaterials.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{criticalMaterials.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Safety Stock Tab */}
      {tab === 'safety' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />Safety Stock Alert
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Materials below minimum stock level</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleGeneratePlannedOrders}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                <Zap size={14} />Generate Planned Orders
              </button>
              <button onClick={() => { setTab('request'); setShowForm(true); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={14} />New Request
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {Array.isArray(paginatedCriticalMaterials) && paginatedCriticalMaterials.map(item => {
              const pct = Math.round((item.stock / item.minLevel) * 100);
              return (
                <li key={item.id} className="p-5 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.materialNo} — {item.description}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-4">{item.plant} · {item.location} · {item.uom}</p>
                      <div className="mt-3 ml-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Stock: <strong className="text-red-600">{item.stock}</strong></span>
                          <span>Min: {item.minLevel} · Max: {item.maxLevel}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${pct < 30 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{pct}% of minimum level</p>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedMatId(item.id); setReqQty((item.maxLevel - item.stock).toString()); setTab('request'); setShowForm(true); }}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">
                      Order to Max
                    </button>
                  </div>
                </li>
              );
            })}
            {criticalMaterials.length === 0 && (
              <li className="p-10 text-center text-gray-400 text-sm">All materials are within healthy stock levels.</li>
            )}
          </ul>
          
          {criticalMaterials.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{(safetyPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(safetyPage * rowsPerPage, criticalMaterials.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{criticalMaterials.length}</span> items
              </div>
              <div className="flex gap-2">
                <button disabled={safetyPage === 1} onClick={() => setSafetyPage(p => p - 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Prev</button>
                <button disabled={safetyPage === safetyTotalPages} onClick={() => setSafetyPage(p => p + 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Planned Orders Tab */}
      {tab === 'planned' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-blue-500" size={18} />Planned Orders
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">System-generated reorder recommendations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th onClick={() => requestPlannedSort('id')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Order ID {plannedSort?.key === 'id' ? (plannedSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPlannedSort('materialNo')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Material {plannedSort?.key === 'materialNo' ? (plannedSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="px-5 py-3">Plant / Loc</th>
                  <th onClick={() => requestPlannedSort('suggestedQty')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Suggested Qty {plannedSort?.key === 'suggestedQty' ? (plannedSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="px-5 py-3">Reason</th>
                  <th onClick={() => requestPlannedSort('createdAt')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Created {plannedSort?.key === 'createdAt' ? (plannedSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => requestPlannedSort('status')} className="px-5 py-3 cursor-pointer hover:text-blue-600">Status {plannedSort?.key === 'status' ? (plannedSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {Array.isArray(paginatedPlannedOrders) && paginatedPlannedOrders.map(po => {
                  const mat = getMaterial(po.materialId);
                  return (
                    <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">{po.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900 dark:text-white text-xs">{mat?.materialNo}</div>
                        <div className="text-gray-500 text-xs truncate max-w-[180px]">{mat?.description}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{mat?.plant} / {mat?.location}</td>
                      <td className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-400">{po.suggestedQty} <span className="text-xs font-normal text-gray-500">{mat?.uom}</span></td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px]">{po.reason}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(po.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${po.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {plannedOrders.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{(plannedPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(plannedPage * rowsPerPage, plannedOrders.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{plannedOrders.length}</span> items
              </div>
              <div className="flex gap-2">
                <button disabled={plannedPage === 1} onClick={() => setPlannedPage(p => p - 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Prev</button>
                <button disabled={plannedPage === plannedTotalPages} onClick={() => setPlannedPage(p => p + 1)} className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Material Tab */}
      {tab === 'request' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Request Material</h2>
              <p className="text-sm text-gray-500 mt-0.5">Submit a material request to initiate the approval workflow</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={16} />New Request
            </button>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Create Material Request</h3>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Material *</label>
                      <select required value={selectedMatId} onChange={e => setSelectedMatId(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="" disabled>Select a material...</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.materialNo} — {m.description}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                      <input type="number" required min="1" value={reqQty} onChange={e => setReqQty(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter amount" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Justification / Remarks *</label>
                    <textarea required rows={3} value={justification} onChange={e => setJustification(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Explain why this material is needed..."></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 shadow-sm">
                      {isSubmitting ? 'Sending...' : <><Send size={14} />Submit Request</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
