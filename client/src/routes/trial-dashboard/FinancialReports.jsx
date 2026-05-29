import React from 'react';
import { BarChart3 } from 'lucide-react';
import PlaceholderDashboard from './PlaceholderDashboard';

const FinancialReports = () => {
  return (
    <PlaceholderDashboard
      title="Financial Reports"
      description="Income, expenses, and profit analytics"
      icon={BarChart3}
    />
  );
};

export default FinancialReports;
