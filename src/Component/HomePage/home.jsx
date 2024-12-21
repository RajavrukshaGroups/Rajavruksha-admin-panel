import { Link } from "react-router-dom";

const HomePageComponent = () => {
  return (
    <div>
      <div>
        <Link to="/projects" className="text-blue-500 hover:underline">
          Create Projects
        </Link>
      </div>
      <div>
        <Link to="/careers" className="text-blue-500 hover:underline">
          Careers Details
        </Link>
      </div>
    </div>
  );
};

export default HomePageComponent;
