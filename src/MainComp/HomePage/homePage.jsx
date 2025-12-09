// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// const API_BASE = "http://localhost:5000"; // change if your backend is elsewhere
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // OTP modal + flow state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${API_BASE}/careersSubmittedCount`);
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

  // countdown timer for OTP expiry/resend UI
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Clear the login state
    alert("You have been logged out successfully!");
    navigate("/login"); // Redirect to the login page
  };

  // send OTP (server will fallback to ADMIN_EMAIL if contact not provided)
  // const sendOtp = async (contact) => {
  //   try {
  //     setOtpSending(true);
  //     setMessage("");
  //     const res = await fetch(`${API_BASE}/admin/send-otp`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(contact ? { contact } : {}),
  //     });
  //     const data = await res.json();
  //     if (data.success) {
  //       setShowOtpModal(true);
  //       setOtpInput("");
  //       setMessage("OTP sent. Check your email.");
  //       setCountdown(120); // show 2 minute expiry countdown to user
  //     } else {
  //       setMessage(data.message || "Failed to send OTP");
  //     }
  //   } catch (err) {
  //     console.error("sendOtp error:", err);
  //     setMessage("Error sending OTP. Check server.");
  //   } finally {
  //     setOtpSending(false);
  //   }
  // };

  const sendOtp = async (contact) => {
    navigate("/admin"); // navigate to AdminMain
  };

  // verify OTP
  // const verifyOtp = async (contact) => {
  //   try {
  //     setOtpVerifying(true);
  //     setMessage("");
  //     const res = await fetch(`${API_BASE}/admin/verify-otp`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(
  //         contact ? { contact, otp: otpInput } : { otp: otpInput }
  //       ),
  //     });
  //     const data = await res.json();
  //     if (data.success) {
  //       localStorage.setItem("isLoggedIn", "true");
  //       setShowOtpModal(false);
  //       alert("OTP verified. Welcome!");
  //       navigate("/admin"); // navigate to AdminMain
  //     } else {
  //       setMessage(data.message || "OTP verification failed");
  //     }
  //   } catch (err) {
  //     console.error("verifyOtp error:", err);
  //     setMessage("Error verifying OTP. Check server.");
  //   } finally {
  //     setOtpVerifying(false);
  //   }
  // };

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
                <a
                  href="/careers"
                  className="block px-4 py-2 hover:bg-gray-700 rounded"
                >
                  Career
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  className="block px-4 py-2 hover:bg-gray-700 rounded"
                >
                  Employee Management
                </a>
              </li>

              {/* Admin button — sends OTP to the admin email configured on server */}
              {/* <li>
                <button
                  onClick={() => sendOtp()} // no contact => server uses ADMIN_EMAIL env
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
                >
                  Employee Management
                </button>
              </li> */}
            </ul>
          </nav>
        </aside>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-4 mt-4 mr-4">
        <main className="p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Dashboard Overview
          </h1>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.keys(counts).map(
                (title, index) =>
                  title !== "total" && (
                    <div
                      key={index}
                      className="bg-white p-6 shadow rounded-lg cursor-pointer"
                      onClick={() => navigate(`/users/${title.toLowerCase()}`)}
                    >
                      <h2 className="text-xl font-semibold text-gray-800 text-center capitalize">
                        {title} Submitted Count
                      </h2>
                      <p className="mt-2 text-gray-600 text-center font-bold text-4xl">
                        {counts[title]}
                      </p>
                    </div>
                  )
              )}
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

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-3">Enter OTP</h3>
            <p className="text-sm text-gray-600 mb-4">
              We sent a 6-digit OTP to the admin email configured on the server.
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={otpInput}
              onChange={(e) =>
                setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter OTP"
              className="w-full p-2 border rounded mb-3"
            />

            {message && <p className="text-sm text-red-600 mb-2">{message}</p>}

            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => verifyOtp()}
                  disabled={otpVerifying || otpInput.length < 6}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2 disabled:opacity-60"
                >
                  {otpVerifying ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpInput("");
                    setMessage("");
                  }}
                  className="bg-gray-200 px-4 py-2 rounded ml-2"
                >
                  Cancel
                </button>
              </div>

              <div className="text-sm">
                {countdown > 0 ? (
                  <span>
                    Expires in {Math.floor(countdown / 60)}:
                    {String(countdown % 60).padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    className="text-blue-600 underline text-sm"
                    onClick={() => sendOtp()}
                    disabled={otpSending}
                  >
                    {otpSending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
