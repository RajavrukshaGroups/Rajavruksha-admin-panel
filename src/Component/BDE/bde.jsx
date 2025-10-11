import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BusinessDevelopmentExecutive = () => {
  const [bdeData, setBdeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchBdeData = async () => {
      try {
        const response = await fetch(
          "https://rrplserver.rajavrukshagroup.in/bdeCareerDetails"
          // "https://server.rajavrukshagroup.in/bdeCareerDetails"
          // "http://localhost:3000/bdeCareerDetails"
        );
        const data = await response.json();

        if (data.success) {
          setBdeData(data.data);
        } else {
          console.error("Failed to fetch BDE data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching BDE data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBdeData();
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://rrplserver.rajavrukshagroup.in/deleteSubmittedFormData/${selectedUserId}`,
        // `http://localhost:3000/deleteSubmittedFormData/${selectedUserId}`,

        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        setBdeData((prevData) =>
          prevData.filter((user) => user._id !== selectedUserId)
        );
        alert("User deleted successfully.");
      } else {
        console.error("Failed to delete user:", data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setModalOpen(false); // Close the modal
      setSelectedUserId(null);
    }
  };

  const openModal = (userId) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUserId(null);
  };

  // Function to handle navigation to the home page
  const goHome = () => {
    navigate("/"); // Redirects to the home page
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Small Home Button */}
      <button
        onClick={goHome}
        className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-green-600 transition-all w-auto"
      >
        Home
      </button>

      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-6">
        Business Development Executive
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : bdeData.length > 0 ? ( // Check if data exists
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bdeData.map((user) => (
            <div
              key={user._id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 capitalize">
                {user.name}
              </h2>
              <p className="text-gray-600 capitalize">
                Designation: {user.designation}
              </p>
              <p className="text-gray-600">
                Email:
                <a
                  href={`mailto:${user.email}`}
                  className="text-blue-500 hover:underline"
                >
                  {user.email}
                </a>
              </p>
              <p className="text-gray-600">
                Contact No:
                <a
                  href={`tel:${user.contact_no}`}
                  className="text-blue-500 hover:underline"
                >
                  {user.contact_no}
                </a>
              </p>

              {user.file && user.file.url && (
                <div className="mt-4">
                  <a
                    href={user.file.url}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Resume
                  </a>
                </div>
              )}
              <button
                onClick={() => openModal(user._id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-red-600 transition-all w-auto"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No Data Available</p> // Message for no data
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              Are you sure you want to delete this user?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDevelopmentExecutive;
