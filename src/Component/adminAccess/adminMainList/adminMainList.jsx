// AdminCompaniesList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const API_BASE = "http://localhost:5000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const PlaceholderLogo = ({ size = 80 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex items-center justify-center bg-gray-100 text-gray-400 rounded-md"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7h18M3 12h18M3 17h18"
      />
    </svg>
  </div>
);

const CardSkeleton = () => (
  <div className="animate-pulse p-6 bg-white border rounded-xl shadow-sm">
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  </div>
);

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d)) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AdminCompaniesList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [uploadingEmployees, setUploadingEmployees] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [deletingEmployees, setDeletingEmployees] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchTotalEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/get-companies`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.message || "Failed to fetch companies");
      setCompanies(json.company || []);
    } catch (err) {
      console.error("fetchCompanies error:", err);
      setError(err.message || "Server error");
      toast.error(err.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadEmployees = async () => {
    const confirmUpload = window.confirm(
      "This will upload employee records from Google Sheet. Continue?"
    );
    if (!confirmUpload) return;

    try {
      setUploadingEmployees(true);

      const res = await fetch(`${API_BASE}/bulk/admin/upload-employeeRecords`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Employee upload failed");
      }

      toast.success(data?.message || "Employee records uploaded successfully");

      // Optional: you may refresh companies if needed
      // fetchCompanies();
    } catch (err) {
      console.error("Upload employees error:", err);
      toast.error(err.message || "Failed to upload employees");
    } finally {
      setUploadingEmployees(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this company?");
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE}/admin/delete-company/${id}`, {
        method: "DELETE",
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        throw new Error("Invalid response from server");
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data?.message || `Failed to delete company (status ${res.status})`
        );
      }

      setCompanies((prev) => prev.filter((c) => String(c._id) !== String(id)));
      toast.success(data?.message || "Company deleted successfully!");
    } catch (err) {
      console.error("delete error:", err);
      toast.error(err.message || "Failed to delete company");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => navigate(`/admin/company/edit/${id}`);

  // replace original function
  const handleViewDepartments = (companyId) => {
    navigate(`/admin/companies/${companyId}/departments`);
  };

  const handleViewEmployees = (companyId) => {
    navigate(`/admin/view-employees?companyId=${companyId}`);
  };

  const fetchTotalEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/total-employees`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTotalEmployees(data.totalEmployees);
      }
    } catch (err) {
      console.error("failed to fetch total employees:", err);
    }
  };

  const handleDeleteEmployees = async () => {
    const confirmDelete = window.confirm(
      "this will delete all employee records.continue?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingEmployees(true);
      const res = await fetch(
        `${API_BASE}/bulk/admin/delete-uploaded-employeedata`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "failed to delete employees");
      }
      toast.success(
        `Deleted ${data.deletedCount || 0} employee records successfully`
      );
      fetchTotalEmployees();
    } catch (err) {
      console.error("Delete employees error:", err);
      toast.error(err.message || "Failed to delete employees");
    } finally {
      setDeletingEmployees(false);
    }
  };

  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage company profiles — add, edit or remove companies.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUploadEmployees}
            disabled={uploadingEmployees}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Upload Employees"
          >
            {uploadingEmployees ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                  />
                </svg>
                Upload Employees
              </>
            )}
          </button>

          {totalEmployees !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border">
                Total Employees: <strong>{totalEmployees}</strong>
              </span>

              <button
                onClick={handleDeleteEmployees}
                disabled={deletingEmployees}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Delete Employees"
              >
                {deletingEmployees ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Delete Employees
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate("/admin/company")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
            aria-label="Add Company"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Company
          </button>

          <button
            onClick={() => fetchCompanies()}
            className="inline-flex items-center gap-2 bg-blue border border-gray-300 hover:bg-blue-500 px-4 py-2.5 rounded-lg"
            aria-label="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v6h6M20 20v-6h-6"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Error: {error}</span>
            </div>
            <button
              onClick={fetchCompanies}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl shadow-sm">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No companies yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first company profile.
            </p>
            <button
              onClick={() => navigate("/admin/company")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add your first company
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((c) => (
            <div
              key={c._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full"
            >
              {/* Header Section */}
              <div className="flex gap-4 items-start mb-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border">
                  {c.companyLogo && (c.companyLogo.url || c.companyLogo) ? (
                    <img
                      src={
                        c.companyLogo.url ? c.companyLogo.url : c.companyLogo
                      }
                      alt={c.companyName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "";
                      }}
                    />
                  ) : (
                    <PlaceholderLogo size={48} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    title={c.companyName}
                    className="text-lg font-semibold text-gray-900 break-words line-clamp-2 mb-2"
                  >
                    {c.companyName}
                  </h3>

                  <p className="text-sm text-gray-600 break-words line-clamp-2 mb-3">
                    {c.companyAddress}
                  </p>

                  {c.createdAt && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Added {c.createdAt ? formatDate(c.createdAt) : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="mt-auto space-y-3">
                {/* Primary Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDepartments(c._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    aria-label={`View departments for ${c.companyName}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7h18M3 12h18M3 17h18"
                      />
                    </svg>
                    Departments
                  </button>

                  {/* <button
                    onClick={() => handleViewEmployees(c._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    aria-label={`View employees for ${c.companyName}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 11V7a4 4 0 10-8 0v4M5 20h14a1 1 0 001-1v-6a3 3 0 00-3-3H7a3 3 0 00-3 3v6a1 1 0 001 1z"
                      />
                    </svg>
                    Employees
                  </button> */}
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                    aria-label={`Edit ${c.companyName}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536M9 11l6 6L21 11l-6-6-6 6z"
                      />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete ${c.companyName}`}
                  >
                    {deletingId === c._id ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                        </svg>
                        Deleting
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesList;
