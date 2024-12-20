import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //     // Clear the login state from localStorage
  //     localStorage.removeItem('isLoggedIn');
  //     alert('You have been logged out successfully!');
  //     navigate('/login'); // Redirect to the login page
  // }, [navigate]);
  useEffect(() => {
    localStorage.removeItem("isLoggedIn"); // Clear the login state
    window.location.href = "/login"; // Redirect to login page
  }, []);

  return null; // Optionally, you can display a message while redirecting
};

export default Logout;
