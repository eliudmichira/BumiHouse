import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Filter,
  Download,
  Search,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample sales data
const salesTrendData = [
  { date: '2024-01-01', sales: 12000, orders: 45, customers: 32 },
  { date: '2024-01-02', sales: 15000, orders: 52, customers: 38 },
  { date: '2024-01-03', sales: 18000, orders: 61, customers: 45 },
  { date: '2024-01-04', sales: 14000, orders: 48, customers: 35 },
  { date: '2024-01-05', sales: 22000, orders: 73, customers: 52 },
  { date: '2024-01-06', sales: 19000, orders: 65, customers: 48 },
  { date: '2024-01-07', sales: 25000, orders: 82, customers: 61 },
];

const productSalesData = [
  { product: 'Strawberry Yogurt', sales: 45000, units: 1250, growth: 12.5 },
  { product: 'Vanilla Yogurt', sales: 38000, units: 1050, growth: 8.3 },
  { product: 'Plain Yogurt', sales: 32000, units: 980, growth: -2.1 },
  { product: 'Mango Yogurt', sales: 28000, units: 850, growth: 15.7 },
  { product: 'Blueberry Yogurt', sales: 22000, units: 720, growth: 22.4 },
];

const recentSales = [
  { id: 'TXN-001', customer: 'John Doe', amount: 240.00, products: 3, time: '2 min ago', status: 'completed' },
  { id: 'TXN-002', customer: 'Jane Smith', amount: 180.00, products: 2, time: '5 min ago', status: 'processing' },
  { id: 'TXN-003', customer: 'Mike Johnson', amount: 320.00, products: 4, time: '8 min ago', status: 'completed' },
  { id: 'TXN-004', customer: 'Sarah Wilson', amount: 150.00, products: 1, time: '12 min ago', status: 'completed' },
  { id: 'TXN-005', customer: 'David Brown', amount: 280.00, products: 3, time: '15 min ago', status: 'refunded' },
];

interface SalesMetricProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const SalesMetric: React.FC<SalesMetricProps> = ({ title, value, change, icon, color, prefix = '', suffix = '' }) => {
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
            {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            <span>{Math.abs(change)}% from last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const SalesSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('sales');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'refunded': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredSales = recentSales.filter(sale =>
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your sales performance and revenue trends</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Export
          </motion.button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesMetric
          title="Total Revenue"
          value={125000}
          change={12.5}
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-green-500"
          prefix="KES "
        />
        <SalesMetric
          title="Total Orders"
          value={1847}
          change={8.3}
          icon={<ShoppingCart size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <SalesMetric
          title="Average Order Value"
          value={67.75}
          change={-2.1}
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-purple-500"
          prefix="KES "
        />
        <SalesMetric
          title="Conversion Rate"
          value="3.2"
          change={5.7}
          icon={<Users size={24} className="text-white" />}
          color="bg-orange-500"
          suffix="%"
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
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="sales">Sales</option>
                <option value="orders">Orders</option>
                <option value="customers">Customers</option>
              </select>
              <Eye size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D50000" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D50000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [
                  name === 'sales' ? `KES ${value.toLocaleString()}` : value.toLocaleString(),
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
            <Filter size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
          </div>
          <div className="space-y-4">
            {productSalesData.map((product, index) => (
              <motion.div
                key={product.product}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{product.product}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.units} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">KES {product.sales.toLocaleString()}</p>
                  <div className={`flex items-center text-xs ${product.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {product.growth >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(product.growth)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Sales Table */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sales</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-sm text-primaryRed dark:text-accentGreen hover:underline"
              >
                View All
              </motion.button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white">{sale.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900 dark:text-white">{sale.customer}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900 dark:text-white">KES {sale.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">{sale.products} items</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{sale.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <MoreHorizontal size={16} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SalesSection; 