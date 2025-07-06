import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Employee = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user info when the component mounts
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('userId'); // Use stored userId
        const response = await axios.get(`http://127.0.0.1:5000/employee/${userId}`);
        console.log("Fetched user data:", response.data); // Debugging log
        setUser(response.data);
        setFormData({ email: response.data.email, name: response.data.name });
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    // Clear any stored user data, e.g., user ID, tokens, etc.
    localStorage.removeItem('userId');
    // Redirect to the login page
    navigate('/');
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({ email: user.email, name: user.name });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId'); // Use stored userId
      const response = await axios.put(`http://127.0.0.1:5000/employee/${userId}`, formData);
      console.log("Updated user data:", response.data); // Debugging log
      setUser(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update user data', error);
    }
  };

  console.log("Rendering Employee component with user:", user); // Debugging log

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleLogout} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Log Out
        </button>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-4xl font-bold text-gray-700 mb-4">Employee Dashboard</h1>
        {user ? (
          <div className="w-full max-w-md">
            {!editMode ? (
              <div>
                <p className="text-xl mb-4">Name: {user.name}</p>
                <p className="text-xl mb-4">Email: {user.email}</p>
                <button 
                  onClick={handleEdit} 
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:bg-green-600"
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default Employee;
