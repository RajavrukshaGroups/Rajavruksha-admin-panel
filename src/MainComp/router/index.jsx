import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../HomePage/homePage";
import ProjectsPage from "../ProjectsPage/projectsPage";
import CareersPage from "../CareersPage/careersPage";
import Login from "../../Component/Login/login";
import CareerDetails from "../../Component/CareerDetails/careerDetails";
import CareerIndDetailPage from "../../Component/CareerDetails/careerIndDetails";
import CareerEditForm from "../../Component/CareersPage/careerEditForm";
import Logout from "../../Component/Logout/logout";
import BusinessDevelopmentExecutive from "../../Component/BDE/bde";
import BusinessDevelopmentExecutiveIntern from "../../Component/BDEInt/bdeInt";
import UserList from "../../Component/CareersPage/usersList";
import PrivateRoute from "../PrivateRoute/privateRoute";
import ErrorPage from "../ErrorPage/errorPage";
import MainCareersPage from "../MainCareers/mainCareers";
import MainHomePage from "../MainHomePage/mainHomePage";
import MainUsersList from "../MainUsersList/mainUsersList";
import MainCareerEdit from "../MainCareerEdit/mainCareerEdit";
import MainCareerIndPage from "../MainCareerInd/mainCareerInd";
const AllRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* Protected Routes (requires login) */}
        <Route element={<PrivateRoute />}>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<MainHomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          {/* <Route path="/careers" element={<CareerDetails />} /> */}
          <Route path="/careers" element={<MainCareersPage />} />

          <Route path="/career-form" element={<CareersPage />} />
          {/* <Route path="/career-details/:id" element={<CareerIndDetailPage />} /> */}
          <Route path="/career-details/:id" element={<MainCareerIndPage />} />

          {/* <Route path="/career-edit/:id" element={<CareerEditForm />} /> */}
          <Route path="/career-edit/:id" element={<MainCareerEdit />} />

          {/* <Route path="/users/:designation" element={<UserList />} /> */}
          <Route path="/users/:designation" element={<MainUsersList />} />

          {/* <Route path="bde-details" element={<BusinessDevelopmentExecutive />} />
        <Route
          path="bdeInt-details"
          element={<BusinessDevelopmentExecutiveIntern />}
        /> */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AllRoute;
