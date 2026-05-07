import { Settings2, Package } from 'lucide-react';

export default function InventoryTransaction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
        <div className="relative w-32 h-32 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
          <Settings2 size={64} className="text-blue-600 animate-spin-slow" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center border-2 border-white dark:border-gray-800">
          <Package size={20} className="text-amber-600" />
        </div>
      </div>
      
      <div className="max-w-md">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Module On Progress</h1>
        <p className="text-gray-500 dark:text-gray-400">
          The <span className="font-bold text-blue-600">Inventory Management</span> module is currently under active development to integrate seamlessly with your workflow.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <div className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          V.1.0 Beta
        </div>
      </div>
    </div>
  );
}
