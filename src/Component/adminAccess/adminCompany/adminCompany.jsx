// AdminCompany.jsx
import React, { useState } from "react";
import MainHeader from "../../../MainComp/MainHeader/mainHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// const API_BASE = "http://localhost:5000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const AdminCompany = () => {
  const navigate = useNavigate(); // optional: navigate after success
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }

    // basic client-side validation for image mime type
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(f.type)) {
      setError(
        "Invalid file type. Please select a PNG, JPG, GIF or WEBP image."
      );
      setFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    setFile(f);

    // show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const resetForm = () => {
    setCompanyName("");
    setCompanyAddress("");
    setCompanyEmail("");
    setFile(null);
    setPreview(null);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // client-side validation
    if (!companyName.trim()) {
      setError("Company name is required.");
      toast.error("Company name is required.");
      return;
    }
    if (!companyAddress.trim()) {
      setError("Company address is required.");
      toast.error("Company address is required.");
      return;
    }
    if (!companyEmail.trim()) {
      setError("Company email is required.");
      toast.error("Company email is required.");
      return;
    }
    if (!file) {
      setError("Company logo is required.");
      toast.error("Company logo is required.");
      return;
    }

    // send multipart/form-data
    const formData = new FormData();
    formData.append("companyName", companyName.trim());
    formData.append("companyAddress", companyAddress.trim());
    formData.append("companyEmail", companyEmail.trim());

    // important: backend expects field name "image"
    formData.append("image", file);

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/admin/add-company`, {
        method: "POST",
        body: formData,
        // NOTE: DO NOT set Content-Type header when sending FormData — the browser will set the correct boundary.
        // Add credentials or auth headers here if your backend requires them.
      });

      // try to parse JSON (catch if invalid)
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (!res.ok) {
        const errMsg = data?.message || data?.error || "Failed to add company.";
        setError(errMsg);
        toast.error(errMsg);
      } else {
        const successMsg = data?.message || "Company added successfully.";
        setMessage(successMsg);
        toast.success(successMsg);

        // reset form
        resetForm();

        // navigate to /admin after success (toast will still show)
        navigate("/admin");
      }
    } catch (err) {
      console.error("submit error", err);
      const errMsg = "Server error. Please try again later.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <MainHeader />

      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Add Company</h1>

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
              placeholder="Enter company name"
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
              placeholder="Enter company email"
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
              className="w-full p-2 border rounded"
              placeholder="Enter company address"
              rows={3}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo (PNG / JPG / GIF / WEBP)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block"
              disabled={submitting}
            />

            {preview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img
                  src={preview}
                  alt="preview"
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
              {submitting ? "Submitting..." : "Add Company"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCompany;
