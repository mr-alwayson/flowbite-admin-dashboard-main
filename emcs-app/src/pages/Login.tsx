import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password is just dummy
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate network delay for effect
    await new Promise(r => setTimeout(r, 800));
    
    const success = await login(email);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Please use one of the dummy accounts.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="flex justify-center mb-6 text-blue-600 dark:text-blue-400">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shadow-inner">
              <ShieldAlert size={36} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-2 tracking-tight">Welcome to EMCS</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Enterprise Material Control System</p>

          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-shadow"
                  placeholder="name@emcs.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-shadow"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2 font-medium">Dummy Accounts (Any password works):</p>
          <div className="flex justify-center gap-3 text-xs text-gray-600 dark:text-gray-300 flex-wrap">
            <span className="bg-white dark:bg-gray-600 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition-colors" onClick={() => setEmail('user@emcs.local')}>user@emcs.local</span>
            <span className="bg-white dark:bg-gray-600 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition-colors" onClick={() => setEmail('spv@emcs.local')}>spv@emcs.local</span>
            <span className="bg-white dark:bg-gray-600 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition-colors" onClick={() => setEmail('head@emcs.local')}>head@emcs.local</span>
          </div>
        </div>
      </div>
    </div>
  );
}
