import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Overview = ({ tenant, cribbyScore, streak, monthlyRent, dueDate }) => {
  // Fallbacks from session if props are not provided via route
  let sessionTenant = null;
  try {
    const raw = sessionStorage.getItem('tenant_session');
    if (raw) sessionTenant = JSON.parse(raw);
  } catch (_) { }

  const safeTenant = tenant || sessionTenant || {};
  const safeMonthlyRent = Number(
    typeof monthlyRent === 'number' ? monthlyRent : safeTenant.monthlyRent || 0
  );
  const safeDueDate = (() => {
    if (dueDate instanceof Date) return dueDate;
    const d = safeTenant.nextDueDate ? new Date(safeTenant.nextDueDate) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  })();
  const safeCribby = typeof cribbyScore === 'number' ? cribbyScore : (safeTenant.cribbyScore || 850);
  const safeStreak = typeof streak === 'number' ? streak : (safeTenant.streak || 6);
  const property = safeTenant.property || {};
  const manager = safeTenant.manager || {};

  // Status & Alerts
  const today = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDue = Math.floor((safeDueDate.setHours(0, 0, 0, 0) - new Date(today.setHours(0, 0, 0, 0))) / msPerDay);
  const lastPayment = Array.isArray(safeTenant.paymentHistory) ? safeTenant.paymentHistory[0] : null; // assume sorted desc if present
  const lastPaymentDate = lastPayment?.date ? new Date(lastPayment.date) : null;
  const lastPaymentCoversThisMonth = lastPaymentDate && lastPaymentDate.getMonth() === (new Date()).getMonth() && lastPaymentDate.getFullYear() === (new Date()).getFullYear();
  const isPaid = lastPaymentCoversThisMonth && Number(lastPayment?.amount || 0) >= safeMonthlyRent;
  const isOverdue = !isPaid && daysUntilDue < 0;
  const statusChip = isPaid ? 'Paid' : (isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}` : `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`);
  const nextAction = isPaid ? 'All set for this month' : (isOverdue ? 'Pay now to clear overdue' : (safeTenant.autoPayEnabled ? 'Auto‑Pay will handle this' : 'Set up Auto‑Pay'));

  // Smart reminders
  const openMaintenanceCount = Array.isArray(safeTenant.maintenanceRequests) ? safeTenant.maintenanceRequests.filter(r => r?.status !== 'closed' && r?.status !== 'resolved').length : (safeTenant.maintenance?.openCount || 0);
  const leaseEnd = safeTenant.leaseEnd ? new Date(safeTenant.leaseEnd) : null;
  const leaseDaysLeft = leaseEnd ? Math.ceil((leaseEnd.getTime() - Date.now()) / msPerDay) : null;
  const leaseExpiringSoon = typeof leaseDaysLeft === 'number' && leaseDaysLeft <= 60;
  // Modal state
  const [showAutoPayModal, setShowAutoPayModal] = React.useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = React.useState(false);
  const [autoPayMethod, setAutoPayMethod] = React.useState(safeTenant.autoPayMethod || 'M‑Pesa');
  const [mTitle, setMTitle] = React.useState('');
  const [mDetails, setMDetails] = React.useState('');
  const [mPriority, setMPriority] = React.useState('normal');

  const saveTenantSession = (data) => {
    try { sessionStorage.setItem('tenant_session', JSON.stringify(data)); } catch (_) { }
  };

  const enableAutoPayFromModal = () => {
    const updated = { ...(safeTenant || {}), autoPayEnabled: true, autoPayMethod };
    saveTenantSession(updated);
    setShowAutoPayModal(false);
    window.location.reload();
  };

  const submitMaintenanceFromModal = () => {
    if (!mTitle.trim()) return;
    const newReq = {
      id: `req_${Date.now()}`,
      title: mTitle.trim(),
      details: mDetails.trim(),
      priority: mPriority,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    const list = Array.isArray(safeTenant.maintenanceRequests) ? safeTenant.maintenanceRequests : [];
    const updated = { ...(safeTenant || {}), maintenanceRequests: [newReq, ...list] };
    saveTenantSession(updated);
    setShowMaintenanceModal(false);
    setMTitle(''); setMDetails(''); setMPriority('normal');
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">Manage your rent, track payments, and stay on top of your home</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-[#51faaa]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">KSh {Number.isFinite(safeMonthlyRent) ? safeMonthlyRent.toLocaleString() : '—'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-[#51faaa]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{safeDueDate.toLocaleDateString('en-US', { day: 'numeric' })}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{safeDueDate.toLocaleDateString('en-US', { month: 'long' })} Due Date</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-2xl flex items-center justify-center">
                <Star className="w-7 h-7 text-[#51faaa]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{safeCribby}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">BumiHouse Score</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-[#51faaa]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{safeStreak}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Month Streak</p>
          </motion.div>
        </div>
      </div>

      {/* Inline analytics: rent payments over last 6 months (sparkline + bars) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Trend (6 months)</h3>
          <span className="text-sm text-gray-500">BumiHouse Analytics</span>
        </div>
        {(() => {
          // Build a small dataset using session history or synthetic fallback
          const history = Array.isArray(safeTenant.paymentHistory) ? safeTenant.paymentHistory : [];
          const now = new Date();
          const labels = [];
          const amounts = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(d.toLocaleString('en-US', { month: 'short' }));
            const monthMatch = history.find(h => {
              const hd = h?.date ? new Date(h.date) : null;
              return hd && hd.getFullYear() === d.getFullYear() && hd.getMonth() === d.getMonth();
            });
            const value = Number(monthMatch?.amount || safeMonthlyRent || 0);
            amounts.push(Number.isFinite(value) ? value : 0);
          }

          const max = Math.max(1, ...amounts);
          const width = 600;
          const height = 120;
          const padX = 10;
          const padY = 10;
          const stepX = (width - padX * 2) / (amounts.length - 1);
          const points = amounts.map((v, idx) => {
            const x = padX + idx * stepX;
            const y = padY + (height - padY * 2) * (1 - v / max);
            return `${x},${y}`;
          }).join(' ');

          return (
            <div className="w-full">
              <div className="overflow-x-auto">
                <svg width={width} height={height} className="rounded-xl bg-gray-50 dark:bg-gray-700/40">
                  {/* area fill */}
                  <polyline points={points}
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="3" />
                  {/* gradient */}
                  <defs>
                    <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#51faaa" />
                      <stop offset="100%" stopColor="#dbd5a4" />
                    </linearGradient>
                  </defs>
                  {/* points */}
                  {amounts.map((v, idx) => {
                    const x = padX + idx * stepX;
                    const y = padY + (height - padY * 2) * (1 - v / max);
                    return <circle key={idx} cx={x} cy={y} r="3" fill="#51faaa" />
                  })}
                </svg>
              </div>
              <div className="grid grid-cols-6 gap-2 mt-3">
                {labels.map((l, i) => (
                  <div key={i} className="text-xs text-gray-500 text-center">{l}</div>
                ))}
              </div>
            </div>
          );
        })()}
      </motion.div>

      {/* Status & Alerts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isPaid ? 'bg-green-100 text-green-700' : (isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800')}`}>{statusChip}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Next action: {nextAction}</p>
          <div className="mt-4 flex gap-3">
            {!isPaid && (
              <Link to="/tenant-dashboard/payments" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold">Pay Now</Link>
            )}
            {!isPaid && !safeTenant.autoPayEnabled && (
              <button onClick={() => setShowAutoPayModal(true)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">Set up Auto‑Pay</button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Smart Reminders</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#51faaa]"></span>
              <span>{openMaintenanceCount > 0 ? `${openMaintenanceCount} maintenance ${openMaintenanceCount === 1 ? 'request' : 'requests'} open` : 'No open maintenance requests'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#dbd5a4]"></span>
              <span>{leaseEnd ? (leaseExpiringSoon ? `Lease expires in ${leaseDaysLeft} day${leaseDaysLeft === 1 ? '' : 's'}` : `Lease ends on ${leaseEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`) : 'Lease end date not set'}</span>
            </li>
          </ul>
        </motion.div>

        {/* Unit & Property */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7 }} className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Unit & Property</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <div><span className="font-semibold">Property:</span> {property.name || '—'}</div>
            <div><span className="font-semibold">Address:</span> {
              (() => {
                const loc = property.address || property.location;
                if (typeof loc === 'string') return loc;
                if (typeof loc === 'object' && loc) return loc.address || loc.city || '—';
                return '—';
              })()
            }</div>
            <div><span className="font-semibold">Unit:</span> {safeTenant.unit || safeTenant.apartment || safeTenant.unitNumber || '—'}</div>
            <div><span className="font-semibold">Manager:</span> {manager.name || manager.fullName || '—'}{manager.phone ? ` • ${manager.phone}` : ''}</div>
          </div>
          <div className="mt-4">
            <Link to="/tenant-dashboard/maintenance" className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 inline-block">Report a problem</Link>
          </div>
        </motion.div>
      </div>
      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .8 }} className="mt-8 p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setShowAutoPayModal(true)} className="text-left p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-700/40 hover:border-[#51faaa]/50 transition">
            <p className="font-semibold text-gray-900 dark:text-white">Set Up Auto‑Pay</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Never miss a payment again</p>
          </button>
          <button onClick={() => setShowMaintenanceModal(true)} className="text-left p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-700/40 hover:border-[#51faaa]/50 transition">
            <p className="font-semibold text-gray-900 dark:text-white">Request Maintenance</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Report any issues quickly</p>
          </button>
          <Link to="/tenant-dashboard/receipts" className="p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-700/40 hover:border-[#51faaa]/50 transition">
            <p className="font-semibold text-gray-900 dark:text-white">Download Receipts</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Get payment confirmations</p>
          </Link>
        </div>
      </motion.div>

      {/* Auto‑Pay Modal */}
      {showAutoPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAutoPayModal(false)}></div>
          <div className="relative w-full max-w-lg mx-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enable Auto‑Pay</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Payment Method</label>
                <select value={autoPayMethod} onChange={e => setAutoPayMethod(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="M‑Pesa">M‑Pesa</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">A standing instruction will be created to pay KSh {Number.isFinite(safeMonthlyRent) ? safeMonthlyRent.toLocaleString() : '—'} every month on the due date.</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowAutoPayModal(false)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">Cancel</button>
              <button onClick={enableAutoPayFromModal} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold">Enable Auto‑Pay</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMaintenanceModal(false)}></div>
          <div className="relative w-full max-w-2xl mx-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">New Maintenance Request</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                <input value={mTitle} onChange={e => setMTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="e.g., Leaking sink" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Priority</label>
                <select value={mPriority} onChange={e => setMPriority(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Details</label>
                <textarea value={mDetails} onChange={e => setMDetails(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Describe the issue..." />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">Cancel</button>
              <button onClick={submitMaintenanceFromModal} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;



