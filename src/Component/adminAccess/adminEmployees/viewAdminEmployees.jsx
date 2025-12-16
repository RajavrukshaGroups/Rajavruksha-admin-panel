// ViewAdminEmployees.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainHeader from "../../../MainComp/MainHeader/mainHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const API_BASE = "http://localhost:5000";
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

const ViewAdminEmployees = () => {
  const { companyId, deptId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sharingCred, setSharingCred] = useState([]);
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

  // modal + form state (existing + new fields)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const firstInputRef = useRef(null);

  // existing core fields
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
  const [basicSalary, setBasicSalary] = useState("");
  const [vda, setVDA] = useState("");
  const [hra, setHRA] = useState("");
  const [trAllowance, setTrAllowance] = useState("");
  const [specialAllowance, setSpecialAllowance] = useState("");
  const [foodAllowance, setFoodAllowance] = useState("");
  const [uniformRefund, setUniformRefund] = useState("");

  // --- NEW fields requested by you ---
  const [nameAsPerAadhar, setNameAsPerAadhar] = useState("");
  // keep legacy string but also a boolean flag
  const [status, setStatus] = useState(""); // "working" / "not_working"
  const [statusWorking, setStatusWorking] = useState(true); // boolean
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfExit, setDateOfExit] = useState("");
  const [PAN, setPAN] = useState("");
  const [altmobileNumber, setAltmobileNumber] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  // marital as text + boolean
  const [maritalStatus, setMaritalStatus] = useState(""); // "married"/"unmarried"
  const [isMarried, setIsMarried] = useState(false);
  const [fatherName, setFatherName] = useState("");
  const [fatherDOB, setFatherDOB] = useState("");
  const [fatherAadhar, setFatherAadhar] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherDOB, setMotherDOB] = useState("");
  const [motherAadhar, setMotherAadhar] = useState("");
  const [fatherOrSpouseName, setFatherOrSpouseName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [spouseDOB, setSpouseDOB] = useState("");
  const [spouseAadhar, setSpouseAadhar] = useState("");
  const [childrenName, setChildrenName] = useState("");
  const [childrenAadharNumber, setChildrenAadharNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelationship, setNomineeRelationship] = useState("");

  // collapse toggle for more details
  const [showMore, setShowMore] = useState(false);

  // track deleting employee ids (array of ids)
  const [deletingIds, setDeletingIds] = useState([]);

  // send accounts modal state (NEW)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendMonth, setSendMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [sendYear, setSendYear] = useState(new Date().getFullYear());
  const [sendingAccounts, setSendingAccounts] = useState(false);

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

  // fetch employees - extracted so we can call after create/update/delete
  const fetchEmployees = useCallback(
    async (pageToUse = page, limitToUse = limit) => {
      if (!companyId || !deptId) {
        setError("Missing companyId or deptId");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees?page=${pageToUse}&limit=${limitToUse}&reveal=${String(
            revealAlways
          )}`
        );
        const json = await res.json().catch(() => ({}));
        console.log("json", json);

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
          ? Number(Number(pagesFromServerRaw))
          : Math.max(1, Math.ceil(totalFromServer / Number(limitToUse) || 1));
        setTotal(totalFromServer);
        setPages(Math.max(1, parseInt(String(pagesFromServer), 10)));
      } catch (err) {
        console.error("fetch employees error:", err);
        const msg = err.message || "Server error while fetching employees";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [companyId, deptId, limit, page, revealAlways]
  );

  // initial load & whenever companyId/deptId/page/limit change
  useEffect(() => {
    fetchEmployees(page, limit);
  }, [fetchEmployees, page, limit]);

  // open modal for add
  const openAddModal = () => {
    setFormError(null);
    setIsEditing(false);
    setEditingEmployeeId(null);

    // core resets
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
    setBasicSalary("");
    setVDA("");
    setHRA("");
    setTrAllowance("");
    setSpecialAllowance("");
    setFoodAllowance("");
    setUniformRefund("");
    setEmail("");
    setMobileNumber("");

    // new field resets
    setNameAsPerAadhar("");
    setStatus("working");
    setStatusWorking(true);
    setDateOfBirth("");
    setDateOfExit("");
    setPAN("");
    setAltmobileNumber("");
    setCurrentAddress("");
    setPermanentAddress("");
    setBloodGroup("");
    setMaritalStatus("unmarried");
    setIsMarried(false);
    setFatherName("");
    setFatherDOB("");
    setFatherAadhar("");
    setMotherName("");
    setMotherDOB("");
    setMotherAadhar("");
    setFatherOrSpouseName("");
    setSpouseName("");
    setSpouseDOB("");
    setSpouseAadhar("");
    setChildrenName("");
    setChildrenAadharNumber("");
    setEmergencyContactName("");
    setEmergencyContactNumber("");
    setEmergencyContactRelation("");
    setNomineeName("");
    setNomineeRelationship("");
    setShowMore(false);

    setIsModalOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  // open modal for edit (prefill)
  const openEditModal = (emp) => {
    console.log("emp", emp);
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
    setBasicSalary(String(emp.basicSalary ?? ""));
    setVDA(String(emp.vda ?? ""));
    setHRA(String(emp.hra ?? ""));
    setTrAllowance(String(emp.trAllowance ?? ""));
    setSpecialAllowance(String(emp.specialAllowance ?? ""));
    setFoodAllowance(String(emp.foodAllowance ?? ""));
    setUniformRefund(String(emp.uniformRefund ?? ""));
    setEmail(emp.email ?? "");
    setMobileNumber(emp.mobileNumber ?? "");

    // new field prefills
    setNameAsPerAadhar(emp.nameAsPerAadhar ?? "");
    // prefer boolean if backend already stores boolean; else infer from string
    if (typeof emp.status === "boolean") {
      setStatusWorking(Boolean(emp.status));
      setStatus(emp.status ? "working" : "not_working");
    } else {
      setStatus(emp.status ?? "working");
      setStatusWorking((emp.status ?? "working") === "working");
    }

    setDateOfBirth(isoToInputDate(emp.dateOfBirth));
    setDateOfExit(isoToInputDate(emp.dateOfExit));
    setPAN(emp.PAN ?? "");
    setAltmobileNumber(emp.altmobileNumber ?? "");
    setCurrentAddress(emp.currentAddress ?? "");
    setPermanentAddress(emp.permanentAddress ?? "");
    setBloodGroup(emp.bloodGroup ?? "");
    if (typeof emp.maritalStatus === "boolean") {
      setIsMarried(Boolean(emp.maritalStatus));
      setMaritalStatus(emp.maritalStatus ? "married" : "unmarried");
    } else {
      setMaritalStatus(emp.maritalStatus ?? "unmarried");
      setIsMarried((emp.maritalStatus ?? "unmarried") === "married");
    }

    setFatherName(emp.fatherName ?? "");
    setFatherDOB(isoToInputDate(emp.fatherDOB));
    setFatherAadhar(emp.fatherAadhar ?? "");
    setMotherName(emp.motherName ?? "");
    setMotherDOB(isoToInputDate(emp.motherDOB));
    setMotherAadhar(emp.motherAadhar ?? "");
    setFatherOrSpouseName(emp.fatherOrSpouseName ?? "");
    setSpouseName(emp.spouseName ?? "");
    setSpouseDOB(isoToInputDate(emp.spouseDOB));
    setSpouseAadhar(emp.spouseAadhar ?? "");
    setChildrenName(emp.childrenName ?? "");
    setChildrenAadharNumber(emp.childrenAadharNumber ?? "");
    setEmergencyContactName(emp.emergencyContactName ?? "");
    setEmergencyContactNumber(emp.emergencyContactNumber ?? "");
    setEmergencyContactRelation(emp.emergencyContactRelation ?? "");
    setNomineeName(emp.nomineeName ?? "");
    setNomineeRelationship(emp.nomineeRelationship ?? "");

    setShowMore(false);
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

    // helper: safely coerce any value to trimmed string (returns "" for null/undefined)
    const asTrimmed = (v) => {
      if (v === undefined || v === null) return "";
      return String(v).trim();
    };

    if (!asTrimmed(employeeName)) {
      setFormError("Employee name is required.");
      return;
    }
    if (!asTrimmed(employeeId)) {
      setFormError("Employee ID is required.");
      return;
    }

    // basic validations for mobile numbers
    const mobileTrim = asTrimmed(mobileNumber);
    if (!/^[0-9]{10}$/.test(mobileTrim)) {
      setFormError("Valid 10-digit mobile number is required.");
      return;
    }
    const altTrim = asTrimmed(altmobileNumber);
    if (!/^[0-9]{10}$/.test(altTrim)) {
      setFormError("Valid 10-digit alternative mobile number is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        employeeName: asTrimmed(employeeName),
        employeeId: asTrimmed(employeeId),
      };

      // optional fields
      payload.designation = asTrimmed(designation);
      payload.dateOfJoining = asTrimmed(dateOfJoining);
      payload.dateOfBirth = asTrimmed(dateOfBirth);
      payload.dateOfExit = asTrimmed(dateOfExit);

      // new requested fields
      payload.nameAsPerAadhar = asTrimmed(nameAsPerAadhar);

      // status: keep string and boolean flag for backend compatibility
      payload.status = statusWorking ? "working" : "not_working";
      payload.statusWorking = Boolean(statusWorking);

      payload.PAN = asTrimmed(PAN); // backend will encrypt
      payload.altmobileNumber = altTrim;
      payload.currentAddress = asTrimmed(currentAddress);
      payload.permanentAddress = asTrimmed(permanentAddress);
      payload.bloodGroup = asTrimmed(bloodGroup);

      // marital: both string & boolean
      payload.maritalStatus = isMarried ? "married" : "unmarried";
      payload.isMarried = Boolean(isMarried);

      payload.fatherName = asTrimmed(fatherName);
      payload.fatherDOB = asTrimmed(fatherDOB);
      payload.fatherAadhar = asTrimmed(fatherAadhar);
      payload.motherName = asTrimmed(motherName);
      payload.motherDOB = asTrimmed(motherDOB);
      payload.motherAadhar = asTrimmed(motherAadhar);
      payload.fatherOrSpouseName = asTrimmed(fatherOrSpouseName);
      payload.spouseName = asTrimmed(spouseName);
      payload.spouseDOB = asTrimmed(spouseDOB);
      payload.spouseAadhar = asTrimmed(spouseAadhar);
      payload.childrenName = asTrimmed(childrenName);
      payload.childrenAadharNumber = asTrimmed(childrenAadharNumber);
      payload.emergencyContactName = asTrimmed(emergencyContactName);
      payload.emergencyContactNumber = asTrimmed(emergencyContactNumber);
      payload.emergencyContactRelation = asTrimmed(emergencyContactRelation);
      payload.nomineeName = asTrimmed(nomineeName);
      payload.nomineeRelationship = asTrimmed(nomineeRelationship);

      // sensitive fields passed as plaintext; backend will encrypt
      payload.aadhar = asTrimmed(aadhar);
      payload.UAN = asTrimmed(UAN);
      payload.pfNo = asTrimmed(pfNo);
      payload.esiNo = asTrimmed(esiNo);
      payload.bankName = asTrimmed(bankName);
      payload.bankBranchName = asTrimmed(bankBranchName);
      payload.bankAccountNo = asTrimmed(bankAccountNo);
      payload.bankIFSCNo = asTrimmed(bankIFSCNo);

      // salaries — keep empty string if empty
      payload.basicSalary = asTrimmed(basicSalary);
      payload.vda = asTrimmed(vda);
      payload.hra = asTrimmed(hra);
      payload.trAllowance = asTrimmed(trAllowance);
      payload.specialAllowance = asTrimmed(specialAllowance);
      payload.foodAllowance = asTrimmed(foodAllowance);
      payload.uniformRefund = asTrimmed(uniformRefund);

      payload.mobileNumber = mobileTrim;
      payload.email = asTrimmed(email);

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

        toast.success(json.message || "Employee updated");

        // close modal and re-fetch authoritative list for current page
        setIsModalOpen(false);
        await fetchEmployees(page, limit);
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

        toast.success(json.message || "Employee created");

        setPage(1);
        await fetchEmployees(1, limit);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("save employee error:", err);
      const msg = err.message || "Server error while saving employee";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE handler (unchanged)
  const handleDeleteEmployee = async (empId) => {
    if (!empId) return;
    const ok = window.confirm(
      "Are you sure you want to permanently delete this employee?"
    );
    if (!ok) return;

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

      toast.success(json.message || "Employee deleted");

      const newLocal = employees.filter((p) => String(p._id) !== String(empId));
      const willBeEmpty = newLocal.length === 0 && page > 1;
      const targetPage = willBeEmpty ? Math.max(1, page - 1) : page;

      setEmployees(newLocal);
      setTotal((prevTotal) => Math.max(0, prevTotal - 1));
      if (willBeEmpty) setPage(targetPage);

      await fetchEmployees(targetPage, limit);
    } catch (err) {
      console.error("delete employee error:", err);
      toast.error(err.message || "Server error while deleting employee");
    } finally {
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

  // --- NEW: open send modal ---
  const openSendModal = () => {
    setSendMonth(new Date().getMonth() + 1);
    setSendYear(new Date().getFullYear());
    setIsSendModalOpen(true);
  };
  const closeSendModal = () => {
    if (sendingAccounts) return;
    setIsSendModalOpen(false);
  };

  // --- NEW: send accounts to accounts endpoint from modal ---
  const sendAccountsForMonth = async () => {
    if (!companyId || !deptId) {
      toast.error("Missing company or department information.");
      return;
    }

    try {
      setSendingAccounts(true);
      const res = await fetch(
        `${API_BASE}/sendall/admin/companies/${companyId}/departments/${deptId}/employees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payMonth: Number(sendMonth),
            payYear: Number(sendYear),
          }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || `Failed to send (${res.status})`;
        toast.error(msg);
        return;
      }

      toast.success(
        json.message || `Accounts summary emailed to ${json.to || "accounts"}`
      );
      setIsSendModalOpen(false);
    } catch (err) {
      console.error("send accounts error:", err);
      toast.error(err.message || "Server error while sending accounts summary");
    } finally {
      setSendingAccounts(false);
    }
  };

  // build year options (current year -5 .. current year +1)
  const nowYear = new Date().getFullYear();
  const years = [];
  for (let y = nowYear - 5; y <= nowYear + 1; y++) years.push(y);

  // SHARE LOGIN CREDENTIALS
  const handleShareCredentials = async (empId) => {
    if (!empId) return;

    const confirmSend = window.confirm(
      "This will generate a new password and email it to the employee. Continue?"
    );
    if (!confirmSend) return;

    // mark as sharing immediately
    setSharingCred((prev) => [...prev, empId]);

    try {
      const res = await fetch(
        `${API_BASE}/admin/companies/${companyId}/departments/${deptId}/employees/${empId}/share-credentials`,
        {
          method: "POST",
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          json?.message || `Failed to share credentials (${res.status})`;
        toast.error(msg);
        return;
      }

      toast.success(json.message || "Login credentials sent successfully");

      // refresh list (to reflect credentialsSent flag)
      await fetchEmployees(page, limit);
    } catch (err) {
      console.error("share credentials error:", err);
      toast.error(err.message || "Server error while sharing credentials");
    } finally {
      // remove sharing state
      setSharingCred((prev) => prev.filter((id) => id !== empId));
    }
  };

  return (
    <div>
      <MainHeader />
      <ToastContainer position="top-right" />

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

          <div className="flex gap-3 items-center">
            <button
              onClick={openSendModal}
              className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              title="Open modal to select month and send accounts summary"
            >
              Initiate Reports
            </button>

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
                        {e.dateOfJoining ? formatDate(e.dateOfJoining) : ""}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        UAN: {e.UAN ?? "-"}
                        <br />
                        Aadhar: {e.aadhar ?? "-"}
                        <br />
                        PAN: {e.PAN ?? "-"}
                        <br />
                        PF: {e.pfNo ?? "-"}
                        <br />
                        ESI: {e.esiNo ?? "-"}
                        <br />
                        Bank: {e.bankName ?? "-"}
                        <br />
                        Branch Name: {e.bankBranchName ?? "-"}
                        <br />
                        Account No: {e.bankAccountNo ?? "-"}
                        <br />
                        IFSC NO: {e.bankIFSCNo ?? "-"}
                        <br />
                        Basic Salary: {e.basicSalary ?? "-"}
                        <br />
                        VDA: {e.vda ?? "-"}
                        <br />
                        HRA: {e.hra ?? "-"}
                        <br />
                        Travel Allowance: {e.trAllowance ?? "-"}
                        <br />
                        Special Allowance: {e.specialAllowance ?? "-"}
                        <br />
                        Food Allowance:{e.foodAllowance ?? "-"}
                        <br />
                        Uniform Refund:{e.uniformRefund ?? "-"}
                        <br />
                        Email: {e.email ?? "-"}
                        <br />
                        Mobile: {e.mobileNumber ?? "-"}
                        <br />
                        Alt Mobile: {e.altmobileNumber ?? "-"}
                        <br />
                        DOB: {e.dateOfBirth ? formatDate(e.dateOfBirth) : "-"}
                        <br />
                        Current Addr: {e.currentAddress ?? "-"}
                        <br />
                        Emergency: {e.emergencyContactName ?? "-"} /{" "}
                        {e.emergencyContactNumber ?? "-"}
                        <br />
                        Nominee: {e.nomineeName ?? "-"} (
                        {e.nomineeRelationship ?? "-"})
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
                          <button
                            onClick={() => handleShareCredentials(e._id)}
                            disabled={sharingCred.includes(e._id)}
                            className={`px-2 py-1 rounded text-white ${
                              sharingCred.includes(e._id)
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {sharingCred.includes(e._id)
                              ? "Sharing..."
                              : "Share Credentials"}
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

      {/* SEND REPORTS MODAL */}
      {isSendModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center px-4 py-6"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !sendingAccounts && closeSendModal()}
          />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg z-10 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Send Accounts Report</h3>
              <button
                onClick={() => !sendingAccounts && closeSendModal()}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
                disabled={sendingAccounts}
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700">
                Select month and year for which you want to generate the
                accounts summary. The report will be sent to accounts (email
                configured on server).
              </p>

              <div className="flex gap-3 items-center">
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Month</label>
                  <select
                    value={sendMonth}
                    onChange={(e) => setSendMonth(Number(e.target.value))}
                    className="p-2 border rounded"
                    disabled={sendingAccounts}
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm mb-1">Year</label>
                  <select
                    value={sendYear}
                    onChange={(e) => setSendYear(Number(e.target.value))}
                    className="p-2 border rounded"
                    disabled={sendingAccounts}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => closeSendModal()}
                  disabled={sendingAccounts}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-250"
                >
                  Cancel
                </button>
                <button
                  onClick={sendAccountsForMonth}
                  disabled={sendingAccounts}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {sendingAccounts ? "Sending..." : "Send Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal (Add / Edit Employee) */}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        Name as per Aadhar
                      </label>
                      <input
                        type="text"
                        value={nameAsPerAadhar}
                        onChange={(e) => setNameAsPerAadhar(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Email + Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>

                  {/* Status radios (working / not working) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Status
                      </label>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="statusWorking"
                            checked={statusWorking === true}
                            onChange={() => {
                              setStatusWorking(true);
                              setStatus("working");
                            }}
                          />
                          <span>Working</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="statusWorking"
                            checked={statusWorking === false}
                            onChange={() => {
                              setStatusWorking(false);
                              setStatus("not_working");
                            }}
                          />
                          <span>Not working</span>
                        </label>
                      </div>
                    </div>

                    {/* Marital status radios */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status
                      </label>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="isMarried"
                            checked={isMarried === true}
                            onChange={() => {
                              setIsMarried(true);
                              setMaritalStatus("married");
                            }}
                          />
                          <span>Married</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="isMarried"
                            checked={isMarried === false}
                            onChange={() => {
                              setIsMarried(false);
                              setMaritalStatus("unmarried");
                            }}
                          />
                          <span>Unmarried</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* small row: alt mobile + PAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternative Mobile *
                      </label>
                      <input
                        type="text"
                        value={altmobileNumber}
                        onChange={(e) => setAltmobileNumber(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN
                      </label>
                      <input
                        type="text"
                        value={PAN}
                        onChange={(e) => setPAN(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>

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
                  </div>

                  {/* Date join / DOB / exit */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Exit
                      </label>
                      <input
                        type="date"
                        value={dateOfExit}
                        onChange={(e) => setDateOfExit(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Aadhar / UAN / PF / ESI */}
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

                  {/* Bank details */}
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

                  {/* toggle more details */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMore((s) => !s)}
                      className="text-sm text-white-600 hover:underline"
                    >
                      {showMore ? "Hide more details ▲" : "Show more details ▼"}
                    </button>
                  </div>

                  {/* More details - collapsed by default */}
                  {showMore && (
                    <>
                      {/* Addresses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Address
                          </label>
                          <textarea
                            value={currentAddress}
                            onChange={(e) => setCurrentAddress(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={3}
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Permanent Address
                          </label>
                          <textarea
                            value={permanentAddress}
                            onChange={(e) =>
                              setPermanentAddress(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            rows={3}
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      {/* Family / emergency */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Father Name
                          </label>
                          <input
                            type="text"
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Father DOB
                          </label>
                          <input
                            type="date"
                            value={fatherDOB}
                            onChange={(e) => setFatherDOB(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Father Aadhar
                          </label>
                          <input
                            type="text"
                            value={fatherAadhar}
                            onChange={(e) => setFatherAadhar(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mother Name
                          </label>
                          <input
                            type="text"
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Mother DOB
                          </label>
                          <input
                            type="date"
                            value={motherDOB}
                            onChange={(e) => setMotherDOB(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Mother Aadhar
                          </label>
                          <input
                            type="text"
                            value={motherAadhar}
                            onChange={(e) => setMotherAadhar(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      {/* spouse / children / emergency / nominee */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Spouse Name
                          </label>
                          <input
                            type="text"
                            value={spouseName}
                            onChange={(e) => setSpouseName(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Spouse DOB
                          </label>
                          <input
                            type="date"
                            value={spouseDOB}
                            onChange={(e) => setSpouseDOB(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Spouse Aadhar
                          </label>
                          <input
                            type="text"
                            value={spouseAadhar}
                            onChange={(e) => setSpouseAadhar(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Children Name(s)
                          </label>
                          <input
                            type="text"
                            value={childrenName}
                            onChange={(e) => setChildrenName(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Children Aadhar Number(s)
                          </label>
                          <input
                            type="text"
                            value={childrenAadharNumber}
                            onChange={(e) =>
                              setChildrenAadharNumber(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Father or Spouse Name (for records)
                          </label>
                          <input
                            type="text"
                            value={fatherOrSpouseName}
                            onChange={(e) =>
                              setFatherOrSpouseName(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Contact Name
                          </label>
                          <input
                            type="text"
                            value={emergencyContactName}
                            onChange={(e) =>
                              setEmergencyContactName(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Emergency Contact Number
                          </label>
                          <input
                            type="text"
                            value={emergencyContactNumber}
                            onChange={(e) =>
                              setEmergencyContactNumber(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Emergency Relation
                          </label>
                          <input
                            type="text"
                            value={emergencyContactRelation}
                            onChange={(e) =>
                              setEmergencyContactRelation(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nominee Name
                          </label>
                          <input
                            type="text"
                            value={nomineeName}
                            onChange={(e) => setNomineeName(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Nominee Relationship
                          </label>
                          <input
                            type="text"
                            value={nomineeRelationship}
                            onChange={(e) =>
                              setNomineeRelationship(e.target.value)
                            }
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                            Blood Group
                          </label>
                          <input
                            type="text"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full p-2 border rounded"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Salary fields kept as before */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Basic Salary
                      </label>
                      <input
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VDA
                      </label>
                      <input
                        type="number"
                        value={vda}
                        onChange={(e) => setVDA(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HRA
                      </label>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHRA(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Travel Allowance
                      </label>
                      <input
                        type="number"
                        value={trAllowance}
                        onChange={(e) => setTrAllowance(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Food Allowance
                      </label>
                      <input
                        type="number"
                        value={foodAllowance}
                        onChange={(e) => setFoodAllowance(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Allowance
                      </label>
                      <input
                        type="number"
                        value={specialAllowance}
                        onChange={(e) => setSpecialAllowance(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uniform Refund
                      </label>
                      <input
                        type="number"
                        value={uniformRefund}
                        onChange={(e) => setUniformRefund(e.target.value)}
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
