import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Crown,
  User,
  Mail,
  Calendar,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Plus,
  Download,
  Upload
} from 'lucide-react';

const UserManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Load real users from Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        let snapshot;
        try {
          snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        } catch (_) {
          snapshot = await getDocs(collection(db, 'users'));
        }

        let rows = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            // Derive verification from agents collection
            let verified = false;
            try {
              const agentSnap = await getDoc(doc(db, 'agents', d.id));
              verified = agentSnap.exists() ? !!agentSnap.data().verified : false;
            } catch (_) { }

            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            const lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : createdAt;

            return {
              id: d.id,
              email: data.email || '',
              displayName: data.username || data.name || data.email || 'User',
              role: data.role || 'user',
              createdAt,
              lastLogin,
              isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
              profileImage: data.avatar || 'https://i.pravatar.cc/150?img=1',
              phone: data.phone || '',
              properties: typeof data.propertiesCount === 'number' ? data.propertiesCount : 0,
              verified,
            };
          })
        );

        // Fallback: if no users found, build from agents collection
        if (rows.length === 0) {
          const agentsSnap = await getDocs(collection(db, 'agents'));
          rows = agentsSnap.docs.map((d) => {
            const a = d.data();
            const createdAt = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
            return {
              id: d.id,
              email: a.email || '',
              displayName: a.name || a.email || 'Agent',
              role: 'agent',
              createdAt,
              lastLogin: createdAt,
              isActive: true,
              profileImage: a.image || 'https://i.pravatar.cc/150?img=1',
              phone: a.phone || '',
              properties: a.propertiesSold || 0,
              verified: !!a.verified,
            };
          });
        }

        setUsers(rows);
        setFilteredUsers(rows);
      } catch (e) {
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      console.log('Attempting to update role for user:', selectedUser.id);
      console.log('New role:', newRole);
      console.log('Current user:', currentUser?.id, 'Role:', currentUser?.role);

      await updateDoc(doc(db, 'users', selectedUser.id), { role: newRole });

      console.log('Role updated successfully');

      setUsers(users.map(user => user.id === selectedUser.id ? { ...user, role: newRole } : user));

      setShowRoleModal(false);
      setRoleChangeReason('');
      setSelectedUser(null);

      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Failed to update role: ${error.message}\n\nCheck console for details.`);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || deleteConfirmText !== 'DELETE') return;

    // Prevent self-deletion
    if (selectedUser.id === currentUser?.id) {
      alert('You cannot delete your own account!');
      return;
    }

    try {
      console.log('Attempting to delete user:', selectedUser.id);
      console.log('Current user role:', currentUser?.role);
      console.log('Current user ID:', currentUser?.id);

      // Delete user document
      await deleteDoc(doc(db, 'users', selectedUser.id));

      console.log('User deleted successfully');

      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));

      // Close modal and reset
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      setSelectedUser(null);

      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Failed to delete user: ${error.message}\n\nCheck console for details.`);
    }
  };

  const handleUserStatusToggle = async (userId) => {
    const u = users.find(u => u.id === userId);
    if (!u) return;
    const next = !u.isActive;
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: next });
      setUsers(users.map(user => user.id === userId ? { ...user, isActive: next } : user));
    } catch (e) {
      console.error('Error updating user status:', e);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'agent': return <Shield className="w-4 h-4 text-green-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'agent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const userStats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    moderatorUsers: users.filter(u => u.role === 'moderator').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    activeUsers: users.filter(u => u.isActive).length,
    verifiedUsers: users.filter(u => u.verified).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button className="flex justify-center items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Users"
          value={userStats.totalUsers}
          icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Active Users"
          value={userStats.activeUsers}
          icon={<UserCheck className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Verified Users"
          value={userStats.verifiedUsers}
          icon={<Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />}
          color="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="agent">Agent</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table / Mobile Cards */}
      <div className="bg-transparent md:bg-white md:dark:bg-dark-800 md:rounded-xl md:border md:border-gray-200 md:dark:border-dark-700 overflow-hidden">

        {/* Desktop Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.profileImage}
                        alt={user.displayName}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.displayName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.properties}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="p-1.5 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                        title="Edit Role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserStatusToggle(user.id)}
                        className={`p-1.5 rounded ${user.isActive
                          ? "text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                          : "text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          }`}
                        title={user.isActive ? "Deactivate User" : "Activate User"}
                      >
                        {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Hidden on Desktop) */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-700 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    className="h-12 w-12 rounded-full object-cover shrink-0"
                    src={user.profileImage}
                    alt={user.displayName}
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{user.displayName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">Role</span>
                  <div className="flex items-center gap-1.5">
                    {getRoleIcon(user.role)}
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">Status</span>
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${user.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">Properties</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{user.properties}</p>
                </div>
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">Last Login</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{user.lastLogin.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRoleModal(true);
                    }}
                    className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUserStatusToggle(user.id)}
                    className={`p-2 rounded-lg transition-colors ${user.isActive
                      ? "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20 hover:text-orange-900"
                      : "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 hover:text-emerald-900"
                      }`}
                  >
                    {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Change User Role
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedUser.displayName} ({selectedUser.email})</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md border-2 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete User
              </h3>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                You are about to permanently delete:
              </p>
              <div className="mt-3 p-3 bg-white dark:bg-dark-700 rounded border border-red-200 dark:border-red-800">
                <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.displayName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Role: {selectedUser.role} | Properties: {selectedUser.properties}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 