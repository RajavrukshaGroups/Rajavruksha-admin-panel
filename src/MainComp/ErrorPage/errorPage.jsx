import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-semibold text-red-600">404</h1>
        <p className="text-lg mt-4">Oops! The page you're looking for doesn't exist.</p>
        <p className="mt-4">You can go back to the <Link to="/" className="text-blue-500 hover:underline">home page</Link>.</p>
      </div>
    </div>
  );
};

export default ErrorPage;
