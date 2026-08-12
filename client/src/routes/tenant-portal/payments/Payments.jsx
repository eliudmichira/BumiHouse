import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, History, CheckCircle, ArrowRight } from 'lucide-react';

const Payments = ({ tenant, monthlyRent, dueDate, onPay, paymentHistory = [] }) => {
  // Resolve safe data and fallbacks
  let sessionTenant = null;
  try {
    const raw = sessionStorage.getItem('tenant_session');
    if (raw) sessionTenant = JSON.parse(raw);
  } catch (_) {}

  const safeTenant = tenant || sessionTenant || {};
  const safeMonthlyRent = Number(
    typeof monthlyRent === 'number' ? monthlyRent : safeTenant.monthlyRent || 0
  );
  const safeDueDate = (() => {
    if (dueDate instanceof Date) return dueDate;
    const d = safeTenant.nextDueDate ? new Date(safeTenant.nextDueDate) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  })();
  const safeHistory = Array.isArray(paymentHistory) ? paymentHistory : (safeTenant.paymentHistory || []);

  const [showPayModal, setShowPayModal] = React.useState(false);
  const [payMethod, setPayMethod] = React.useState('M-Pesa');
  const [payPhone, setPayPhone] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const enableAutoPay = () => {
    const updated = { ...(safeTenant || {}), autoPayEnabled: true };
    try { sessionStorage.setItem('tenant_session', JSON.stringify(updated)); } catch (_) {}
    window.location.reload();
  };

  const handleConfirmPay = async () => {
    if (!Number.isFinite(safeMonthlyRent) || safeMonthlyRent <= 0) return;
    setIsProcessing(true);
    const newPayment = {
      id: `pay_${Date.now()}`,
      amount: safeMonthlyRent,
      date: new Date().toISOString(),
      method: payMethod,
      reference: `${payMethod === 'M-Pesa' ? 'MP' : 'CR'}${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      phone: payPhone || undefined
    };
    const existing = Array.isArray(safeTenant.paymentHistory) ? safeTenant.paymentHistory : [];
    const updated = { ...(safeTenant || {}), paymentHistory: [newPayment, ...existing] };
    try { sessionStorage.setItem('tenant_session', JSON.stringify(updated)); } catch (_) {}
    if (typeof onPay === 'function') onPay(newPayment);
    setIsProcessing(false);
    setShowPayModal(false);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Auto-Pay Setup */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.05}} className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🔁 Auto‑Pay</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${safeTenant.autoPayEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{safeTenant.autoPayEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Automatically pay KSh {Number.isFinite(safeMonthlyRent) ? safeMonthlyRent.toLocaleString() : '—'} every month on the due date.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">{safeTenant.autoPayMethod || 'M‑Pesa'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm text-gray-500">Scheduled Day</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">{safeDueDate.toLocaleDateString('en-US', { day: 'numeric' })} of each month</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">{safeTenant.autoPayEnabled ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={enableAutoPay} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold">{safeTenant.autoPayEnabled ? 'Manage Auto‑Pay' : 'Enable Auto‑Pay'}</button>
          {safeTenant.autoPayEnabled && (
            <button className="px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">Pause</button>
          )}
        </div>
      </motion.div>
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">💰 Rent Payment</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">{safeDueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Amount Due</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">KSh {Number.isFinite(safeMonthlyRent) ? safeMonthlyRent.toLocaleString() : '—'}</p>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Due Date</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{safeDueDate.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric'})}</p>
          </div>
        </div>
        <motion.button onClick={()=>setShowPayModal(true)} whileHover={{scale:1.02}} whileTap={{scale:.98}} className="w-full px-8 py-6 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-bold text-xl rounded-2xl flex items-center justify-center gap-4">
          <Smartphone className="w-7 h-7" />
          <span>🔥 PAY RENT NOW</span>
          <ArrowRight className="w-7 h-7" />
        </motion.button>
      </motion.div>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="p-8 rounded-3xl bg-white/80 border border-gray-200/50 shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold text-gray-900">📊 Payment History</h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
            <History className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{safeHistory.length} payments</span>
          </div>
        </div>
        {safeHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">No payments yet</h4>
            <p className="text-gray-500 max-w-md mx-auto">Your payment history will appear here after your first rent payment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeHistory.slice(0, 6).map((p) => {
              const amount = Number(p?.amount || 0);
              const dateObj = p?.date ? new Date(p.date) : null;
              const safeDate = dateObj && !isNaN(dateObj.getTime()) ? dateObj : new Date();
              return (
              <div key={p.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#51faaa]/20 to-[#dbd5a4]/20 border border-[#51faaa]/30 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-[#51faaa]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">KSh {Number.isFinite(amount) ? amount.toLocaleString() : '—'}</p>
                    <p className="text-gray-600">{safeDate.toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'})} • {p?.method || '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#51faaa]/10 to-[#dbd5a4]/10 text-[#51faaa] font-semibold rounded-xl border border-[#51faaa]/30">✅ Paid</span>
                  <p className="text-sm text-gray-500 mt-1">#{p?.reference || p?.id || '—'}</p>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Pay Now Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={()=>!isProcessing && setShowPayModal(false)}></div>
          <div className="relative w-full max-w-xl mx-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">KSh {Number.isFinite(safeMonthlyRent) ? safeMonthlyRent.toLocaleString() : '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{safeDueDate.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric'})}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Payment Method</label>
                <select value={payMethod} onChange={e=>setPayMethod(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="M-Pesa">M‑Pesa</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              {payMethod === 'M-Pesa' && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">M‑Pesa Phone</label>
                  <input value={payPhone} onChange={e=>setPayPhone(e.target.value)} placeholder="07xx xxx xxx" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button disabled={isProcessing} onClick={()=>setShowPayModal(false)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 disabled:opacity-60">Cancel</button>
              <button disabled={isProcessing} onClick={handleConfirmPay} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#0a0c19] font-semibold disabled:opacity-60">{isProcessing ? 'Processing…' : 'Confirm & Pay'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;


