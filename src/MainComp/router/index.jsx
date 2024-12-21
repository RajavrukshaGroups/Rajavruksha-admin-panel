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
const AllRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainHomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/careers" element={<MainCareersPage />} />
          <Route path="/career-form" element={<CareersPage />} />
          <Route path="/career-details/:id" element={<MainCareerIndPage />} />
          <Route path="/career-edit/:id" element={<MainCareerEdit />} />
          <Route path="/users/:designation" element={<MainUsersList />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AllRoute;
