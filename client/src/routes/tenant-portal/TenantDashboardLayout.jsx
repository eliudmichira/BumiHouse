import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, Settings, History, Users, LogOut } from 'lucide-react';

const TenantDashboardLayout = ({ tenant }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('tenant_session');
    navigate('/tenant-login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex gap-8">
        <aside className="hidden lg:flex w-64 flex-shrink-0">
          <div className="sticky top-6 h-[calc(100vh-3rem)] p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] rounded-2xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-[#0a0c19]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">BumiHouse</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tenant Portal</h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{tenant?.name || 'John Doe'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{tenant?.propertyName || 'Property'} • {tenant?.unitNumber || 'Unit'}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-[#51faaa]/20 text-[#0a0c19] border border-[#51faaa]/30">{tenant?.status || 'Active'}</span>
            </div>

            <nav className="space-y-2">
              <NavLink to="/tenant-dashboard" end className={({ isActive }) => `w-full block px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <TrendingUp className="w-4 h-4" /> Dashboard Overview
              </NavLink>
              <NavLink to="/tenant-dashboard/payments" className={({ isActive }) => `w-full block px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <DollarSign className="w-4 h-4" /> Payments
              </NavLink>
              <NavLink to="/tenant-dashboard/maintenance" className={({ isActive }) => `w-full block px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <Settings className="w-4 h-4" /> Maintenance
              </NavLink>
              <NavLink to="/tenant-dashboard/receipts" className={({ isActive }) => `w-full block px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <History className="w-4 h-4" /> Receipts
              </NavLink>
              <NavLink to="/tenant-dashboard/support" className={({ isActive }) => `w-full block px-4 py-3 rounded-xl font-medium flex items-center gap-3 ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <Users className="w-4 h-4" /> Support
              </NavLink>
            </nav>

            <div className="mt-auto">
              <button onClick={handleLogout} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TenantDashboardLayout;



