import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ScrapingDashboard = () => {
  const [status, setStatus] = useState(null);
  const [listings, setListings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [activeProcessId, setActiveProcessId] = useState(null);
  const [config, setConfig] = useState({
    pages: 2,
    sites: ['jiji', 'property24', 'buyrentkenya']
  });
  const [selectedTab, setSelectedTab] = useState('overview');

  const API_BASE = 'http://localhost:3000/api/scraping';

  // Fetch status data
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setStatus(data);
      setIsScraping(data.isScraping);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // Fetch recent listings
  const fetchListings = async () => {
    try {
      const response = await fetch(`${API_BASE}/listings?limit=10`);
      const data = await response.json();
      setListings(data.listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  // Start scraping
  const startScraping = async () => {
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      setActiveProcessId(data.processId);
      setIsScraping(true);
      fetchStatus();
    } catch (error) {
      console.error('Error starting scraping:', error);
    }
  };

  // Stop scraping
  const stopScraping = async () => {
    try {
      await fetch(`${API_BASE}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId: activeProcessId })
      });
      setIsScraping(false);
      setActiveProcessId(null);
      fetchStatus();
    } catch (error) {
      console.error('Error stopping scraping:', error);
    }
  };

  // Import data
  const importData = async () => {
    try {
      await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 100 })
      });
      fetchStatus();
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    if (!activeProcessId) return;
    try {
      const response = await fetch(`${API_BASE}/logs/${activeProcessId}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchStatus();
    fetchListings();
    
    const interval = setInterval(() => {
      fetchStatus();
      if (isScraping) {
        fetchLogs();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isScraping, activeProcessId]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'listings', name: 'Listings', icon: DocumentTextIcon },
    { id: 'logs', name: 'Logs', icon: EyeIcon },
    { id: 'config', name: 'Config', icon: Cog6ToothIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scraping Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and control property data scraping from Kenyan real estate sites
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={importData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Import Data
              </button>
              {isScraping ? (
                <button
                  onClick={stopScraping}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop Scraping
                </button>
              ) : (
                <button
                  onClick={startScraping}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Scraping
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`${
                  selectedTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Listings
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {status?.totalListings || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Imported
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {status?.importedListings || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {status?.pendingListings || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-3 w-3 rounded-full ${isScraping ? 'bg-green-400' : 'bg-gray-400'}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Status
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {isScraping ? 'Scraping' : 'Idle'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Statistics */}
            {status?.stats && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Site Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {status.stats.map((stat) => (
                      <div key={stat.source} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {stat.source}
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {stat.count}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last scraped: {new Date(stat.lastScraped).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'listings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Listings
              </h3>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {listing.title || 'No title'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Source: {listing.source} | Price: {listing.price || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Bedrooms: {listing.bedrooms || 'N/A'} | 
                          Bathrooms: {listing.bathrooms || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {listing.images.length} images | 
                          Created: {new Date(listing.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          listing.imported 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.imported ? 'Imported' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    {listing.images.length > 0 && (
                      <div className="mt-3 flex space-x-2">
                        {listing.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="h-16 w-16 object-cover rounded"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'logs' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Scraping Logs
              </h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs available</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      <span className="text-gray-500">
                        [{log.timestamp.toLocaleTimeString()}]
                      </span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'config' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Scraping Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pages to scrape per site
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.pages}
                    onChange={(e) => setConfig({...config, pages: parseInt(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sites to scrape
                  </label>
                  <div className="mt-2 space-y-2">
                    {['jiji', 'property24', 'buyrentkenya'].map((site) => (
                      <label key={site} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.sites.includes(site)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({...config, sites: [...config.sites, site]});
                            } else {
                              setConfig({...config, sites: config.sites.filter(s => s !== site)});
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {site}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapingDashboard;
