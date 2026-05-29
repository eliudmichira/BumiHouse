import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const TrendChart = ({ data, labels, height = 300, type = 'area', title }) => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Handle different data structures
  let chartData = [];
  
  if (data && Array.isArray(data)) {
    // New format: array of objects with revenue, views, etc.
    if (data.length > 0 && typeof data[0] === 'object' && 'revenue' in data[0]) {
      chartData = data;
    } else {
      // Old format: array of datasets with label and data
      chartData = labels.map((label, index) => {
        const dataPoint = { name: label };
        data.forEach(dataset => {
          if (dataset.data && dataset.data[index] !== undefined) {
            dataPoint[dataset.label] = dataset.data[index];
          }
        });
        return dataPoint;
      });
    }
  }

  // If no data, return empty chart
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl">
          <p className="text-gray-900 dark:text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get data keys for rendering (excluding 'name')
  const dataKeys = Object.keys(chartData[0] || {}).filter(key => key !== 'name');

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
          <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          {dataKeys.map((key, index) => (
            <linearGradient key={key} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
              <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={`url(#gradient${index})`}
            strokeWidth={3}
            dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendChart; 