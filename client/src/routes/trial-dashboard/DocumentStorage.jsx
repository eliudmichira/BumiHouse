import React from 'react';
import { FolderOpen } from 'lucide-react';
import PlaceholderDashboard from './PlaceholderDashboard';

const DocumentStorage = () => {
  return (
    <PlaceholderDashboard
      title="Document Storage"
      description="Store leases, contracts, and important documents"
      icon={FolderOpen}
    />
  );
};

export default DocumentStorage;
