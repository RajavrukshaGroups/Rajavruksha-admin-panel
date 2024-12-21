import React, { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    localStorage.removeItem("isLoggedIn"); // Clear the login state
    window.location.href = "/login"; // Redirect to login page
  }, []);

  return null; // Optionally, you can display a message while redirecting
};

export default Logout;
