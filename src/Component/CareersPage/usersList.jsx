import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./users.css";

const UserList = () => {
  const { designation } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Track the user to be deleted
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `https://rrplserver.rajavrukshagroup.in/getUserByDesignation?designation=${designation}`
          // `http://localhost:5000/getUserByDesignation?designation=${designation}`
        );
        const data = await response.json();
        console.log("data-users", data);

        if (data.success) {
          setUsers(data.users);
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [designation]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://rrplserver.rajavrukshagroup.in/deleteSubmittedFormData/${userToDelete}`,
        // `http://localhost:5000/deleteSubmittedFormData/${userToDelete}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        // Remove the user from the UI after successful deletion
        setUsers(users.filter((user) => user._id !== userToDelete));
        setIsModalOpen(false); // Close the modal after successful deletion
      } else {
        console.error("Failed to delete user:", data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openModal = (id) => {
    setUserToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 capitalize">
          {designation}
        </h1>
        <div className="btn-container">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found for designation "{designation}"</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Contact No</th>
              <th className="border border-gray-300 px-4 py-2">Resume</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="border border-gray-300 px-4 py-2 capitalize">
                  {user.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href={`mailto:${user.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {user.email}
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <a
                    href={`tel:${user.contact_no}`}
                    className="text-blue-500 hover:underline"
                  >
                    {user.contact_no}
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2 hover:underline">
                  <a
                    href={user.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View File
                  </a>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md py-1 px-3"
                    onClick={() => openModal(user._id)} // Open the modal with the user's ID
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-1/3">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Are you sure?
            </h2>
            <p className="text-gray-600 mb-4">
              Do you really want to delete this user?
            </p>
            <div className="flex justify-between gap-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-md py-2 px-4"
                onClick={closeModal} // Close the modal
              >
                No
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md py-2 px-4"
                onClick={handleDelete} // Confirm deletion
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
