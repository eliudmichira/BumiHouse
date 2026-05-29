import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
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
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Star,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  Activity
} from 'lucide-react';

// Mock data
const salesPerformanceData = [
  { month: 'Jan', thisYear: 18500, lastYear: 16200, target: 20000 },
  { month: 'Feb', thisYear: 22300, lastYear: 18900, target: 21000 },
  { month: 'Mar', thisYear: 25600, lastYear: 21200, target: 24000 },
  { month: 'Apr', thisYear: 28900, lastYear: 24500, target: 27000 },
  { month: 'May', thisYear: 32400, lastYear: 27800, target: 30000 },
  { month: 'Jun', thisYear: 35200, lastYear: 30100, target: 33000 },
  { month: 'Jul', thisYear: 38700, lastYear: 32600, target: 36000 },
  { month: 'Aug', thisYear: 41200, lastYear: 35200, target: 39000 },
  { month: 'Sep', thisYear: 44500, lastYear: 38100, target: 42000 },
  { month: 'Oct', thisYear: 47800, lastYear: 40900, target: 45000 },
  { month: 'Nov', thisYear: 51200, lastYear: 43500, target: 48000 },
  { month: 'Dec', thisYear: 54600, lastYear: 46200, target: 51000 }
];

const productPerformanceData = [
  { name: 'Original Probiotic', sales: 12400, revenue: 186000, margin: 45, trend: 12 },
  { name: 'Vanilla Bean', sales: 9800, revenue: 147000, margin: 42, trend: 8 },
  { name: 'Berry Boost', sales: 8600, revenue: 129000, margin: 48, trend: -3 },
  { name: 'Coconut Dream', sales: 6200, revenue: 93000, margin: 44, trend: 15 },
  { name: 'Peach Delight', sales: 4800, revenue: 72000, margin: 46, trend: 6 }
];

const customerSegmentData = [
  { name: 'Premium Users', value: 35, revenue: 180000, color: '#D50000' },
  { name: 'Regular Users', value: 45, revenue: 270000, color: '#4FC1E9' },
  { name: 'New Users', value: 20, revenue: 90000, color: '#9C27B0' }
];

const channelPerformanceData = [
  { channel: 'Online Store', orders: 2450, revenue: 367500, growth: 23 },
  { channel: 'Mobile App', orders: 1890, revenue: 283500, growth: 31 },
  { channel: 'Retail Partners', orders: 1240, revenue: 186000, growth: 12 },
  { channel: 'Direct Sales', orders: 680, revenue: 102000, growth: 8 }
];

const kpiData = [
  {
    title: 'Total Revenue',
    value: 'KES 2.4M',
    change: '+18.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'vs last month'
  },
  {
    title: 'Active Customers',
    value: '3,247',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'monthly active users'
  },
  {
    title: 'Average Order Value',
    value: 'KES 485',
    change: '+5.8%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'per transaction'
  },
  {
    title: 'Customer Satisfaction',
    value: '4.8/5',
    change: '+0.3',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'average rating'
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '-0.4%',
    trend: 'down',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'visitor to customer'
  },
  {
    title: 'Market Share',
    value: '24.7%',
    change: '+2.1%',
    trend: 'up',
    icon: Award,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'in Kenya probiotic market'
  }
];

const PerformanceSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12M');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    const data = {
      kpis: kpiData,
      salesPerformance: salesPerformanceData,
      productPerformance: productPerformanceData,
      customerSegments: customerSegmentData,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Track key metrics and business performance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primaryRed"
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="12M">Last Year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-primaryRed/90 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${kpi.bgColor} dark:bg-gray-700`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color} dark:text-gray-300`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sales Performance Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Performance</h3>
            <p className="text-gray-600 dark:text-gray-400">Year-over-year comparison with targets</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setSelectedMetric('revenue')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedMetric === 'revenue' 
                  ? 'bg-primaryRed text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setSelectedMetric('orders')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedMetric === 'orders' 
                  ? 'bg-primaryRed text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Orders
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="thisYear" 
                stroke="#D50000" 
                strokeWidth={3}
                name="2024"
                dot={{ fill: '#D50000', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="lastYear" 
                stroke="#9CA3AF" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="2023"
                dot={{ fill: '#9CA3AF', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#4FC1E9" 
                strokeWidth={2}
                strokeDasharray="10 5"
                name="Target"
                dot={{ fill: '#4FC1E9', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Products</h3>
              <p className="text-gray-600 dark:text-gray-400">Performance by product line</p>
            </div>
            <button className="flex items-center gap-2 text-primaryRed hover:text-primaryRed/80 text-sm">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          <div className="space-y-4">
            {productPerformanceData.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                    <div className={`flex items-center gap-1 text-sm ${
                      product.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(product.trend)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{product.sales.toLocaleString()} units</span>
                    <span>KES {product.revenue.toLocaleString()}</span>
                    <span>{product.margin}% margin</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Segments */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Segments</h3>
              <p className="text-gray-600 dark:text-gray-400">Revenue distribution by segment</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (KES ${props.payload.revenue.toLocaleString()})`,
                    props.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {customerSegmentData.map((segment) => (
              <div key={segment.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{segment.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{segment.value}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    KES {segment.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Channel Performance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Channels</h3>
            <p className="text-gray-600 dark:text-gray-400">Performance across different channels</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelPerformanceData.map((channel) => (
            <div key={channel.channel} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{channel.channel}</h4>
                <div className={`flex items-center gap-1 text-sm ${
                  channel.growth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  +{channel.growth}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Orders</span>
                  <span className="font-medium text-gray-900 dark:text-white">{channel.orders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-medium text-gray-900 dark:text-white">KES {channel.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceSection; 