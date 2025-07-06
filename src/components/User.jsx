import React from 'react';
import { useNavigate } from 'react-router-dom';

const User = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Instead of auth.signOut(), just navigate to the login page
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to the User Page</h1>
      <button 
        onClick={handleLogout} 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
      >
        Log Out
      </button>
    </div>
  );
};

export default User;
