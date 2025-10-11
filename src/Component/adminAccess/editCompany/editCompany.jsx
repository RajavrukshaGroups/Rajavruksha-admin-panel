import React, { useEffect, useState, useRef } from "react";
import MainHeader from "../../../MainComp/MainHeader/mainHeader";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const EditCompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // helper toast wrappers
  const showSuccess = (msg) => toast.success(msg || "Success");
  const showError = (msg) => toast.error(msg || "Something went wrong");

  // fetch existing company details
  useEffect(() => {
    let mounted = true;
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/comp-details/${id}`);
        const data = await res.json();
        console.log("data-info", data);

        if (!res.ok || !data.success) {
          const errMsg = data?.message || "Failed to load company details";
          if (!mounted) return;
          setError(errMsg);
          showError(errMsg);
        } else {
          const c = data.data || {};
          if (!mounted) return;
          setCompanyName(c.companyName || "");
          setCompanyAddress(c.companyAddress || "");
          setCompanyEmail(c.companyEmail || "");
          if (c.companyLogo) {
            setPreview(c.companyLogo.url || c.companyLogo);
          }
        }
      } catch (err) {
        console.error("fetch error", err);
        const errMsg = "Server error while fetching company details";
        if (!mounted) return;
        setError(errMsg);
        showError(errMsg);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchCompany();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(f.type)) {
      const errMsg = "Invalid file type. Please select PNG, JPG, GIF, or WEBP.";
      setError(errMsg);
      setFile(null);
      setPreview(null);
      showError(errMsg);
      return;
    }

    setFile(f);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const clearForm = () => {
    setCompanyName("");
    setCompanyAddress("");
    setCompanyEmail("");
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!companyName.trim()) {
      const errMsg = "Company name is required.";
      setError(errMsg);
      showError(errMsg);
      return;
    }
    if (!companyAddress.trim()) {
      const errMsg = "Company address is required.";
      setError(errMsg);
      showError(errMsg);
      return;
    }
    if (!companyEmail.trim()) {
      const errMsg = "Company email is required.";
      setError(errMsg);
      showError(errMsg);
      return;
    }

    const formData = new FormData();
    formData.append("companyName", companyName.trim());
    formData.append("companyAddress", companyAddress.trim());
    formData.append("companyEmail", companyEmail.trim());

    if (file) formData.append("image", file);

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/admin/update-company/${id}`, {
        method: "PUT",
        body: formData,
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        throw new Error("Invalid response from server");
      }

      if (!res.ok || !data.success) {
        const errMsg =
          data?.message || `Failed to update company (status ${res.status})`;
        setError(errMsg);
        showError(errMsg);

        if (res.status === 409) {
          setError(errMsg);
        }
        return;
      } else {
        const successMsg = data?.message || "Company updated successfully.";
        setMessage(successMsg);
        showSuccess(successMsg);

        // Navigate after user sees the success toast
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      }
    } catch (err) {
      console.error("submit error", err);
      const errMsg = err.message || "Server error. Please try again.";
      setError(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <MainHeader />
        <p className="p-6">Loading company details...</p>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div>
      <MainHeader />
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <h1
          className="text-2xl font-semibold mb-4"
          title={companyName || "Edit Company Details"}
        >
          {companyName
            ? `Edit Company Details — ${companyName}`
            : "Edit Company Details"}
        </h1>

        {/* Keep inline boxes optionally — they also show same messages as toasts */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Email
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Address
            </label>
            <textarea
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              disabled={submitting}
            />
            {preview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img
                  src={preview}
                  alt="logo preview"
                  className="max-w-xs max-h-48 border rounded"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Update Company"}
            </button>
            <button
              type="button"
              className="bg-red-500 px-4 py-2 rounded"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default EditCompanyDetails;
