import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalContext } from '../context/context';

const Landing = () => {
  const{loggedInUser}=useLocalContext()
  console.log(loggedInUser);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-700 mb-4">Welcome to Our Application</h1>
      <div className="space-x-4">
        <Link
          to="/signup"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Sign Up
        </Link>
        <Link
          to="/signin"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Landing;
