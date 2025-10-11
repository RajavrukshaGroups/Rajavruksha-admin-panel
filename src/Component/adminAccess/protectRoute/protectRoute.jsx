// ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

/**
 * This route protects admin pages.
 * It expects the regular authentication (isLoggedIn) to be handled
 * by your PrivateRoute wrapper (which is already in your route nesting).
 *
 * Here we specifically check for the admin OTP flag in localStorage:
 *   localStorage.getItem("isAdminLoggedIn")
 *
 * If it's missing we redirect to /otp-verify.
 */
const ProtectedRoute = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const flag = localStorage.getItem("isAdminLoggedIn");
      setIsAdminLoggedIn(!!flag);
    } catch (err) {
      setIsAdminLoggedIn(false);
    } finally {
      setChecked(true);
    }
  }, []);

  if (!checked) return null; // prevent flicker

  return isAdminLoggedIn ? children : <Navigate to="/otp-verify" replace />;
};

export default ProtectedRoute;
