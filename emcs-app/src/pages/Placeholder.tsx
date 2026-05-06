import { Construction } from 'lucide-react';

interface PlaceholderProps { title: string; description: string; }

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12">
      <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4 text-amber-500">
        <Construction size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">{description}</p>
      <div className="mt-6 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-800">
        Planned for Phase 2 — SAP Integration
      </div>
    </div>
  );
}
