// ViewAdminDept.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../../../MainComp/MainHeader/mainHeader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const ViewAdminDept = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal/ form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptInput, setDeptInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);

  // editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);

  // delete state
  const [deletingId, setDeletingId] = useState(null);

  // fetchDepartments: moved out so we can call after creates/updates/deletes
  const fetchDepartments = useCallback(async () => {
    if (!companyId) {
      setError("Missing company id in the route");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments`
      );
      // try/catch for json parse
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.message || `Failed to fetch departments (${res.status})`;
        setError(msg);
        // toast.error(msg);
        setLoading(false);
        return;
      }

      setCompany(json.company || null);
      setDepartments(Array.isArray(json.departments) ? json.departments : []);
    } catch (err) {
      console.error("fetch departments error:", err);
      const msg = err.message || "Server error while fetching departments";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // initial load
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Open modal for adding
  const openAddModal = () => {
    setFormError(null);
    setDeptInput("");
    setIsEditing(false);
    setEditingDeptId(null);
    setIsModalOpen(true);
  };

  // Open modal for editing and prefill
  const openEditModal = (dept) => {
    setFormError(null);
    setDeptInput(dept.department || "");
    setIsEditing(true);
    setEditingDeptId(dept._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (creating) return; // don't close while request in progress
    setIsModalOpen(false);
    setFormError(null);
    setDeptInput("");
    setCreating(false);
    setIsEditing(false);
    setEditingDeptId(null);
  };

  // Add department handler
  const handleCreateDept = async (e) => {
    e?.preventDefault();
    setFormError(null);

    const name = (deptInput || "").trim();
    if (!name) {
      setFormError("Department name is required.");
      return;
    }

    try {
      setCreating(true);

      const res = await fetch(`${API_BASE}/admin/create-dept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, department: name }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverMsg =
          json?.message ||
          (res.status === 409
            ? "Department already exists for this company"
            : `Failed to create department (${res.status})`);
        setFormError(serverMsg);
        toast.error(serverMsg);
        return;
      }

      // Prefer server-provided new department object; otherwise construct one
      const newDept =
        json.data ||
        (json.department
          ? json.department
          : {
              _id: json._id || `${Date.now()}`, // fallback id
              department: name,
              company: companyId,
            });

      // update local list safely (avoid duplicates by _id or name)
      setDepartments((prev) => {
        // avoid duplicate by id
        if (prev.some((d) => String(d._id) === String(newDept._id)))
          return prev;
        // avoid duplicate by name (case-insensitive)
        if (
          prev.some(
            (d) =>
              String(d.department).toLowerCase() === String(name).toLowerCase()
          )
        )
          return prev;
        const next = [...prev, newDept].sort((a, b) =>
          String(a.department).localeCompare(String(b.department))
        );
        return next;
      });

      toast.success(json.message || "Department created");

      // Clear input and close modal (you said "add and close" — closing makes list reflect immediately)
      setDeptInput("");
      setFormError(null);
      setIsModalOpen(false);

      // Re-fetch from server to make sure list is authoritative (handles ID differences / server constraints)
      // This guarantees what you see in UI matches server.
      await fetchDepartments();
    } catch (err) {
      console.error("create dept error", err);
      const msg = err.message || "Server error while creating department";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // Update department handler
  const handleUpdateDept = async (e) => {
    e?.preventDefault();
    setFormError(null);

    const name = (deptInput || "").trim();
    if (!name) {
      setFormError("Department name is required.");
      return;
    }
    if (!editingDeptId) {
      setFormError("Invalid department selected for editing.");
      return;
    }

    try {
      setCreating(true);

      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${editingDeptId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department: name }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const serverMsg =
          json?.message ||
          (res.status === 409
            ? "Department already exists for this company"
            : `Failed to update department (${res.status})`);
        setFormError(serverMsg);
        toast.error(serverMsg);
        return;
      }

      const updatedDept = json.data || {
        _id: editingDeptId,
        department: name,
        company: companyId,
      };

      // Update local list
      setDepartments((prev) =>
        prev
          .map((d) =>
            String(d._id) === String(editingDeptId) ? updatedDept : d
          )
          .sort((a, b) =>
            String(a.department).localeCompare(String(b.department))
          )
      );

      toast.success(json.message || "Department updated");

      // close modal after update and re-fetch authoritative data
      setIsModalOpen(false);
      setDeptInput("");
      setIsEditing(false);
      setEditingDeptId(null);
      setFormError(null);

      await fetchDepartments();
    } catch (err) {
      console.error("update dept error", err);
      const msg = err.message || "Server error while updating department";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (dId, dName) => {
    const ok = window.confirm(`Delete department "${dName}"?`);
    if (!ok) return;

    if (!companyId || !dId) {
      toast.error("Missing company or department id");
      return;
    }
    try {
      setDeletingId(dId);
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${dId}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.message || `Failed to delete department (${res.status})`;
        toast.error(msg);
        return;
      }
      toast.success(json.message || "Department deleted");

      // optimistic update: remove from local list
      setDepartments((prev) =>
        prev.filter((x) => String(x._id) !== String(dId))
      );

      // if we were editing this department, close modal
      if (isEditing && String(editingDeptId) === String(dId)) closeModal();

      // re-fetch to be certain
      await fetchDepartments();
    } catch (err) {
      console.error("delete dept error:", err);
      toast.error("Server error while deleting department");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <MainHeader />

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              {company
                ? `Departments — ${company.companyName}`
                : "List of Departments"}
            </h1>
            {company && (
              <p className="text-sm text-gray-500 mt-1">
                Company ID: {company._id}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Department
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse px-4 py-2 bg-gray-100 rounded">
              Loading...
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        ) : departments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-3">
              No departments have been added for this company.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Department
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map((d) => (
              <div
                key={d._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {d.department}
                  </div>
                  <div className="text-xs text-gray-500">ID: {d._id}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigate(
                        `/admin/companies/${companyId}/departments/${d._id}/employees`
                      );
                    }}
                    className="px-3 py-1 rounded border border-green-200 text-green-600 bg-white hover:bg-green-50 text-sm"
                    aria-label={`View employees for ${d.department}`}
                  >
                    Employees
                  </button>
                  <button
                    onClick={() => openEditModal(d)}
                    className="px-3 py-1 rounded border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(d._id, d.department)}
                    disabled={deletingId === d._id}
                    className={`px-3 py-1 rounded border border-red-200 bg-white hover:bg-red-50 text-sm ${
                      deletingId === d._id
                        ? "text-red-300 cursor-not-allowed"
                        : "text-red-600"
                    }`}
                  >
                    {deletingId === d._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!creating) closeModal();
            }}
          />

          <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-lg overflow-hidden z-10">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex-1">
                {isEditing ? "Edit Department" : "Add Department"}
              </h2>
            </div>

            <form
              onSubmit={isEditing ? handleUpdateDept : handleCreateDept}
              className="p-4 space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department name
                </label>
                <input
                  type="text"
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Sales"
                  disabled={creating}
                />
                {formError && (
                  <p className="mt-2 text-xs text-red-600">{formError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="px-3 py-2 rounded bg-red-500 hover:bg-red-400"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating
                    ? isEditing
                      ? "Updating..."
                      : "Adding..."
                    : isEditing
                    ? "Update"
                    : "Add & Close"}
                </button>
              </div>
            </form>

            <div className="p-3 border-t text-xs text-gray-500">
              {isEditing
                ? "Edit the department name and click Update. This will update the department for this company."
                : "After adding the department the modal will close and the list refreshes automatically."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAdminDept;
