// src/Component/Login/login.jsx  (or wherever your Login component lives)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/RRPL_Horizontal.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./login.css";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpEmail, setOtpEmail] = useState(""); // email OTP was sent to (for verification)
  const [loading, setLoading] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  // call login endpoint that sends OTP on success
  const Signin = async (emailArg, passwordArg) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailArg, password: passwordArg }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = json?.message || `Login failed (${res.status})`;
        toast.error(msg);
        setLoading(false);
        return { ok: false, message: msg };
      }

      // Expect server to respond { success: true, otpSent: true, email: "..." }
      if (json?.success && json?.otpSent) {
        toast.success("OTP sent to admin email. Please check your mailbox.");
        setOtpEmail(json.email || emailArg);
        setShowOtpModal(true);
        setLoading(false);
        return { ok: true };
      }

      // fallback: if server returns success without otpSent, treat as final login
      if (json?.success) {
        localStorage.setItem("isLoggedIn", "true");
        toast.success("Login successful");
        navigate("/");
        return { ok: true };
      }

      const msg = json?.message || "Login failed";
      toast.error(msg);
      setLoading(false);
      return { ok: false, message: msg };
    } catch (err) {
      console.error("Signin error:", err);
      toast.error("Network error. Please try again.");
      setLoading(false);
      return { ok: false, message: err.message };
    }
  };

  // OTP verify
  const verifyOtp = async () => {
    if (!otpValue || otpValue.trim().length === 0) {
      toast.error("Please enter the OTP.");
      return;
    }
    setOtpSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail || email,
          otp: otpValue.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.message || `OTP verification failed (${res.status})`);
        setOtpSubmitting(false);
        return;
      }

      if (json?.success) {
        toast.success("OTP verified — logged in");
        // set login flag
        localStorage.setItem("isLoggedIn", "true");
        setShowOtpModal(false);
        // navigate to root (or target route if you store it)
        const targetRoute = localStorage.getItem("targetRoute") || "/";
        navigate(targetRoute);
      } else {
        toast.error(json?.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("verifyOtp error", err);
      toast.error("Network error while verifying OTP.");
    } finally {
      setOtpSubmitting(false);
    }
  };

  // resend OTP (calls Signin again)
  const resendOtp = async () => {
    if (!email || !password) {
      toast.error("Please re-enter credentials to resend OTP.");
      return;
    }
    setLoading(true);
    const resp = await Signin(email, password);
    if (resp.ok) {
      toast.info("OTP resent (check your email).");
    }
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in the email and password");
      return;
    }
    await Signin(email, password);
  };

  return (
    <div className="bg-sky-100 flex justify-center items-center min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
      />
      <div className="w-1/2 h-screen hidden lg:block">
        <img
          src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826"
          alt="Placeholder"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
        <div className="logo text-center mb-4">
          <img src={logo} alt="logo" className="mx-auto" />
        </div>

        <h1 className="text-4xl font-semibold mb-4 text-center">Admin Login</h1>

        <form onSubmit={handleSubmit} method="POST">
          <div className="mb-4 bg-sky-100">
            <label htmlFor="email" className="block text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-800">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="bg-red-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Login"}
          </button>
        </form>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowOtpModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-[92%] max-w-md p-6 z-50">
            <h3 className="text-lg font-semibold mb-3">Enter OTP</h3>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a one-time password (OTP) to{" "}
              <strong>{otpEmail}</strong>. It expires in 5 minutes.
            </p>

            <input
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="Enter OTP"
              disabled={otpSubmitting}
            />

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                }}
                className="px-3 py-2 rounded border bg-red-500"
                disabled={otpSubmitting}
              >
                Cancel
              </button>

              <button
                onClick={resendOtp}
                className="px-3 py-2 rounded border bg-blue-500"
                disabled={loading || otpSubmitting}
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>

              <button
                onClick={verifyOtp}
                className="px-3 py-2 rounded bg-green-600 text-white"
                disabled={otpSubmitting}
              >
                {otpSubmitting ? "Verifying..." : "Verify & Login"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
