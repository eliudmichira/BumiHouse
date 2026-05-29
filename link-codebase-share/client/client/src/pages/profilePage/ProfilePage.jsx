import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setName(currentUser.name || '');
    setAvatar(currentUser.avatar || '');
    setEmail(currentUser.email || '');
  }, [currentUser, navigate]);

  const handleSave = () => {
    updateProfile({ name, avatar });
    setEditing(false);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">My Profile</h2>
      <div className="flex flex-col items-center mb-6">
        <img
          src={avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || email)}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-2 border-2 border-blue-500 object-cover"
        />
        {editing ? (
          <input
            type="text"
            value={avatar}
            onChange={e => setAvatar(e.target.value)}
            placeholder="Avatar URL"
            className="mt-2 px-3 py-2 border rounded w-full"
          />
        ) : null}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Name</label>
        {editing ? (
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-3 py-2 border rounded w-full"
          />
        ) : (
          <div className="text-lg text-gray-900 dark:text-gray-100">{name}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Email</label>
        <div className="text-lg text-gray-900 dark:text-gray-100">{email}</div>
      </div>
      <div className="flex gap-4 mt-6">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded font-medium hover:bg-gray-300 dark:hover:bg-dark-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
} 