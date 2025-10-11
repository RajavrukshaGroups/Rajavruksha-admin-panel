// ViewAdminEmployees.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainHeader from "../../../MainComp/MainHeader/mainHeader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const isoToInputDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  } catch {
    return "";
  }
};

const ViewAdminEmployees = () => {
  const { companyId, deptId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // core state
  const [company, setCompany] = useState(null);
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);

  // pagination
  const initialPage = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [page, setPage] = useState(initialPage);
  const initialLimit = Math.max(
    1,
    Math.min(200, parseInt(searchParams.get("limit") || "15", 10))
  );
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal + form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const firstInputRef = useRef(null);

  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [UAN, setUAN] = useState("");
  const [pfNo, setPfNo] = useState("");
  const [esiNo, setEsiNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [bankIFSCNo, setBankIFSCNo] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // track deleting employee ids (array of ids)
  const [deletingIds, setDeletingIds] = useState([]);

  // always request decrypted fields server-side
  const revealAlways = true;

  // sync page/limit to URL
  useEffect(() => {
    setSearchParams(
      { page: String(page), limit: String(limit) },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // fetch employees
  useEffect(() => {
    if (!companyId || !deptId) {
      setError("Missing companyId or deptId");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees?page=${page}&limit=${limit}&reveal=${String(
            revealAlways
          )}`,
          { signal: controller.signal }
        );
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = json?.message || `Failed to fetch (${res.status})`;
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        setCompany(json.company || null);
        setDepartment(json.department || null);
        setEmployees(Array.isArray(json.employees) ? json.employees : []);
        const totalFromServer = Number(json?.pagination?.total ?? 0) || 0;
        const pagesFromServerRaw = json?.pagination?.pages;
        const pagesFromServer = Number.isFinite(Number(pagesFromServerRaw))
          ? Number(pagesFromServerRaw)
          : Math.max(1, Math.ceil(totalFromServer / Number(limit) || 1));
        setTotal(totalFromServer);
        setPages(Math.max(1, parseInt(String(pagesFromServer), 10)));

        console.info("pagination:", {
          page,
          limit,
          totalFromServer,
          pagesFromServer,
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("fetch employees error:", err);
        const msg = err.message || "Server error while fetching employees";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    return () => controller.abort();
  }, [companyId, deptId, page, limit]);

  // open modal for add
  const openAddModal = () => {
    setFormError(null);
    setIsEditing(false);
    setEditingEmployeeId(null);
    setEmployeeName("");
    setEmployeeId("");
    setDesignation("");
    setDateOfJoining("");
    setAadhar("");
    setUAN("");

    setPfNo("");
    setEsiNo("");
    setBankName("");
    setBankBranchName("");
    setBankAccountNo("");
    setBankIFSCNo("");
    setEmail("");
    setMobileNumber("");
    setIsModalOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  // open modal for edit (prefill)
  const openEditModal = (emp) => {
    setFormError(null);
    setIsEditing(true);
    setEditingEmployeeId(emp._id);
    setEmployeeName(emp.employeeName ?? "");
    setEmployeeId(emp.employeeId ?? "");
    setDesignation(emp.designation ?? "");
    setDateOfJoining(isoToInputDate(emp.dateOfJoining));
    setAadhar(emp.aadhar ?? "");
    setUAN(emp.UAN ?? "");
    setPfNo(emp.pfNo ?? "");
    setEsiNo(emp.esiNo ?? "");
    setBankName(emp.bankName ?? "");
    setBankBranchName(emp.bankBranchName ?? "");
    setBankAccountNo(emp.bankAccountNo ?? "");
    setBankIFSCNo(emp.bankIFSCNo ?? "");
    setEmail(emp.email ?? "");
    setMobileNumber(emp.mobileNumber ?? "");
    setIsModalOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormError(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isModalOpen && !submitting) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, submitting]);

  // shared create/update handler
  const handleSaveEmployee = async (e) => {
    e?.preventDefault();
    setFormError(null);

    if (!employeeName.trim()) {
      setFormError("Employee name is required.");
      return;
    }
    if (!employeeId.trim()) {
      setFormError("Employee ID is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        employeeName: employeeName.trim(),
        employeeId: employeeId.trim(),
      };
      if (designation.trim()) payload.designation = designation.trim();
      else payload.designation = ""; // allow clearing
      if (dateOfJoining.trim()) payload.dateOfJoining = dateOfJoining.trim();
      else payload.dateOfJoining = "";
      // sensitive fields passed as plaintext; backend will encrypt
      payload.aadhar = aadhar.trim() || "";
      payload.UAN = UAN.trim() || "";
      payload.pfNo = pfNo.trim() || "";
      payload.esiNo = esiNo.trim() || "";
      payload.bankName = bankName.trim() || "";
      payload.bankBranchName = bankBranchName.trim() || "";
      payload.bankAccountNo = bankAccountNo.trim() || "";
      payload.bankIFSCNo = bankIFSCNo.trim() || "";
      payload.mobileNumber = mobileNumber.trim() || "";
      payload.email = email.trim() || "";

      if (isEditing && editingEmployeeId) {
        // PUT update
        const res = await fetch(
          `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${editingEmployeeId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const serverMsg = json?.message || `Failed to update (${res.status})`;
          setFormError(serverMsg);
          toast.error(serverMsg);
          return;
        }

        // updated data in json.data
        const updated = json.data || null;
        if (updated) {
          setEmployees((prev) =>
            prev.map((p) =>
              String(p._id) === String(updated._id) ? updated : p
            )
          );
        } else {
          // fallback: optimistic update
          setEmployees((prev) =>
            prev.map((p) =>
              String(p._id) === String(editingEmployeeId)
                ? {
                    ...p,
                    employeeName: payload.employeeName,
                    employeeId: payload.employeeId,
                    designation: payload.designation || undefined,
                    dateOfJoining: payload.dateOfJoining || null,
                    aadhar: payload.aadhar || undefined,
                    UAN: payload.UAN || undefined,
                    pfNo: payload.pfNo || undefined,
                    esiNo: payload.esiNo || undefined,
                    bankName: payload.bankName || undefined,
                    bankBranchName: payload.bankBranchName || undefined,
                    bankAccountNo: payload.bankAccountNo || undefined,
                    bankIFSCNo: payload.bankIFSCNo || undefined,
                    email: payload.email || undefined,
                    mobileNumber: payload.mobileNumber || undefined,
                  }
                : p
            )
          );
        }

        toast.success(json.message || "Employee updated");
      } else {
        // create (POST)
        const res = await fetch(
          `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const serverMsg =
            json?.message ||
            (res.status === 409
              ? "Employee ID already exists"
              : `Failed to create employee (${res.status})`);
          setFormError(serverMsg);
          toast.error(serverMsg);
          return;
        }

        const created = json.data || {
          _id: json._id || `${Date.now()}`,
          employeeName: payload.employeeName,
          employeeId: payload.employeeId,
          designation: payload.designation || undefined,
          dateOfJoining: payload.dateOfJoining || undefined,
        };

        setEmployees((prev) => [created, ...prev]);
        setTotal((prevTotal) => {
          const newTotal = prevTotal + 1;
          setPages(Math.max(1, Math.ceil(newTotal / limit)));
          return newTotal;
        });

        toast.success(json.message || "Employee created");
      }

      // close modal
      setIsModalOpen(false);
    } catch (err) {
      console.error("save employee error:", err);
      const msg = err.message || "Server error while saving employee";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE handler
  const handleDeleteEmployee = async (empId) => {
    if (!empId) return;
    const ok = window.confirm(
      "Are you sure you want to permanently delete this employee?"
    );
    if (!ok) return;

    // mark as deleting
    setDeletingIds((prev) => [...prev, empId]);

    try {
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${empId}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || `Failed to delete (${res.status})`;
        toast.error(msg);
        return;
      }

      // remove from UI
      setEmployees((prev) =>
        prev.filter((p) => String(p._id) !== String(empId))
      );

      // update totals/pages
      setTotal((prevTotal) => {
        const newTotal = Math.max(0, prevTotal - 1);
        setPages(Math.max(1, Math.ceil(newTotal / limit)));
        return newTotal;
      });

      toast.success(json.message || "Employee deleted");

      // if we deleted the last item on the page and now page > 1, go back one page
      // (so user sees items instead of empty page)
      setTimeout(() => {
        if (employees.length === 1 && page > 1) {
          setPage((p) => Math.max(1, p - 1));
        }
      }, 0);
    } catch (err) {
      console.error("delete employee error:", err);
      toast.error(err.message || "Server error while deleting employee");
    } finally {
      // remove empId from deletingIds
      setDeletingIds((prev) => prev.filter((id) => id !== empId));
    }
  };

  const displayPages =
    Number(pages) ||
    Math.max(1, Math.ceil(Number(total || 0) / Number(limit) || 1));

  const isDeleting = (id) => deletingIds.includes(id);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <MainHeader />
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              {company && department
                ? `Employees — ${department.department} @ ${company.companyName}`
                : "Employees"}
            </h1>
            {company && department && (
              <p className="text-sm text-gray-500 mt-1">
                Company ID: {company._id} · Dept ID: {department._id}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {/* <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              Back
            </button> */}

            <button
              onClick={openAddModal}
              className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Add Employee
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
        ) : employees.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-3">
              No employees found for this department.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-3 py-2">Employee Name</th>
                    <th className="px-3 py-2">Employee ID</th>
                    <th className="px-3 py-2">Designation</th>
                    <th className="px-3 py-2">Date of Joining</th>
                    <th className="px-3 py-2">Personal Information</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e._id} className="border-t">
                      <td className="px-3 py-2">{e.employeeName}</td>
                      <td className="px-3 py-2">{e.employeeId}</td>
                      <td className="px-3 py-2">{e.designation || "-"}</td>
                      <td className="px-3 py-2">
                        {/* {e.dateOfJoining
                          ? new Date(e.dateOfJoining).toLocaleDateString()
                          : "-"} */}
                        {e.dateOfJoining ? formatDate(e.dateOfJoining) : ""}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        UAN: {e.UAN ?? "-"}
                        <br />
                        Aadhar: {e.aadhar ?? "-"}
                        <br />
                        PF: {e.pfNo ?? "-"}
                        <br />
                        ESI: {e.esiNo ?? "-"}
                        <br />
                        Bank: {e.bankName ?? "-"}
                        <br />
                        Branch Name:{e.bankBranchName ?? "-"}
                        <br />
                        Account No: {e.bankAccountNo ?? "-"}
                        <br />
                        IFSC NO:{e.bankIFSCNo ?? "-"}
                        <br />
                        Email:{e.email ?? "-"}
                        <br />
                        Mobile:{e.mobileNumber ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(e)}
                            className="px-2 py-1 rounded bg-yellow-400 text-black hover:bg-yellow-500"
                            disabled={isDeleting(e._id)}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteEmployee(e._id)}
                            className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            disabled={isDeleting(e._id)}
                          >
                            {isDeleting(e._id) ? "Deleting..." : "Delete"}
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/companies/${companyId}/departments/${deptId}/employees/${e._id}`
                              )
                            }
                            className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {page} of {displayPages} — {total} total
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={Number(page) <= 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(Number(displayPages), p + 1))
                  }
                  disabled={Number(page) >= Number(displayPages)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal (Add / Edit) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && closeModal()}
          />
          <div className="relative w-full max-w-3xl h-full md:h-auto mx-auto">
            <div className="flex flex-col h-full md:max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold">
                  {isEditing ? "Edit Employee" : "Add Employee"}
                </h2>
                {/* <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  ✕
                </button> */}
              </div>

              <div className="p-4 overflow-y-auto">
                <form onSubmit={handleSaveEmployee} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee name *
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of joining
                      </label>
                      <input
                        type="date"
                        value={dateOfJoining}
                        onChange={(e) => setDateOfJoining(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhar
                      </label>
                      <input
                        type="text"
                        value={aadhar}
                        onChange={(e) => setAadhar(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UAN
                      </label>
                      <input
                        type="text"
                        value={UAN}
                        onChange={(e) => setUAN(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PF No
                      </label>
                      <input
                        type="text"
                        value={pfNo}
                        onChange={(e) => setPfNo(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ESI No
                      </label>
                      <input
                        type="text"
                        value={esiNo}
                        onChange={(e) => setEsiNo(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={bankBranchName}
                        onChange={(e) => setBankBranchName(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank account no
                      </label>
                      <input
                        type="text"
                        value={bankAccountNo}
                        onChange={(e) => setBankAccountNo(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Number
                      </label>
                      <input
                        type="text"
                        value={bankIFSCNo}
                        onChange={(e) => setBankIFSCNo(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-xs text-red-600">{formError}</p>
                  )}
                </form>
              </div>

              <div className="p-3 border-t bg-white flex items-center justify-end gap-2 sticky bottom-0">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-3 py-2 rounded bg-red-500 hover:bg-red-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEmployee}
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {submitting
                    ? isEditing
                      ? "Saving..."
                      : "Adding..."
                    : isEditing
                    ? "Save Changes"
                    : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAdminEmployees;
