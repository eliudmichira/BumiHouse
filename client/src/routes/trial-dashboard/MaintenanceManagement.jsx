import React from 'react';
import { Wrench } from 'lucide-react';
import PlaceholderDashboard from './PlaceholderDashboard';

const MaintenanceManagement = () => {
  return (
    <PlaceholderDashboard
      title="Maintenance Management"
      description="Handle tenant maintenance requests and track repairs"
      icon={Wrench}
    />
  );
};

export default MaintenanceManagement;
