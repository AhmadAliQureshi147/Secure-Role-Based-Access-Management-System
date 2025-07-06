import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Replace URL with your actual endpoint if different
      const response = await axios.post('http://127.0.0.1:5000/signin', { email, password });
      const { userRole } = response.data;

      // Navigate based on user role
      if (userRole) {
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'employee':
            navigate('/employee');
            break;
          case 'user':
            navigate('/user');
            break;
          case 'super_admin':
            navigate('/super_admin'); // Route for super_admin
            break;
          default:
            setError('Invalid user role');
        }
      } else {
        // Handle case where userRole is not defined in the response
        setError('Invalid user role received from the server');
      }
    } catch (error) {
      // Handle specific error messages from server response
      setError(error.response?.data?.error || 'Sign-in failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
