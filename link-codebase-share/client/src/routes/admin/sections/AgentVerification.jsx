import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Search, Shield, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { agentVerificationAPI } from '../../../lib/firebaseAPI';
import { SpinnerLoader } from '../../../components/Preloader';

const AgentVerification = () => {
  const [agents, setAgents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const loadAgents = async () => {
    try {
      setLoading(true);
      const qAll = query(collection(db, 'agents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(qAll);
      const items = [];
      snap.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setAgents(items);
    } catch (e) {
      console.error('Error loading agents:', e);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const pendingList = useMemo(
    () => agents.filter((a) => a.verificationRequested === true && a.verified !== true),
    [agents]
  );
  const verifiedList = useMemo(
    () => agents.filter((a) => a.verified === true),
    [agents]
  );
  const unverifiedList = useMemo(
    () => agents.filter((a) => a.verified !== true),
    [agents]
  );

  useEffect(() => {
    const base = activeTab === 'pending' ? pendingList : activeTab === 'verified' ? verifiedList : unverifiedList;
    if (!search) {
      setFiltered(base);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(
      base.filter(
        (r) =>
          (r.name || '').toLowerCase().includes(s) ||
          (r.email || '').toLowerCase().includes(s) ||
          (r.company || '').toLowerCase().includes(s)
      )
    );
  }, [search, activeTab, pendingList, verifiedList, unverifiedList]);

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      await agentVerificationAPI.updateVerificationStatus(id, true);
      await loadAgents();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      await agentVerificationAPI.updateVerificationStatus(id, false);
      await loadAgents();
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Verification</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and approve agent verification requests</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg border ${activeTab==='pending' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
        >
          Pending ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-3 py-1.5 rounded-lg border ${activeTab==='verified' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
        >
          Verified ({verifiedList.length})
        </button>
        <button
          onClick={() => setActiveTab('unverified')}
          className={`px-3 py-1.5 rounded-lg border ${activeTab==='unverified' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
        >
          Unverified ({unverifiedList.length})
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <SpinnerLoader text="Loading requests..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {activeTab==='pending' ? 'No pending verification requests' : activeTab==='verified' ? 'No verified agents' : 'No unverified agents'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{r.name || 'Unknown Name'}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {r.email}</span>
                      {r.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {r.phoneNumber}</span>}
                      {r.company && <span className="hidden sm:inline">• {r.company}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Requested {r.verificationRequestedAt?.toDate ? r.verificationRequestedAt.toDate().toLocaleString() : (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : '—')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab !== 'verified' && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={actionLoadingId === r.id}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  )}
                  {activeTab !== 'unverified' && (
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={actionLoadingId === r.id}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentVerification;