import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', designation: '', password: '', role: '' });
  const [data, setData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch admin data
  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/admin', {
        method: 'GET',
      });
      const jsondata = await response.json();
      setData(jsondata);
    } catch (error) {
      console.log('Error fetching admin data:', error);
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
    } catch (error) {
      console.log('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (location.pathname === '/admin') {
      fetchData();
    }
  }, [location.pathname]);

  useEffect(() => {
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
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="designation">
                    Designation
                  </label>
                  <input
                    id="designation"
                    type="text"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                    placeholder="Enter designation"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                    Role
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    placeholder="Enter role"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Add User
                </button>
              </form>
            </div>
            {selectedUser && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Edit User</h3>
                <form onSubmit={handleUpdateUser}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={selectedUser.username}
                      onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                      placeholder="Enter username"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      placeholder="Enter email"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="designation">
                      Designation
                    </label>
                    <input
                      id="designation"
                      type="text"
                      value={selectedUser.designation}
                      onChange={(e) => setSelectedUser({ ...selectedUser, designation: e.target.value })}
                      placeholder="Enter designation"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                      Role
                    </label>
                    <input
                      id="role"
                      type="text"
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                      placeholder="Enter role"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Update User
                  </button>
                </form>
              </div>
            )}
          </div>
        );
      case 'monitorFiles':
        handleRedirect();
        return null; // You can choose to return null or some placeholder content if needed
      default:
        return <div className="flex-grow p-6">Select a tab to view content</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold">Admin Panel</div>
        <div className="flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`block p-4 ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('monitorFiles')} 
            className={`block p-4 ${activeTab === 'monitorFiles' ? 'bg-gray-700' : 'hover:bg-gray-600'}`}
          >
            Monitor Files
          </button>
        </div>
        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex-grow bg-gray-100">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
