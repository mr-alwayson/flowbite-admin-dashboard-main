import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Database, Activity, Inbox, LogOut, ShieldAlert,
  Package, FileBarChart2, Settings, ChevronDown, ChevronRight,
  Sun, Moon
} from 'lucide-react';

interface NavItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: { name: string; path: string }[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  {
    name: 'Master Data', icon: <Database size={18} />,
    children: [
      { name: 'Inventory Master', path: '/master-data' },
    ]
  },
  {
    name: 'Inventory Management', icon: <Package size={18} />,
    children: [
      { name: 'GRPO', path: '/inventory/grpo' },
      { name: 'Goods Receipt (GR)', path: '/inventory/gr' },
      { name: 'Goods Issue (GI)', path: '/inventory/gi' },
      { name: 'Inventory Transfer', path: '/inventory/transfer' },
      { name: 'Stock Adjustment (SAS)', path: '/inventory/sas' },
    ]
  },
  {
    name: 'MRP', icon: <Activity size={18} />,
    children: [
      { name: 'Reorder Point', path: '/mrp' },
      { name: 'Request Material', path: '/mrp?tab=request' },
      { name: 'Planned Order', path: '/mrp?tab=planned' },
    ]
  },
  {
    name: 'Approval', icon: <Inbox size={18} />,
    children: [
      { name: 'Approval Inbox', path: '/approval' },
      { name: 'Approval History', path: '/approval?tab=history' },
    ]
  },
  {
    name: 'Reports', icon: <FileBarChart2 size={18} />,
    children: [
      { name: 'Inventory Report', path: '/reports/inventory' },
      { name: 'Procurement Report', path: '/reports/procurement' },
    ]
  },
  {
    name: 'Admin', icon: <Settings size={18} />,
    children: [
      { name: 'User Management', path: '/admin' },
      { name: 'Role & Permission', path: '/admin?tab=roles' },
      { name: 'System Logs', path: '/admin?tab=logs' },
    ]
  },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>(['Dashboard', 'Master Data', 'MRP', 'Approval']);
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const isChildActive = (item: NavItem) =>
    item.children?.some(c => {
      const [cPath, cQuery] = c.path.split('?');
      const currentSearch = location.search.replace('?', '');
      if (cQuery) return location.pathname === cPath && currentSearch === cQuery;
      return location.pathname === cPath && !location.search;
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    for (const item of navItems) {
      if (item.path && location.pathname === item.path && !location.search) return item.name;
      if (item.children) {
        const child = item.children.find(c => {
          const [cPath, cQuery] = c.path.split('?');
          const currentSearch = location.search.replace('?', '');
          if (cQuery) return location.pathname === cPath && currentSearch === cQuery;
          return location.pathname === cPath && !location.search;
        });
        if (child) return child.name;
      }
    }
    return 'EMCS';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm overflow-hidden">
        <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">EMCS</span>
              <span className="block text-[10px] text-gray-400 leading-none -mt-0.5">Enterprise Material Control</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            if (item.path && !item.children) {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  {item.icon}{item.name}
                </Link>
              );
            }
            const isOpen = openMenus.includes(item.name);
            const active = isChildActive(item);
            return (
              <div key={item.name}>
                <button onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${active ? 'text-blue-700 font-semibold dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  <span className="flex items-center gap-2.5">{item.icon}{item.name}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && item.children && (
                  <div className="ml-4 mt-0.5 border-l-2 border-gray-100 dark:border-gray-700 pl-3 space-y-0.5">
                    {item.children.map(child => {
                        const [cPath, cQuery] = child.path.split('?');
                        const currentSearch = location.search.replace('?', '');
                        const childActive = cQuery
                          ? location.pathname === cPath && currentSearch === cQuery
                          : location.pathname === cPath && !location.search;
                      return (
                        <Link key={child.name} to={child.path}
                          className={`flex items-center px-2 py-1.5 rounded text-xs transition-all ${childActive ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-700/50'}`}>
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400">
            <LogOut size={14} />Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0 transition-colors">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} aria-label="Toggle Dark Mode"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full transition-colors">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              SAP Sync: Live
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
