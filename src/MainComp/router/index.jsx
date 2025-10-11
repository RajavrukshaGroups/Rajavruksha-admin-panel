// AllRoute.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectsPage from "../ProjectsPage/projectsPage";
import CareersPage from "../CareersPage/careersPage";
import Login from "../../Component/Login/login";
import Logout from "../../Component/Logout/logout";
import PrivateRoute from "../PrivateRoute/privateRoute";
import ErrorPage from "../ErrorPage/errorPage";
import MainCareersPage from "../MainCareers/mainCareers";
import MainHomePage from "../MainHomePage/mainHomePage";
import MainUsersList from "../MainUsersList/mainUsersList";
import MainCareerEdit from "../MainCareerEdit/mainCareerEdit";
import MainCareerIndPage from "../MainCareerInd/mainCareerInd";
import AdminMain from "../../Component/adminAccess/adminMain/adminMain";

import ProtectedRoute from "../../Component/adminAccess/protectRoute/protectRoute";
import OtpVerifyPage from "../../Component/adminAccess/otpVerifyPage/otpVerifyPage";
import AdminCompany from "../../Component/adminAccess/adminCompany/adminCompany";
import AdminEmployees from "../../Component/adminAccess/adminEmployees/viewAdminEmployees";
import EditCompanyDetails from "../../Component/adminAccess/editCompany/editCompany";
import ViewAdminDept from "../../Component/adminAccess/adminDepartments/viewAdminDept";
import ViewAdminEmployees from "../../Component/adminAccess/adminEmployees/viewAdminEmployees";
import AdminViewSalary from "../../Component/adminAccess/adminViewSalary/adminViewSalary";
import { ToastContainer } from "react-toastify";

const AllRoute = () => {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* Routes that require the regular authenticated user (PrivateRoute) */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainHomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/careers" element={<MainCareersPage />} />
          <Route path="/career-form" element={<CareersPage />} />
          <Route path="/career-details/:id" element={<MainCareerIndPage />} />
          <Route path="/career-edit/:id" element={<MainCareerEdit />} />
          <Route path="/users/:designation" element={<MainUsersList />} />

          <Route path="/admin/company" element={<AdminCompany />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route
            path="/admin/company/edit/:id"
            element={<EditCompanyDetails />}
          />
          <Route
            path="/admin/companies/:companyId/departments"
            element={<ViewAdminDept />}
          />
          <Route
            path="/admin/companies/:companyId/departments/:deptId/employees"
            element={<ViewAdminEmployees />}
          />

          <Route
            path="/admin/companies/:companyId/departments/:deptId/employees/:employeeId"
            element={<AdminViewSalary />}
          />
          <Route path="/admin" element={<AdminMain />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AllRoute;
