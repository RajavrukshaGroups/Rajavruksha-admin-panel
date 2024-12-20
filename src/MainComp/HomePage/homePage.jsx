import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response=await fetch("https://server.rajavrukshagroup.in/careersSubmittedCount")
        // const response = await fetch("http://localhost:3000/careersSubmittedCount");
        const data = await response.json();
        console.log("career-data", data);
        if (data.success) {
          setCounts(data.counts);
        } else {
          console.error("Failed to fetch counts:", data.message);
        }
      } catch (error) {
        console.error("Error fetching career counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Clear the login state
    alert("You have been logged out successfully!");
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="flex h-screen ">
      {/* Sidebar Wrapper */}
      <div className="w-64 mt-4 ml-4 mr-4 mb-3 md:block hidden">
        <aside className="bg-gray-800 text-white flex flex-col h-full rounded-lg">
          <div className="p-4 text-center text-lg font-bold border-b border-gray-700">
            Admin Dashboard
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-4">
              <li>
                <a href="/careers" className="block px-4 py-2 hover:bg-gray-700 rounded">
                  Career
                </a>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-4 mt-4 mr-4">
        <main className="p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.keys(counts).map((title, index) => (
                title !== "total" && (
                  <div
                    key={index}
                    className="bg-white p-6 shadow rounded-lg cursor-pointer"
                    onClick={() => navigate(`/users/${title.toLowerCase()}`)}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 text-center capitalize">
                      {title} Submitted Count
                    </h2>
                    <p className="mt-2 text-gray-600 text-center font-bold text-4xl">{counts[title]}</p>
                  </div>
                )
              ))}
            </div>
          )}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-28 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md py-2 px-4"
            >
              Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
