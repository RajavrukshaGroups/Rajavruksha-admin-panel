import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the protected content if logged in
};

export default PrivateRoute;
