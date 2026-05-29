import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center p-4">
      <h1 className="text-4xl font-bold text-red-600 dark:text-red-500 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        You do not have the necessary permissions to access this page.
      </p>
      {/* Image removed to prevent potential broken link for now */}
      <Link 
        to="/"
        className="px-6 py-3 bg-primaryRed text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-150"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default UnauthorizedPage; 