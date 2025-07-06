import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    // Fetch roles and permissions from the backend
    const fetchData = async () => {
      try {
        const rolesResponse = await axios.get('http://127.0.0.1:5000/roles');
        const permissionsResponse = await axios.get('http://127.0.0.1:5000/permissions');
        setRoles(rolesResponse.data);
        setPermissions(permissionsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAssignPermissions = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/assign-permissions', {
        role_id: selectedRole,
        permissions: selectedPermissions,
      });
      alert('Permissions assigned successfully');
    } catch (error) {
      console.error('Error assigning permissions:', error);
      alert('Failed to assign permissions');
    }
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Manage Permissions for Roles</h2>
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Select Permissions</label>
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center">
              <input
                type="checkbox"
                value={permission.id}
                onChange={() => handlePermissionChange(permission.id)}
                checked={selectedPermissions.includes(permission.id)}
                className="mr-2"
              />
              <label>{permission.permission_name}</label>
            </div>
          ))}
        </div>
        <button
          onClick={handleAssignPermissions}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
        >
          Assign Permissions
        </button>
      </div>
    </div>
  );
};

export default ManagePermissions;
