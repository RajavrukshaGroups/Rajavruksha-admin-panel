import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./careerDetails.css";

const CareerDetails = () => {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const fetchCareerDetails = async () => {
      try {
        const response = await fetch(
          "https://rrplserver.rajavrukshagroup.in/getCareers"
          // "http://localhost:5000/getCareers"
        );
        // const response = await fetch("http://localhost:3000/getCareers");
        if (!response.ok) {
          throw new Error("Failed to fetch career details");
        }
        const data = await response.json();
        setCareers(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerDetails();
  }, []);

  const handleClick = () => {
    navigate("/career-form");
  };

  const handleCardClick = (id) => {
    navigate(`/career-details/${id}`);
  };

  const handleDeleteClick = (id) => {
    setCareerToDelete(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `https://rrplserver.rajavrukshagroup.in/deleteCareer/${careerToDelete}`,
        // `http://localhost:5000/deleteCareer/${careerToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete career");
      }

      // Update state to remove the deleted career from the UI
      setCareers(careers.filter((career) => career._id !== careerToDelete));
      setConfirmDelete(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setCareerToDelete(null);
  };

  const handleEditClick = (id) => {
    navigate(`/career-edit/${id}`); // Navigate to the edit form page
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const filteredCareers = careers.filter((career) =>
    career.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen relative p-4">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {/* Search box */}
        <input
          type="text"
          className="border border-gray-300 px-4 py-2 rounded-md"
          placeholder="Search career title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Add button */}
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600 transition-all"
        >
          Add New Career
        </button>
      </div>

      <div className="text-center mt-16">
        <h2 className="text-3xl font-semibold">Career List</h2>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCareers.length > 0 ? (
            filteredCareers.map((career) => (
              <div
                key={career._id}
                className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => handleCardClick(career._id)}
              >
                {career.image && career.image.url && (
                  <img
                    src={career.image.url}
                    alt={career.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="px-6 py-4 flex flex-col justify-between h-[150px]">
                  <h3 className="text-xl font-semibold text-center capitalize">
                    {career.title}
                  </h3>

                  {/* Edit and Delete Buttons */}
                  <div className="flex justify-between mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(career._id);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-yellow-600 transition-all mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(career._id);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-red-600 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No careers available.</p>
          )}
        </div>
      </div>

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
      <div className="btn-home">
        <button
          onClick={handleHomeClick}
          className="absolute bottom-4 right-4 w-28 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-green-600 transition-all"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default CareerDetails;
