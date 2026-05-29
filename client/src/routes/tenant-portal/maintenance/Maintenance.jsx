import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const Maintenance = () => {
  let sessionTenant = null;
  try {
    const raw = sessionStorage.getItem('tenant_session');
    if (raw) sessionTenant = JSON.parse(raw);
  } catch (_) {}

  const initialRequests = useMemo(() => (
    Array.isArray(sessionTenant?.maintenanceRequests) ? sessionTenant.maintenanceRequests : []
  ), []);

  const [requests, setRequests] = useState(initialRequests);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState('normal');

  const submit = () => {
    if (!title.trim()) return;
    const newReq = {
      id: `req_${Date.now()}`,
      title: title.trim(),
      details: details.trim(),
      priority,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    const next = [newReq, ...requests];
    setRequests(next);
    setTitle('');
    setDetails('');
    setPriority('normal');
    try {
      // persist in session lightly
      const copy = { ...(sessionTenant || {}), maintenanceRequests: next };
      sessionStorage.setItem('tenant_session', JSON.stringify(copy));
    } catch (_) {}
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.05}} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Wrench className="w-6 h-6"/> Request Maintenance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="e.g., AC not cooling" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Details</label>
            <textarea value={details} onChange={e=>setDetails(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Describe the issue..." />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={submit} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-[#0a0c19] font-semibold inline-flex items-center gap-2"><PlusCircle className="w-5 h-5"/> Submit Request</button>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Requests</h3>
          <span className="text-sm text-gray-500">{requests.length} total</span>
        </div>
        {requests.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0,10).map(r => {
              const created = r?.createdAt ? new Date(r.createdAt) : new Date();
              return (
                <div key={r.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{r.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{created.toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})} • Priority: {r.priority}</p>
                    {r.details && <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{r.details}</p>}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold ${r.status==='resolved'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-800'}`}>{r.status==='resolved' ? 'Resolved' : 'Open'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Maintenance;


