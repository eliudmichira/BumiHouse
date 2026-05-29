import React, { useMemo, useState } from 'react';
import { History, CheckCircle, Download, Printer, Search } from 'lucide-react';

const Receipts = ({ paymentHistory = [] }) => {
  let sessionTenant = null;
  try {
    const raw = sessionStorage.getItem('tenant_session');
    if (raw) sessionTenant = JSON.parse(raw);
  } catch (_) {}
  const safeHistory = Array.isArray(paymentHistory) && paymentHistory.length > 0
    ? paymentHistory
    : (Array.isArray(sessionTenant?.paymentHistory) ? sessionTenant.paymentHistory : []);

  const [query, setQuery] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    return safeHistory.filter((p) => {
      const amount = Number(p?.amount || 0);
      const dateObj = p?.date ? new Date(p.date) : null;
      const okDate = dateObj && !isNaN(dateObj.getTime()) ? dateObj : null;
      const inRange = (!startDate || (okDate && okDate >= startDate)) && (!endDate || (okDate && okDate <= endDate));
      const text = `${p?.reference || ''} ${p?.method || ''}`.toLowerCase();
      const matches = q === '' || text.includes(q) || (Number.isFinite(amount) && amount.toString().includes(q));
      return inRange && matches;
    });
  }, [safeHistory, query, start, end]);

  const downloadCSV = () => {
    const rows = [['Date','Amount','Method','Reference']].concat(
      filtered.map(p => [
        p?.date ? new Date(p.date).toISOString() : '',
        String(p?.amount ?? ''),
        p?.method ?? '',
        p?.reference ?? p?.id ?? ''
      ])
    );
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReceipt = (p) => {
    const amount = Number(p?.amount || 0);
    const dateObj = p?.date ? new Date(p.date) : new Date();
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Receipt</title><style>
      body{font-family:ui-sans-serif,system-ui; padding:24px; color:#111827}
      .card{max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:16px;padding:24px}
      h1{font-size:20px;margin:0 0 12px}
      .row{display:flex;justify-content:space-between;margin:8px 0}
      .muted{color:#6b7280}
    </style></head><body>
      <div class="card">
        <h1>Payment Receipt</h1>
        <div class="row"><div>Date</div><div>${dateObj.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div></div>
        <div class="row"><div>Amount</div><div>KSh ${Number.isFinite(amount) ? amount.toLocaleString() : '—'}</div></div>
        <div class="row"><div>Method</div><div>${p?.method || '—'}</div></div>
        <div class="row"><div>Reference</div><div>${p?.reference || p?.id || '—'}</div></div>
        <p class="muted">Thank you for your payment.</p>
      </div>
      <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
    win.document.close();
  };

  return (
    <div className="p-8 rounded-3xl bg-white/80 border border-gray-200/50 shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold text-gray-900">📄 Receipts</h3>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4"/> CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="md:col-span-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
          <Search className="w-4 h-4 text-gray-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by reference, method, amount" className="w-full outline-none" />
        </div>
        <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200" />
        <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
          <History className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">{filtered.length} receipts</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">No receipts</h4>
          <p className="text-gray-500 max-w-md mx-auto">Your receipts will appear here after your first rent payment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 50).map((p) => {
            const amount = Number(p?.amount || 0);
            const dateObj = p?.date ? new Date(p.date) : null;
            const safeDate = dateObj && !isNaN(dateObj.getTime()) ? dateObj : new Date();
            return (
              <div key={p.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6]/20 to-[#06b6d4]/20 border border-[#3b82f6]/30 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">KSh {Number.isFinite(amount) ? amount.toLocaleString() : '—'}</p>
                    <p className="text-gray-600">{safeDate.toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'})} • {p?.method || '—'}</p>
                    <p className="text-sm text-gray-500">Ref: #{p?.reference || p?.id || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>printReceipt(p)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-white"><Printer className="w-4 h-4"/> Print</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Receipts;


