import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CareerIndDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchCareerDetail = async () => {
      try {
        const response = await fetch(
          `https://rrplserver.rajavrukshagroup.in/getIndCareer/${id}`
          // `http://localhost:3000/getIndCareer/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch career details");
        }
        const data = await response.json();
        setCareer(data.data);
        console.log("career", data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerDetail();
  }, [id]);

  const handleEditClick = () => {
    navigate(`/career-edit/${id}`);
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `https://rrplserver.rajavrukshagroup.in/deleteCareer/${id}`,
        // `http://localhost:3000/deleteCareer/${id}`,

        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete career");
      }
      navigate("/careers"); // Navigate back to the careers page
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!career) {
    return <div>Career not found</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100 relative">
      {/* Buttons Layout */}
      <div className="absolute top-4 right-4 flex space-x-4">
        <button
          onClick={handleEditClick}
          className="bg-yellow-500 text-white px-6 py-2 rounded-md shadow-lg hover:bg-yellow-600 transition-all"
        >
          Edit
        </button>
        <button
          onClick={handleDeleteClick}
          className="bg-red-500 text-white px-3 py-2 rounded-md shadow-lg hover:bg-red-600 transition-all"
        >
          Delete
        </button>
      </div>

      {/* Career Detail Layout */}
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-4xl font-bold mb-6 capitalize">{career.title}</h2>

        {/* Image Display */}
        {career.image && career.image.url && (
          <img
            src={career.image.url}
            alt={career.title}
            className="w-full h-72 object-cover mb-6"
          />
        )}

        {/* Career Description */}
        <h2 className="text-4xl font-bold mb-6 capitalize">
          {career.shortTitle}
        </h2>

        <div className="text-lg mb-4">
          <h3 className="font-semibold text-xl">Description</h3>
          <p>{career.description}</p>
        </div>

        {/* Career Location */}
        {career.location && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Location</h3>
            <p>{career.location}</p>
          </div>
        )}

        {/* Career Qualifications */}
        {career.qualifications && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Qualifications</h3>
            <p>{career.qualifications}</p>
          </div>
        )}

        {/* Career Salary */}
        {career.salary && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Salary</h3>
            <p>{career.salary}</p>
          </div>
        )}

        {/* Category */}
        {career.category && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Category</h3>
            <p>{career.category}</p>
          </div>
        )}

        {/* Age Range */}
        {career.age && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Age Range</h3>
            <p>{career.age}</p>
          </div>
        )}

        {/* Experience */}
        {career.experience && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Experience</h3>
            <p>{career.experience}</p>
          </div>
        )}

        {/* Job Type */}
        {career.jobType && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Job Type</h3>
            <p>{career.jobType}</p>
          </div>
        )}

        {/* Skills List */}
        {career.skills && career.skills.length > 0 && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Skills</h3>
            <ul className="list-disc pl-6">
              {career.skills.map((skill, index) => (
                <li key={index} className="text-md">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timings */}
        {career.timings && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Timings</h3>
            <p>{career.timings}</p>
          </div>
        )}

        {career.link && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Link</h3>
            <p>{career.link}</p>
          </div>
        )}

        {/* Created At */}
        {career.createdAt && (
          <div className="text-lg mb-4">
            <h3 className="font-semibold text-xl">Posted On</h3>
            <p>{new Date(career.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this career?
            </h3>
            <div className="flex justify-between">
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerIndDetailPage;
