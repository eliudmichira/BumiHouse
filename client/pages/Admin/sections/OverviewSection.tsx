import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  AlertTriangle,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data - in production, this would come from your backend
const salesData = [
  { month: 'Jan', sales: 45000, orders: 120, customers: 89 },
  { month: 'Feb', sales: 52000, orders: 145, customers: 102 },
  { month: 'Mar', sales: 48000, orders: 132, customers: 95 },
  { month: 'Apr', sales: 61000, orders: 168, customers: 118 },
  { month: 'May', sales: 55000, orders: 152, customers: 108 },
  { month: 'Jun', sales: 67000, orders: 185, customers: 135 },
];

const productData = [
  { name: 'Strawberry Yogurt', sales: 35, color: '#D50000' },
  { name: 'Vanilla Yogurt', sales: 28, color: '#F2EA7E' },
  { name: 'Plain Yogurt', sales: 20, color: '#FFFFFF' },
  { name: 'Mango Yogurt', sales: 12, color: '#FFB74D' },
  { name: 'Blueberry Yogurt', sales: 5, color: '#5E35B1' },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', amount: 240.00, status: 'completed', time: '2 hours ago' },
  { id: '#ORD-002', customer: 'Jane Smith', amount: 180.00, status: 'processing', time: '4 hours ago' },
  { id: '#ORD-003', customer: 'Mike Johnson', amount: 320.00, status: 'shipped', time: '6 hours ago' },
  { id: '#ORD-004', customer: 'Sarah Wilson', amount: 150.00, status: 'pending', time: '8 hours ago' },
  { id: '#ORD-005', customer: 'David Brown', amount: 280.00, status: 'completed', time: '1 day ago' },
];

const lowStockItems = [
  { name: 'Strawberry Yogurt 150ml', stock: 5, threshold: 20, status: 'critical' },
  { name: 'Vanilla Yogurt 1L', stock: 12, threshold: 25, status: 'low' },
  { name: 'Mango Yogurt 500ml', stock: 8, threshold: 15, status: 'critical' },
];

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color, prefix = '', suffix = '' }) => {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const OverviewSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={67000}
          change={8.2}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-green-500"
          prefix="KES "
        />
        <KPICard
          title="Total Orders"
          value={185}
          change={12.5}
          icon={<ShoppingCart size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <KPICard
          title="New Customers"
          value={135}
          change={-2.1}
          icon={<Users size={24} className="text-white" />}
          color="bg-purple-500"
        />
        <KPICard
          title="Products Sold"
          value={342}
          change={15.3}
          icon={<Package size={24} className="text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Trend</h3>
            <div className="flex items-center gap-2">
              <Download size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
              <Eye size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D50000" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D50000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#D50000" 
                strokeWidth={2}
                fill="url(#salesGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Product Performance */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Performance</h3>
            <Filter size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="sales"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color === '#FFFFFF' ? '#E5E7EB' : entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-sm text-primaryRed dark:text-accentGreen hover:underline"
            >
              View All
            </motion.button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">KES {order.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              Low Stock Alerts
            </h3>
            <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
              {lowStockItems.length} items
            </span>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Threshold: {item.threshold} units
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.status)}`}>
                    {item.stock} left
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full mt-4 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
          >
            Restock Items
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewSection; 