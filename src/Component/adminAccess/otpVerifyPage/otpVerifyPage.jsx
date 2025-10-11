// OtpVerifyPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const [otpInput, setOtpInput] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const sendOtp = async () => {
    try {
      setOtpSending(true);
      setMessage("");
      const res = await fetch(`${API_BASE}/admin/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setMessage("OTP sent to your admin email.");
        setCountdown(120);
      } else {
        setMessage(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("sendOtp error:", err);
      setMessage("Error sending OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setOtpVerifying(true);
      setMessage("");
      const res = await fetch(`${API_BASE}/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpInput }),
      });
      const data = await res.json();
      if (data.success) {
        // Set a separate flag for admin access
        localStorage.setItem("isAdminLoggedIn", "true");

        // OPTIONAL: you can also set expiry timestamp if you want:
        // localStorage.setItem("isAdminLoggedInUntil", String(Date.now() + 30*60*1000)); // 30 minutes

        navigate("/admin", { replace: true });
      } else {
        setMessage(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("verifyOtp error:", err);
      setMessage("Error verifying OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white rounded-lg p-6 w-96 shadow">
        <h3 className="text-lg font-semibold mb-3">Enter OTP</h3>
        <p className="text-sm text-gray-600 mb-4">
          We sent a 6-digit OTP to your admin email.
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
          <button
            onClick={verifyOtp}
            disabled={otpVerifying || otpInput.length < 6}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {otpVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          {countdown > 0 ? (
            <span className="text-sm">
              Expires in {Math.floor(countdown / 60)}:
              {String(countdown % 60).padStart(2, "0")}
            </span>
          ) : (
            <button
              className="text-blue-600 underline text-sm"
              onClick={sendOtp}
              disabled={otpSending}
            >
              {otpSending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
