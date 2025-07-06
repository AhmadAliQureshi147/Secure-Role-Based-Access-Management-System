import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignRoles = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // Fetch users and roles from the backend
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('http://127.0.0.1:5000/users');
        const rolesResponse = await axios.get('http://127.0.0.1:5000/roles');
        setUsers(usersResponse.data);
        setRoles(rolesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAssignRole = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/assign-role', {
        user_id: selectedUser,
        role_id: selectedRole,
      });
      alert('Role assigned successfully');
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Assign Role to User</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Select User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Select Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select Role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAssignRole}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
        >
          Assign Role
        </button>
      </div>
    </div>
  );
};

export default AssignRoles;
