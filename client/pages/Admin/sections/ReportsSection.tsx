import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus, 
  Eye, 
  Share2, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Settings
} from 'lucide-react';

// Mock data for reports
const reportTemplates = [
  {
    id: 1,
    name: 'Monthly Sales Summary',
    description: 'Comprehensive overview of monthly sales performance',
    category: 'Sales',
    lastGenerated: '2024-01-15',
    size: '2.4 MB',
    format: 'PDF',
    downloads: 45,
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 2,
    name: 'Inventory Valuation',
    description: 'Current stock levels and inventory value analysis',
    category: 'Inventory',
    lastGenerated: '2024-01-14',
    size: '1.8 MB',
    format: 'Excel',
    downloads: 32,
    icon: ShoppingBag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 3,
    name: 'Customer Analytics',
    description: 'Customer behavior and segmentation insights',
    category: 'Customers',
    lastGenerated: '2024-01-13',
    size: '3.1 MB',
    format: 'PDF',
    downloads: 28,
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 4,
    name: 'Performance Metrics',
    description: 'KPI tracking and performance indicators',
    category: 'Performance',
    lastGenerated: '2024-01-12',
    size: '1.5 MB',
    format: 'PDF',
    downloads: 38,
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 5,
    name: 'Financial Statement',
    description: 'Monthly profit & loss and financial overview',
    category: 'Finance',
    lastGenerated: '2024-01-11',
    size: '2.2 MB',
    format: 'Excel',
    downloads: 22,
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 6,
    name: 'Product Analysis',
    description: 'Individual product performance and trends',
    category: 'Products',
    lastGenerated: '2024-01-10',
    size: '4.2 MB',
    format: 'PDF',
    downloads: 51,
    icon: ShoppingBag,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  }
];

const recentReports = [
  {
    id: 1,
    name: 'Weekly Sales Report',
    generatedBy: 'John Mbugua',
    date: '2024-01-15 14:30',
    status: 'completed',
    size: '850 KB',
    type: 'Automated'
  },
  {
    id: 2,
    name: 'Customer Retention Analysis',
    generatedBy: 'Sarah Wanjiku',
    date: '2024-01-15 11:15',
    status: 'completed',
    size: '1.2 MB',
    type: 'Custom'
  },
  {
    id: 3,
    name: 'Inventory Alert Report',
    generatedBy: 'System',
    date: '2024-01-15 09:00',
    status: 'processing',
    size: 'Processing...',
    type: 'Automated'
  },
  {
    id: 4,
    name: 'Marketing Campaign ROI',
    generatedBy: 'David Kiprotich',
    date: '2024-01-14 16:45',
    status: 'failed',
    size: 'Failed',
    type: 'Custom'
  }
];

const reportMetrics = [
  { name: 'Total Reports Generated', value: '234', change: '+12%', icon: FileText },
  { name: 'Downloads This Month', value: '1,456', change: '+8%', icon: Download },
  { name: 'Active Report Templates', value: '18', change: '+2', icon: Settings },
  { name: 'Automated Reports', value: '67%', change: '+5%', icon: RefreshCw }
];

const ReportsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newReportData, setNewReportData] = useState({
    name: '',
    description: '',
    dataSource: '',
    dateRange: '30',
    format: 'PDF',
    schedule: 'manual'
  });

  const categories = ['All', 'Sales', 'Inventory', 'Customers', 'Performance', 'Finance', 'Products'];

  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGenerateReport = async (reportId: number) => {
    setGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    
    // Simulate file download
    const report = reportTemplates.find(r => r.id === reportId);
    if (report) {
      const blob = new Blob([`Mock ${report.name} data`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${report.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCreateReport = async () => {
    if (!newReportData.name || !newReportData.dataSource) return;
    
    setGenerating(true);
    // Simulate report creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGenerating(false);
    setShowReportBuilder(false);
    setNewReportData({
      name: '',
      description: '',
      dataSource: '',
      dateRange: '30',
      format: 'PDF',
      schedule: 'manual'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage business reports</p>
        </div>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Report
        </button>
      </div>

      {/* Report Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <metric.icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-sm font-medium text-green-600">{metric.change}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-primaryRed text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${report.bgColor} dark:bg-gray-700`}>
                    <report.icon className={`w-6 h-6 ${report.color} dark:text-gray-300`} />
                  </div>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                    {report.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Last: {report.lastGenerated}</span>
                  <span>{report.size} • {report.format}</span>
                  <span>{report.downloads} downloads</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 text-sm transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h3>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(report.status)}
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {report.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {report.generatedBy} • {report.date}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{report.size}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        report.type === 'Automated' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {report.type}
                      </span>
                    </div>
                  </div>
                  {report.status === 'completed' && (
                    <button className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Builder Modal */}
      {showReportBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Custom Report</h3>
              <button
                onClick={() => setShowReportBuilder(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={newReportData.name}
                  onChange={(e) => setNewReportData({ ...newReportData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  placeholder="Enter report name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newReportData.description}
                  onChange={(e) => setNewReportData({ ...newReportData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  rows={3}
                  placeholder="Describe what this report will contain..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Source
                  </label>
                  <select
                    value={newReportData.dataSource}
                    onChange={(e) => setNewReportData({ ...newReportData, dataSource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  >
                    <option value="">Select data source</option>
                    <option value="sales">Sales Data</option>
                    <option value="inventory">Inventory Data</option>
                    <option value="customers">Customer Data</option>
                    <option value="products">Product Data</option>
                    <option value="finance">Financial Data</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={newReportData.dateRange}
                    onChange={(e) => setNewReportData({ ...newReportData, dateRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Format
                  </label>
                  <select
                    value={newReportData.format}
                    onChange={(e) => setNewReportData({ ...newReportData, format: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule
                  </label>
                  <select
                    value={newReportData.schedule}
                    onChange={(e) => setNewReportData({ ...newReportData, schedule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
                  >
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReportBuilder(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReport}
                disabled={!newReportData.name || !newReportData.dataSource || generating}
                className="px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 transition-colors disabled:opacity-50"
              >
                {generating ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;