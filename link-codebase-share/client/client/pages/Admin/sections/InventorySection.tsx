import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample inventory data
const inventoryData = [
  { 
    id: 1, 
    name: 'Strawberry Yogurt 150ml', 
    sku: 'SY-150', 
    category: 'Yogurt Cups', 
    stock: 245, 
    threshold: 50, 
    price: 120.00, 
    cost: 80.00,
    status: 'in-stock',
    lastRestocked: '2024-01-15',
    supplier: 'Bogani Dairy',
    location: 'Warehouse A'
  },
  { 
    id: 2, 
    name: 'Vanilla Yogurt 500ml', 
    sku: 'VY-500', 
    category: 'Yogurt Bottles', 
    stock: 12, 
    threshold: 25, 
    price: 320.00, 
    cost: 220.00,
    status: 'low-stock',
    lastRestocked: '2024-01-10',
    supplier: 'Bogani Dairy',
    location: 'Warehouse A'
  },
  { 
    id: 3, 
    name: 'Mango Yogurt 1L', 
    sku: 'MY-1L', 
    category: 'Yogurt Bottles', 
    stock: 0, 
    threshold: 20, 
    price: 550.00, 
    cost: 380.00,
    status: 'out-of-stock',
    lastRestocked: '2024-01-05',
    supplier: 'Bogani Dairy',
    location: 'Warehouse B'
  },
  { 
    id: 4, 
    name: 'Plain Yogurt 150ml', 
    sku: 'PY-150', 
    category: 'Yogurt Cups', 
    stock: 89, 
    threshold: 40, 
    price: 110.00, 
    cost: 75.00,
    status: 'in-stock',
    lastRestocked: '2024-01-12',
    supplier: 'Bogani Dairy',
    location: 'Warehouse A'
  },
  { 
    id: 5, 
    name: 'Blueberry Yogurt 500ml', 
    sku: 'BY-500', 
    category: 'Yogurt Bottles', 
    stock: 8, 
    threshold: 15, 
    price: 340.00, 
    cost: 240.00,
    status: 'critical',
    lastRestocked: '2024-01-08',
    supplier: 'Bogani Dairy',
    location: 'Warehouse B'
  }
];

const stockMovementData = [
  { month: 'Jan', inbound: 1200, outbound: 980, net: 220 },
  { month: 'Feb', inbound: 1400, outbound: 1150, net: 250 },
  { month: 'Mar', inbound: 1100, outbound: 1280, net: -180 },
  { month: 'Apr', inbound: 1600, outbound: 1320, net: 280 },
  { month: 'May', inbound: 1350, outbound: 1180, net: 170 },
  { month: 'Jun', inbound: 1500, outbound: 1420, net: 80 },
];

const categoryData = [
  { name: 'Yogurt Cups', value: 45, color: '#D50000' },
  { name: 'Yogurt Bottles', value: 35, color: '#F2EA7E' },
  { name: 'Supplements', value: 15, color: '#4CAF50' },
  { name: 'Accessories', value: 5, color: '#2196F3' },
];

interface InventoryMetricProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const InventoryMetric: React.FC<InventoryMetricProps> = ({ title, value, change, icon, color, prefix = '', suffix = '' }) => {
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
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              <span>{Math.abs(change)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const InventorySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'out-of-stock': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircle size={16} className="text-green-600" />;
      case 'low-stock': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'critical': return <XCircle size={16} className="text-red-600" />;
      case 'out-of-stock': return <XCircle size={16} className="text-gray-600" />;
      default: return <Package size={16} className="text-gray-600" />;
    }
  };

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = inventoryData.length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.stock * item.price), 0);
  const lowStockItems = inventoryData.filter(item => item.status === 'low-stock' || item.status === 'critical').length;
  const outOfStockItems = inventoryData.filter(item => item.status === 'out-of-stock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            <Download size={16} />
            Export
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primaryRed text-white rounded-lg hover:bg-red-700 dark:bg-accentGreen dark:hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Add Product
          </motion.button>
        </div>
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryMetric
          title="Total Products"
          value={totalItems}
          icon={<Package size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <InventoryMetric
          title="Total Value"
          value={totalValue}
          change={8.2}
          icon={<BarChart3 size={24} className="text-white" />}
          color="bg-green-500"
          prefix="KES "
        />
        <InventoryMetric
          title="Low Stock Items"
          value={lowStockItems}
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-yellow-500"
        />
        <InventoryMetric
          title="Out of Stock"
          value={outOfStockItems}
          icon={<XCircle size={24} className="text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Movement</h3>
            <Eye size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockMovementData}>
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
              <Bar dataKey="inbound" fill="#10B981" name="Inbound" />
              <Bar dataKey="outbound" fill="#EF4444" name="Outbound" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Distribution</h3>
            <Filter size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Inventory Table */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Inventory</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Yogurt Cups">Yogurt Cups</option>
                <option value="Yogurt Bottles">Yogurt Bottles</option>
                <option value="Supplements">Supplements</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primaryRed dark:focus:ring-accentGreen focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInventory.map((item, index) => (
                <motion.tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Last restocked: {item.lastRestocked}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900 dark:text-white font-mono text-sm">{item.sku}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.stock}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Threshold: {item.threshold}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900 dark:text-white">KES {item.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-400">{item.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Restock"
                      >
                        <Truck size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
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

export default InventorySection; 