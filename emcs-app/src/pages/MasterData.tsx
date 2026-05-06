import { useState, useEffect, useMemo } from 'react';
import { Search, Download, FilterX, SlidersHorizontal, X, Box, Info } from 'lucide-react';

export default function MasterData() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    materialNo: '',
    description: '',
    plant: '',
    location: '',
    uom: '',
    batch: '',
    serial: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetch('http://localhost:5000/materials')
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error(err));
  }, []);

  // Dynamic dropdown values from master data
  const masterValues = useMemo(() => {
    return {
      plants: Array.from(new Set(materials.map(m => m.plant))).filter(Boolean).sort(),
      locations: Array.from(new Set(materials.map(m => m.location))).filter(Boolean).sort(),
      uoms: Array.from(new Set(materials.map(m => m.uom))).filter(Boolean).sort(),
    };
  }, [materials]);

  // Helper for Wildcard Search (* and %)
  const matchWildcard = (str: string, pattern: string) => {
    if (!pattern) return true;
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/[*%]/g, '.*'); // Convert * and % to .*
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    // If no wildcards are present, fall back to simple includes (fuzzy)
    if (!pattern.includes('*') && !pattern.includes('%')) {
      return str.toLowerCase().includes(pattern.toLowerCase());
    }
    return regex.test(str);
  };

  const filteredMaterials = useMemo(() => {
    let result = materials.filter(m => {
      const searchLower = searchTerm.toLowerCase();
      // Quick Fuzzy Search
      const matchesSearch = 
        m.materialNo.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.batch.toLowerCase().includes(searchLower) ||
        m.serial.toLowerCase().includes(searchLower);
      
      // Advanced Specific Filters with Wildcard Support
      const matchesMatNo = matchWildcard(m.materialNo, filters.materialNo);
      const matchesDesc = matchWildcard(m.description, filters.description);
      const matchesPlant = filters.plant ? m.plant === filters.plant : true;
      const matchesLocation = filters.location ? m.location === filters.location : true;
      const matchesUom = filters.uom ? m.uom === filters.uom : true;
      const matchesBatch = matchWildcard(m.batch, filters.batch);
      const matchesSerial = matchWildcard(m.serial, filters.serial);
      
      return matchesSearch && matchesMatNo && matchesDesc && matchesPlant && matchesLocation && matchesUom && matchesBatch && matchesSerial;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [materials, searchTerm, filters, sortConfig]);

  const totalPages = Math.ceil(filteredMaterials.length / rowsPerPage);
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <SlidersHorizontal size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const exportToCSV = () => {
    const headers = ['Material No,Description,Plant,Location,UOM,Batch,Serial,Stock,Min Level,Max Level'];
    const rows = filteredMaterials.map(m => 
      `${m.materialNo},"${m.description}",${m.plant},${m.location},${m.uom},${m.batch},${m.serial},${m.stock},${m.minLevel},${m.maxLevel}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 relative">
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Fuzzy search by Material No, Description, Batch, Serial..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <SlidersHorizontal size={16} />
              Advanced
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors shadow-sm"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Material No (Partial)</label>
              <input type="text" list="matNoSuggestions" value={filters.materialNo} onChange={(e) => setFilters({...filters, materialNo: e.target.value})} placeholder="e.g. 100-200"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
              <datalist id="matNoSuggestions">
                {materials.map(m => <option key={m.id} value={m.materialNo} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Keyword)</label>
              <input type="text" list="descSuggestions" value={filters.description} onChange={(e) => setFilters({...filters, description: e.target.value})} placeholder="e.g. Bearing"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
              <datalist id="descSuggestions">
                {materials.map(m => <option key={m.id} value={m.description} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Plant (Master Data)</label>
              <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.plant} onChange={(e) => setFilters({...filters, plant: e.target.value})}>
                <option value="">All Plants</option>
                {masterValues.plants.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Master Data)</label>
              <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
                <option value="">All Locations</option>
                {masterValues.locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">UOM</label>
              <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters.uom} onChange={(e) => setFilters({...filters, uom: e.target.value})}>
                <option value="">All UOM</option>
                {masterValues.uoms.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Number</label>
              <input type="text" value={filters.batch} onChange={(e) => setFilters({...filters, batch: e.target.value})} placeholder="e.g. B2023"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
              <input type="text" value={filters.serial} onChange={(e) => setFilters({...filters, serial: e.target.value})} placeholder="e.g. SN-0098"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ materialNo: '', description: '', plant: '', location: '', uom: '', batch: '', serial: '' })}
                className="flex items-center justify-center gap-2 px-4 py-2 w-full text-sm font-medium text-gray-600 bg-gray-100 border border-transparent rounded-lg hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
              >
                <FilterX size={16} /> Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th onClick={() => requestSort('materialNo')} className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Material No {getSortIcon('materialNo')}</div>
                </th>
                <th onClick={() => requestSort('description')} className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Description {getSortIcon('description')}</div>
                </th>
                <th onClick={() => requestSort('plant')} className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Plant / Loc {getSortIcon('plant')}</div>
                </th>
                <th onClick={() => requestSort('stock')} className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Stock (UOM) {getSortIcon('stock')}</div>
                </th>
                <th className="px-6 py-4 font-semibold">Min - Max</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterials.map((item, idx) => (
                <tr key={item.id} className={`border-b dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-800/80'}`}>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.materialNo}</td>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {item.plant} - {item.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${item.stock < item.minLevel ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {item.stock}
                    </span>
                    <span className="text-xs ml-1 text-gray-500">{item.uom}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {item.minLevel} - {item.maxLevel}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedMaterial(item)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium px-3 py-1.5 border border-blue-200 dark:border-blue-800 rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No materials found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMaterials.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
            <div className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredMaterials.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredMaterials.length}</span> items
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Slide-over Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedMaterial(null)}></div>
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700">
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl overflow-y-scroll border-l border-gray-200 dark:border-gray-700">
                
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2" id="slide-over-title">
                    <Box size={20} />
                    Material Detail
                  </h2>
                  <button 
                    onClick={() => setSelectedMaterial(null)}
                    className="text-blue-100 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 flex-1">
                  <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedMaterial.description}</h3>
                    <p className="text-gray-500 font-mono text-sm">{selectedMaterial.materialNo}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                        <p className="text-xs text-gray-500 mb-1">Available Stock</p>
                        <p className={`text-xl font-bold ${selectedMaterial.stock < selectedMaterial.minLevel ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {selectedMaterial.stock} <span className="text-sm font-normal text-gray-500">{selectedMaterial.uom}</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                        <p className="text-xs text-gray-500 mb-1">Min/Max Level</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedMaterial.minLevel} / {selectedMaterial.maxLevel}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Info size={16} className="text-blue-500" />
                        Storage Information
                      </h4>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm">
                        <div className="sm:col-span-1">
                          <dt className="text-gray-500">Plant</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">{selectedMaterial.plant}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-gray-500">Location</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">{selectedMaterial.location}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-gray-500">Batch</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">{selectedMaterial.batch}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-gray-500">Serial</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">{selectedMaterial.serial}</dd>
                        </div>
                      </dl>
                    </div>

                    {selectedMaterial.stock < selectedMaterial.minLevel && (
                      <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <h4 className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">Critical Stock Warning</h4>
                        <p className="text-xs text-red-600 dark:text-red-300">This item is below the minimum safety stock level. Please initiate a request in the MRP module.</p>
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
 
