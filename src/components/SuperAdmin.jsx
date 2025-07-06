import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', designation: '', password: '', role: '' });
  const [data, setData] = useState({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ userId: null, newPassword: '' });
  const [permissionsData, setPermissionsData] = useState({}); // Updated to store permissions per user
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch super admin data
  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/superadmin', {
        method: 'GET',
      });
      const jsondata = await response.json();
      setData(jsondata);
    } catch (error) {
      console.log('Error fetching super admin data:', error);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/users', {
        method: 'GET',
      });
      const usersData = await response.json();
      setUsers(usersData);
      const initialPermissions = usersData.reduce((acc, user) => {
        acc[user.id] = user.permission || '';
        return acc;
      }, {});
      setPermissionsData(initialPermissions);
    } catch (error) {
      console.log('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.designation || !newUser.password || !newUser.role) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({ username: '', email: '', designation: '', password: '', role: '' });
        fetchUsers();
      } else {
        console.error('Error adding user:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (selectedUser && selectedUser.id) {
      if (!selectedUser.username || !selectedUser.email || !selectedUser.designation || !selectedUser.role) {
        alert("Please fill in all fields");
        return;
      }
      try {
        const response = await fetch(`http://127.0.0.1:5000/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedUser),
        });

        if (response.ok) {
          setSelectedUser(null);
          fetchUsers();
        } else {
          console.error('Error updating user:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRedirect = () => {
    window.location.href = 'https://127.0.0.1:5001'; // Replace with your desired URL
  };

  const handleOpenChangePasswordModal = (userId) => {
    setPasswordData({ userId, newPassword: '' });
    setShowChangePasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword) {
      alert("Please enter a new password");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${passwordData.userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });

      if (response.ok) {
        setShowChangePasswordModal(false);
        fetchUsers();
      } else {
        console.error('Error changing password:', response.statusText);
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleAssignPermission = async (userId) => {
    const newPermission = permissionsData[userId];
    try {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}/permissions`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ permission_id: newPermission }),  // Ensure this matches your backend's expected field
        });

        if (response.ok) {
            fetchUsers();  // Ensure this function is defined and correctly fetches updated user data
        } else {
            console.error('Error assigning permission:', response.statusText);
        }
    } catch (error) {
        console.error('Error assigning permission:', error);
    }
};


  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex-grow p-6">
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>
            <input
              type="text"
              placeholder="Search Users"
              value={search}
              onChange={handleSearch}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200">Username</th>
                  <th className="py-2 px-4 border-b border-gray-200">Email</th>
                  <th className="py-2 px-4 border-b border-gray-200">Designation</th>
                  <th className="py-2 px-4 border-b border-gray-200">Role</th>
                  <th className="py-2 px-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b border-gray-200">{user.username}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{user.designation}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{user.role}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleOpenChangePasswordModal(user.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Change Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser}>
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="mb-2 p-2 border border-gray-300 rounded w-full"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mb-2 p-2 border border-gray-300 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={newUser.designation}
                  onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  className="mb-2 p-2 border border-gray-300 rounded w-full"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mb-2 p-2 border border-gray-300 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add User
                </button>
              </form>
            </div>
            {selectedUser && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Edit User</h3>
                <form onSubmit={handleUpdateUser}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={selectedUser.designation}
                    onChange={(e) => setSelectedUser({ ...selectedUser, designation: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Update User
                  </button>
                </form>
              </div>
            )}
          </div>
        );
      case 'monitorFiles':
        return (
          <div className="flex-grow p-6">
            <h2 className="text-xl font-bold mb-4">Monitor Files</h2>
            {/* Content for Monitor Files */}
            <button onClick={handleRedirect} className="bg-green-500 text-white px-4 py-2 rounded">
              Go to Redirect URL
            </button>
          </div>
        );
      case 'assignPermissions':
        return (
          <div className="flex-grow p-6">
            <h2 className="text-xl font-bold mb-4">Assign Permissions</h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200">Username</th>
                  <th className="py-2 px-4 border-b border-gray-200">Email</th>
                  <th className="py-2 px-4 border-b border-gray-200">Role</th>
                  <th className="py-2 px-4 border-b border-gray-200">Permission</th>
                  <th className="py-2 px-4 border-b border-gray-200">Permission Assigned</th>
                  <th className="py-2 px-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="py-2 px-4 border-b border-gray-200">{user.username}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{user.role}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{user.permissions}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <input
                        type="text"
                        value={permissionsData[user.id] || ''}
                        onChange={(e) => setPermissionsData({ ...permissionsData, [user.id]: e.target.value })}
                        className="p-2 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        onClick={() => handleAssignPermission(user.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Assign Permission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-800 text-white min-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Super Admin</h1>
        </div>
        <div className="flex flex-col">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-4 text-left ${activeTab === 'dashboard' ? 'bg-gray-700' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('monitorFiles')}
            className={`p-4 text-left ${activeTab === 'monitorFiles' ? 'bg-gray-700' : ''}`}
          >
            Monitor Files
          </button>
          <button
            onClick={() => setActiveTab('assignPermissions')}
            className={`p-4 text-left ${activeTab === 'assignPermissions' ? 'bg-gray-700' : ''}`}
          >
            Assign Permissions
          </button>
          <button
            onClick={handleLogout}
            className="p-4 text-left mt-auto bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex-grow">
        {renderContent()}
      </div>
      {showChangePasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
            <button
              onClick={handleChangePassword}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Change Password
            </button>
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
