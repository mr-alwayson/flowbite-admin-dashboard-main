import { useEffect, useState } from 'react';
import { PackageSearch, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function getStatusBadge(status: string) {
  switch (status) {
    case 'Pending': return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Awaiting Supervisor</span>;
    case 'Approved_Supervisor': return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Awaiting Dept Head</span>;
    case 'Approved_DeptHead': return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Fully Approved</span>;
    case 'Rejected': return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
    default: return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{status}</span>;
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalMaterials: 0, criticalStock: 0, pendingApprovals: 0, fullyApproved: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [matRes, reqRes, userRes] = await Promise.all([
        fetch('http://localhost:5000/materials'),
        fetch('http://localhost:5000/requests'),
        fetch('http://localhost:5000/users')
      ]);
      const mats = await matRes.json();
      const reqs = await reqRes.json();
      const usrs = await userRes.json();
      setMaterials(mats);
      setUsers(usrs);

      const critical = mats.filter((m: any) => m.stock < m.minLevel).length;
      const pending = reqs.filter((r: any) => r.status === 'Pending' || r.status === 'Approved_Supervisor').length;
      const approved = reqs.filter((r: any) => r.status === 'Approved_DeptHead').length;
      setStats({ totalMaterials: mats.length, criticalStock: critical, pendingApprovals: pending, fullyApproved: approved });

      const sorted = [...mats].sort((a, b) => (a.stock / a.minLevel) - (b.stock / b.minLevel)).slice(0, 5);
      setChartData(sorted.map((m: any) => ({ name: m.description.split(' ').slice(0, 2).join(' '), Stock: m.stock, 'Min Level': m.minLevel, 'Max Level': m.maxLevel })));

      const recent = [...reqs].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).slice(0, 5);
      setRecentRequests(recent);
    };
    fetchData();
  }, []);

  const getMat = (id: string) => materials.find(m => m.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);

  const statCards = [
    { label: 'Total Materials', value: stats.totalMaterials, icon: <PackageSearch size={22} />, color: 'blue' },
    { label: 'Critical Stock', value: stats.criticalStock, icon: <AlertTriangle size={22} />, color: 'red' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: <Clock size={22} />, color: 'amber' },
    { label: 'Fully Approved', value: stats.fullyApproved, icon: <CheckCircle size={22} />, color: 'emerald' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[s.color]}`}>{s.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={18} />Critical Stock Comparison
          </h3>
          <p className="text-xs text-gray-400 mb-5">Top 5 materials closest to depletion</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Stock" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Min Level" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Max Level" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">System Status</h3>
          <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Approval Pipeline</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{stats.pendingApprovals} request(s) are in the multi-level approval workflow pipeline.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Safety Stock Alert</h4>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{stats.criticalStock} material(s) are below minimum safety stock level. Check MRP module.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 dark:bg-gray-700/30 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">SAP Integration</h4>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              SAP Business One Service Layer — Connected at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">Recent Material Requests</h3>
          <p className="text-xs text-gray-400 mt-0.5">Last 5 requests across the system</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Requester</th>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentRequests.map(req => {
                const mat = getMat(req.materialId);
                const reqUser = getUser(req.userId);
                return (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{req.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{reqUser?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500 truncate max-w-[180px]">{mat?.description}</td>
                    <td className="px-5 py-3 font-semibold text-blue-600 dark:text-blue-400">{req.qty}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(req.requestedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{getStatusBadge(req.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
