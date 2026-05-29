import React from 'react';

// Import section components
import OverviewSection from './sections/OverviewSection';
import SalesSection from './sections/SalesSection';
import InventorySection from './sections/InventorySection';
import PerformanceSection from './sections/PerformanceSection';
import ReportsSection from './sections/ReportsSection';
import SettingsSection from './sections/SettingsSection';
import UserManagementSection from './sections/UserManagementSection';

interface AdminDashboardPageProps {
  section?: string; // e.g. 'overview', 'sales', 'inventory', etc.
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ section = 'overview' }) => {
  let currentSectionComponent;
  let sectionTitle = 'Overview'; // Default title

  switch (section.toLowerCase()) { // Normalize section to lowercase for comparison
    case 'sales':
      currentSectionComponent = <SalesSection />;
      sectionTitle = 'Sales';
      break;
    case 'inventory':
      currentSectionComponent = <InventorySection />;
      sectionTitle = 'Inventory';
      break;
    case 'performance':
      currentSectionComponent = <PerformanceSection />;
      sectionTitle = 'Performance';
      break;
    case 'reports':
      currentSectionComponent = <ReportsSection />;
      sectionTitle = 'Reports';
      break;
    case 'settings':
      currentSectionComponent = <SettingsSection />;
      sectionTitle = 'Settings';
      break;
    case 'users':
      currentSectionComponent = <UserManagementSection />;
      sectionTitle = 'User Management';
      break;
    case 'overview':
    default:
      currentSectionComponent = <OverviewSection />;
      // sectionTitle remains 'Overview'
      break;
  }

  return (
    <div>
      {/* The title is now largely handled by the AdminLayout or could be passed up */}
      {/* For simplicity here, we might not need this H1 if the layout handles titles based on route */}
      {/* <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        {sectionTitle}
      </h1> */}
      {currentSectionComponent}
    </div>
  );
};

export default AdminDashboardPage; 