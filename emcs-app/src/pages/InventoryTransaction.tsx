import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Send, Plus, Trash2, ArrowRightLeft, FilePlus, FileMinus, Settings2 } from 'lucide-react';

type TransactionType = 'GR' | 'GI' | 'Transfer' | 'SAS';

interface TransactionItem {
  materialId: string;
  qty: number;
  batch?: string;
  serial?: string;
}

export default function InventoryTransaction() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [type, setType] = useState<TransactionType>('GR');
  const [items, setItems] = useState<TransactionItem[]>([{ materialId: '', qty: 1 }]);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/materials')
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error(err));
  }, []);

  const addItem = () => setItems([...items, { materialId: '', qty: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getTransactionLabel = () => {
    switch (type) {
      case 'GR': return 'Goods Receipt';
      case 'GI': return 'Goods Issue';
      case 'Transfer': return 'Inventory Transfer';
      case 'SAS': return 'Stock Adjustment';
    }
  };

  const getTransactionIcon = () => {
    switch (type) {
      case 'GR': return <FilePlus className="text-green-500" />;
      case 'GI': return <FileMinus className="text-red-500" />;
      case 'Transfer': return <ArrowRightLeft className="text-blue-500" />;
      case 'SAS': return <Settings2 className="text-amber-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.materialId || i.qty <= 0)) return alert('Please fill all item details.');

    setIsSubmitting(true);
    
    // Create multiple requests or one multi-item request? 
    // To keep it simple with existing db.json schema, we'll create one request entry with items array
    const newRequest = {
      id: 'TR' + Math.floor(Math.random() * 90000 + 10000),
      userId: user?.id,
      type: getTransactionLabel(),
      items: items,
      status: 'Pending', // Level 1: Supervisor
      requestedAt: new Date().toISOString(),
      justification,
      comment: '',
      // For backward compatibility with simpler components
      materialId: items[0].materialId, 
      qty: items[0].qty
    };

    try {
      await fetch('http://localhost:5000/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      
      setSuccessMsg(`Transaction ${newRequest.id} submitted for approval!`);
      setItems([{ materialId: '', qty: 1 }]);
      setJustification('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert('Failed to submit transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Transaction</h1>
          <p className="text-sm text-gray-500 mt-1">Submit inventory movements for multi-level approval</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['GR', 'GI', 'Transfer', 'SAS'] as TransactionType[]).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${type === t ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Package size={18} />
          </div>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl">
              {getTransactionIcon()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{getTransactionLabel()}</h2>
              <p className="text-xs text-gray-500">Inventory Transaction Details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Items List</h3>
              <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1">
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Material</label>
                    <select required value={item.materialId} onChange={e => updateItem(index, 'materialId', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white">
                      <option value="">Select Material...</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.materialNo} — {m.description}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity</label>
                    <input type="number" required min="1" value={item.qty} onChange={e => updateItem(index, 'qty', parseInt(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Batch</label>
                    <input type="text" value={item.batch} onChange={e => updateItem(index, 'batch', e.target.value)} placeholder="Optional"
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Serial</label>
                    <input type="text" value={item.serial} onChange={e => updateItem(index, 'serial', e.target.value)} placeholder="Optional"
                      className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white" />
                  </div>
                  <div className="md:col-span-1 flex justify-center pb-1">
                    <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Justification & Submit */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Justification / Transaction Remarks</label>
              <textarea required rows={4} value={justification} onChange={e => setJustification(e.target.value)}
                placeholder="Reason for this transaction..."
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-400">
                Logged in as: <span className="font-bold text-gray-600 dark:text-gray-300">{user?.name} ({user?.role})</span>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit for Approval</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Approval Routing Preview */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-4">Approval Routing Preview</h4>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</div>
            <span className="text-[10px] mt-1 text-blue-700 dark:text-blue-400 font-bold">Supervisor</span>
          </div>
          <div className="h-0.5 w-8 bg-blue-200 dark:bg-blue-800 mt-[-14px]"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center text-[10px] font-bold">2</div>
            <span className="text-[10px] mt-1 text-gray-400">Manager</span>
          </div>
          <div className="h-0.5 w-8 bg-gray-200 dark:bg-gray-700 mt-[-14px]"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center text-[10px] font-bold">3</div>
            <span className="text-[10px] mt-1 text-gray-400">Dept Head</span>
          </div>
          <div className="h-0.5 w-8 bg-gray-200 dark:bg-gray-700 mt-[-14px]"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center text-[10px] font-bold">
              <Package size={14} />
            </div>
            <span className="text-[10px] mt-1 text-gray-400 uppercase">Final</span>
          </div>
        </div>
      </div>
    </div>
  );
}
