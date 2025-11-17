// src/pages/.../AdminViewSalary.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainHeader from "../../../MainComp/MainHeader/mainHeader";
import { toast } from "react-toastify";

// const API_BASE = "http://localhost:3000";
const API_BASE = "https://rrplserver.rajavrukshagroup.in";

const PAGE_LIMIT = 15;

// helper: month name for display (1-indexed)
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AdminViewSalary = () => {
  const { companyId, deptId, employeeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPage = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [page, setPage] = useState(initialPage);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 0,
  });
  const [employee, setEmployee] = useState(null);
  const [company, setCompany] = useState(null);
  const [department, setDepartment] = useState(null);
  console.log("employee", employee);

  // NEW: sending state for email actions
  const [sendingIds, setSendingIds] = useState([]);

  // Modal & form state (unchanged)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);

  // quick helper
  const isSending = (id) => sendingIds.includes(id);

  // Replace your current openSalaryInNewWindow with this
  const openSalaryInNewWindow = (salaryId) => {
    if (!salaryId) return;
    const url = `${API_BASE}/slip/admin/companies/${companyId}/departments/${deptId}/employees/${employeeId}/salary/${salaryId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // form state
  const [form, setForm] = useState({
    payMonthISO: "",
    basicSalary: "",
    hra: "",
    trAllowance: "",
    specialAllowance: "",
    vda: "",
    epf: "",
    esic: "",
    professionalTax: "",
    uniform_deduction: "",
    late_login: "",
    others: "",
    lop: "",
    totalWorkingDays: "",
    lopDays: "",
    paidDays: "",
    leaves_taken: "",
    salarySlipNumber: "",
    notes: "",
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, submitting]);

  useEffect(() => {
    setSearchParams({ page: String(page) }, { replace: true });
  }, [page, setSearchParams]);

  // fetch function
  const fetchSalaries = async (pageToUse = page, signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${employeeId}?page=${pageToUse}`,
        { signal }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json?.message || `Failed to fetch (${res.status})`;
        if (res.status === 404) {
          setError(message);
          setSalaryRecords([]);
          setMeta({
            total: 0,
            page: pageToUse,
            limit: PAGE_LIMIT,
            totalPages: 0,
          });
          return;
        }
        setError(message);
        toast.error(message);
        return;
      }

      const records = json?.data ?? [];
      console.log("records", records);
      setSalaryRecords(Array.isArray(records) ? records : []);
      setMeta(
        json?.meta ?? {
          total: Array.isArray(records) ? records.length : 0,
          page: pageToUse,
          limit: PAGE_LIMIT,
          totalPages: Math.ceil(
            (json?.meta?.total || records.length || 0) / PAGE_LIMIT
          ),
        }
      );

      if (Array.isArray(records) && records.length > 0) {
        setEmployee(records[0].employee ?? null);
        setCompany(records[0].company ?? null);
        setDepartment(records[0].department ?? null);
      } else {
        setEmployee(json?.employee ?? null);
        setCompany(json?.company ?? null);
        setDepartment(json?.department ?? null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("fetch salaries error:", err);
      setError(err.message || "Server error while fetching salary slips");
      toast.error(err.message || "Server error while fetching salary slips");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredSalaryDefaults = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/fetchStoredEmpSalary/${employeeId}`
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn(
          "Could not fetch stored salary defaults:",
          json?.message || res.status
        );
        return null;
      }
      return json?.data?.salaryDefaults ?? null;
    } catch (err) {
      console.error("fetchStoredSalaryDefaults error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!companyId || !deptId || !employeeId) {
      setError("Missing route parameters.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetchSalaries(page, controller.signal);
    return () => controller.abort();
  }, [companyId, deptId, employeeId, page]);

  // UI handlers
  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(meta.totalPages || 1, p + 1));
  const onBack = () => navigate(-1);

  const openCreate = async () => {
    setIsEditing(false);
    setEditingSalaryId(null);
    // base empty form
    const baseForm = {
      payMonthISO: "",
      basicSalary: "",
      hra: "",
      trAllowance: "",
      specialAllowance: "",
      vda: "",
      epf: "",
      esic: "",
      professionalTax: "",
      uniform_deduction: "",
      late_login: "",
      others: "",
      lop: "",
      totalWorkingDays: "",
      lopDays: "",
      paidDays: "",
      leaves_taken: "",
      salarySlipNumber: "",
      notes: "",
    };

    try {
      const defaults = await fetchStoredSalaryDefaults();
      if (defaults) {
        // convert numbers -> strings so inputs work; keep null/undefined -> ""
        baseForm.basicSalary =
          defaults.basicSalary != null ? String(defaults.basicSalary) : "";
        baseForm.vda = defaults.vda != null ? String(defaults.vda) : "";
        baseForm.hra = defaults.hra != null ? String(defaults.hra) : "";
        baseForm.trAllowance =
          defaults.trAllowance != null ? String(defaults.trAllowance) : "";
        baseForm.specialAllowance =
          defaults.specialAllowance != null
            ? String(defaults.specialAllowance)
            : "";
      }
    } catch (err) {
      // silent fallback — do not block UI
      console.warn("Could not prefill salary defaults", err);
    }

    // setForm({
    //   payMonthISO: "",
    //   basicSalary: "",
    //   hra: "",
    //   trAllowance: "",
    //   specialAllowance: "",
    //   vda: "",
    //   epf: "",
    //   esic: "",
    //   professionalTax: "",
    //   uniform_deduction: "",
    //   late_login: "",
    //   others: "",
    //   lop: "",
    //   totalWorkingDays: "",
    //   lopDays: "",
    //   paidDays: "",
    //   leaves_taken: "",
    //   salarySlipNumber: "",
    //   notes: "",
    // });
    setForm(baseForm);
    setFormError(null);
    setIsModalOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 70);
  };

  const openEdit = (salary) => {
    setIsEditing(true);
    setEditingSalaryId(salary._id);
    const monthISO =
      salary && salary.payYear && salary.payMonth
        ? `${String(salary.payYear).padStart(4, "0")}-${String(
            salary.payMonth
          ).padStart(2, "0")}`
        : "";

    setForm({
      payMonthISO: monthISO,
      basicSalary: salary.basicSalary ?? salary.basicSalary_enc ?? "",
      hra: salary.hra ?? salary.hra_enc ?? "",
      trAllowance: salary.trAllowance ?? salary.trAllowance_enc ?? "",
      specialAllowance:
        salary.specialAllowance ?? salary.specialAllowance_enc ?? "",
      vda: salary.vda ?? salary.vda_enc ?? "",
      epf: salary.epf ?? salary.epf_enc ?? "",
      esic: salary.esic ?? salary.esic_enc ?? "",
      professionalTax:
        salary.professionalTax ?? salary.professionalTax_enc ?? "",
      uniform_deduction:
        salary.uniform_deduction ?? salary.uniform_deduction_enc ?? "",
      late_login: salary.late_login ?? salary.late_login_enc ?? "",
      others: salary.others ?? salary.others_enc ?? "",
      lop: salary.lop ?? salary.lop_enc ?? "",
      totalWorkingDays: salary.totalWorkingDays ?? "",
      leaves_taken: salary.leaves_taken ?? "",
      lopDays: salary.lopDays ?? "",
      paidDays: salary.paidDays ?? "",
      salarySlipNumber: salary.salarySlipNumber ?? "",
      notes: salary.notes ?? salary.notes_enc ?? "",
    });

    setFormError(null);
    setIsModalOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 70);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingSalaryId(null);
    setFormError(null);
  };

  const onFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const parseMonthISO = (iso) => {
    if (!iso || typeof iso !== "string") return null;
    const parts = iso.split("-");
    if (parts.length < 2) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
    return { year, month };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError(null);
    const monthData = parseMonthISO(form.payMonthISO);
    if (!monthData) {
      setFormError("Please pick a pay month (month & year).");
      return;
    }
    const { month: payMonth, year: payYear } = monthData;

    const payload = {
      payMonth,
      payYear,
      basicSalary: Number(form.basicSalary || 0),
      hra: Number(form.hra || 0),
      trAllowance: Number(form.trAllowance || 0),
      specialAllowance: Number(form.specialAllowance || 0),
      vda: Number(form.vda || 0),
      epf: Number(form.epf || 0),
      esic: Number(form.esic || 0),
      professionalTax: Number(form.professionalTax || 0),
      advance: Number(form.advance || 0),
      uniform_deduction: Number(form.uniform_deduction || 0),
      late_login: Number(form.late_login || 0),
      others: Number(form.others || 0),
      lop: Number(form.lop || 0),
      totalWorkingDays: Number(form.totalWorkingDays || 0),
      lopDays: Number(form.lopDays || 0),
      paidDays: Number(form.paidDays || 0),
      leaves_taken: Number(form.leaves_taken || 0),
      salarySlipNumber: form.salarySlipNumber?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    try {
      setSubmitting(true);

      if (isEditing && editingSalaryId) {
        const res = await fetch(
          `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${employeeId}/salaries/${editingSalaryId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.message || `Failed to update slip (${res.status})`;
          setFormError(msg);
          toast.error(msg);
          return;
        }
        toast.success(json?.message || "Salary slip updated");
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingSalaryId(null);
        await fetchSalaries(page);
      } else {
        const res = await fetch(
          `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${employeeId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.message || `Failed to create slip (${res.status})`;
          setFormError(msg);
          toast.error(msg);
          return;
        }
        toast.success(json?.message || "Salary slip created");
        setIsModalOpen(false);
        setPage(1);
        await fetchSalaries(1);
      }
    } catch (err) {
      console.error("submit slip error:", err);
      const msg = err.message || "Server error while submitting slip";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const monthDisplay = (m, y) => {
    if (!m || !y) return "-";
    const idx = Number(m) - 1;
    if (idx < 0 || idx > 11) return `${m}-${y}`;
    return `${MONTH_NAMES[idx]} ${y}`;
  };

  const isDeleting = (id) => deletingIds.includes(id);

  const handleDeleteSalary = async (salaryId) => {
    if (!salaryId) return;
    const ok = window.confirm(
      "Are you sure you want to delete this salary slip?"
    );
    if (!ok) return;
    setDeletingIds((prev) => [...prev, salaryId]);
    try {
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${employeeId}/salaries/${salaryId}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || `Failed to delete (${res.status})`;
        toast.error(msg);
        return;
      }
      toast.success(json?.message || "Salary slip deleted");
      await fetchSalaries(page);
    } catch (err) {
      console.error("delete salary error:", err);
      toast.error(err.message || "Server error while deleting salary slip");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== salaryId));
    }
  };

  // NEW: send payslip by email (calls your route). Uses employee.email as recipient.
  const handleSendSalaryByEmail = async (salaryId) => {
    console.log("salary id", salaryId);
    if (!salaryId) return;
    // guard: ensure employee email exists else warn
    const recipientEmail = employee?.email;
    console.log("mail", recipientEmail);
    if (!recipientEmail) {
      toast.error("Employee has no email. Provide recipient before sending.");
      return;
    }

    setSendingIds((prev) => [...prev, salaryId]);
    try {
      const res = await fetch(
        `${API_BASE}/slip/admin/companies/${companyId}/departments/${deptId}/employees/${employeeId}/salary/${salaryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: recipientEmail }),
        }
      );
      console.log("res", res);
      const json = await res.json().catch(() => ({}));
      console.log("json", json);
      if (!res.ok) {
        const msg = json?.message || `Failed to send (${res.status})`;
        toast.error(msg);
        return;
      }
      toast.success(json?.message || "Salary slip sent by email");
    } catch (err) {
      console.error("send salary email error:", err);
      toast.error(err.message || "Server error while sending payslip");
    } finally {
      setSendingIds((prev) => prev.filter((id) => id !== salaryId));
    }
  };

  return (
    <div>
      <MainHeader />
      <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              Salary Slips
              {employee && employee.employeeName
                ? ` — ${employee.employeeName}`
                : ""}
            </h1>
            {company && department && (
              <p className="text-sm text-gray-500 mt-1">
                {department.department} · {company.companyName}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {/* <button
              onClick={onBack}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              Back
            </button> */}
            <button
              onClick={openCreate}
              className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Create Slip
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse px-6 py-3 bg-gray-100 rounded">
              Loading...
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : salaryRecords.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-700">No salary slips found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-3 py-2">Pay Period</th>
                    <th className="px-3 py-2">Gross</th>
                    <th className="px-3 py-2">Deductions</th>
                    <th className="px-3 py-2">Net Pay</th>
                    <th className="px-3 py-2">Paid Days</th>
                    <th className="px-3 py-2">LOP Days</th>
                    <th className="px-3 py-2">Total Leaves Taken</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryRecords.map((s) => (
                    <tr key={s._id} className="border-t">
                      <td className="px-3 py-3">
                        {monthDisplay(s.payMonth, s.payYear)}
                      </td>
                      <td className="px-3 py-3">{s.totalEarnings ?? "-"}</td>
                      <td className="px-3 py-3">{s.totalDeductions ?? "-"}</td>
                      <td className="px-3 py-3">{s.netPay ?? "-"}</td>
                      <td className="px-3 py-3 text-center">
                        {s.paidDays ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {/* {s.lopDays ??
                          (typeof s.lop === "number"
                            ? s.lop
                            : typeof s.totalWorkingDays === "number" &&
                              typeof s.paidDays === "number"
                            ? Math.max(0, s.totalWorkingDays - s.paidDays)
                            : "-")} */}
                        {s.lopDays ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {s.leaves_taken ?? "-"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openSalaryInNewWindow(s._id)}
                            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            View
                          </button>

                          <button
                            onClick={() => openEdit(s)}
                            className="px-3 py-1 rounded bg-yellow-400 text-black hover:bg-yellow-500"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteSalary(s._id)}
                            disabled={isDeleting(s._id)}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeleting(s._id) ? "Deleting..." : "Delete"}
                          </button>

                          {/* NEW: Send button */}
                          <button
                            onClick={() => handleSendSalaryByEmail(s._id)}
                            disabled={isSending(s._id)}
                            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isSending(s._id) ? "Sending..." : "Send"}
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
                Showing page {meta.page} of {meta.totalPages || 1} —{" "}
                {meta.total} total
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onPrev}
                  disabled={meta.page <= 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={onNext}
                  disabled={meta.page >= (meta.totalPages || 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !submitting && closeModal()}
          />
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">
                    {isEditing ? "Edit Salary Slip" : "Create Salary Slip"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isEditing
                      ? `Editing slip ${editingSalaryId}`
                      : `Create a slip for ${
                          employee?.employeeName ?? "employee"
                        }`}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
                  {/* form fields (unchanged) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pay Month *
                      </label>
                      <input
                        ref={firstInputRef}
                        type="month"
                        value={form.payMonthISO}
                        onChange={(e) =>
                          onFormChange("payMonthISO", e.target.value)
                        }
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Pick month & year. Displayed on table as month name.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Slip Number
                      </label>
                      <input
                        type="text"
                        value={form.salarySlipNumber}
                        onChange={(e) =>
                          onFormChange("salarySlipNumber", e.target.value)
                        }
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="border rounded p-4 bg-gray-50">
                    <h4 className="text-sm font-medium mb-3">Earnings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {inputField(
                        "Basic Salary",
                        "basicSalary",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField("VDA", "vda", form, onFormChange, submitting)}
                      {inputField("HRA", "hra", form, onFormChange, submitting)}
                      {inputField(
                        "Travel Allowance",
                        "trAllowance",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField(
                        "Special Allowance",
                        "specialAllowance",
                        form,
                        onFormChange,
                        submitting
                      )}
                    </div>
                  </div>

                  <div className="border rounded p-4 bg-gray-50">
                    <h4 className="text-sm font-medium mb-3">Deductions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {inputField("EPF", "epf", form, onFormChange, submitting)}
                      {inputField(
                        "ESIC",
                        "esic",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField(
                        "Professional Tax",
                        "professionalTax",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField(
                        "Uniform Deduction",
                        "uniform_deduction",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField(
                        "Late Login",
                        "late_login",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField(
                        "Others",
                        "others",
                        form,
                        onFormChange,
                        submitting
                      )}
                      {inputField(
                        "LOP (deduction)",
                        "lop",
                        form,
                        onFormChange,
                        submitting
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {inputField(
                      "Total Working Days",
                      "totalWorkingDays",
                      form,
                      onFormChange,
                      submitting,
                      "number",
                      "any"
                    )}
                    {inputField(
                      "Paid Days",
                      "paidDays",
                      form,
                      onFormChange,
                      submitting,
                      "number",
                      "any"
                    )}
                    {inputField(
                      "Leaves Taken",
                      "leaves_taken",
                      form,
                      onFormChange,
                      submitting,
                      "number",
                      "any"
                    )}
                    {inputField(
                      "LOP Days",
                      "lopDays",
                      form,
                      onFormChange,
                      submitting,
                      "number",
                      "any"
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => onFormChange("notes", e.target.value)}
                      className="w-full p-3 border rounded min-h-[80px]"
                      disabled={submitting}
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-red-600">{formError}</p>
                  )}
                </div>

                <div className="px-6 py-4 border-t bg-white flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !submitting && closeModal()}
                    disabled={submitting}
                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {submitting
                      ? isEditing
                        ? "Saving..."
                        : "Creating..."
                      : isEditing
                      ? "Save Changes"
                      : "Create Slip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function inputField(
  label,
  key,
  form,
  onFormChange,
  disabled,
  type = "number",
  step
) {
  return (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => onFormChange(key, e.target.value)}
        className="w-full p-2 border rounded"
        disabled={disabled}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? step ?? "any" : undefined}
      />
    </div>
  );
}

export default AdminViewSalary;
