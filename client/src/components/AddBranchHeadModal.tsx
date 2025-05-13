import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

type User = {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  branch_code: string;
  email: string;
  role: string;
  contact: string;
  position: string;
};

type Branch = {
  id: number;
  branch: string;
  branch_code: string;
};

const AddBranchHeadModal = ({
  modalIsOpen,
  closeModal,
  openCompleteModal,
  entityType,
  refreshData,
}: {
  modalIsOpen: boolean;
  closeModal: any;
  openCompleteModal: any;
  entityType: string;
  refreshData: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-users`,
          {
            headers,
          }
        );

        const transformedData = response.data.data
          .filter(
            (item: User) => item.position.trim() === "Branch Supervisor/Manager"
          )
          .map((item: User) => ({
            id: item.id,
            name: `${item.firstname} ${item.lastname}`,
            branch_code: item.branch_code,
            email: item.email,
            role: item.role.trim(),
            position: item.position,
          }));

        setUsers(transformedData);
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (modalIsOpen) {
      fetchUsers();
    }
  }, [modalIsOpen]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`,
          {
            headers,
          }
        );

        setBranches(response.data.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setError("Failed to fetch branches");
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedUser) {
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Check if at least one branch is selected
    setIsButtonVisible(selectedBranches.length > 0);
  }, [selectedBranches]);

  const handleCheckboxChange = (id: number) => {
    if (selectedBranches.includes(id)) {
      setSelectedBranches(
        selectedBranches.filter((branchId) => branchId !== id)
      );
    } else {
      setSelectedBranches([...selectedBranches, id]);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedUser && selectedBranches.length > 0) {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Example of POST request to add branch head with selectedBranches
        const postData = {
          user_id: selectedUser.id,
          branch_id: selectedBranches, // Ensure this is an array of branch IDs
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/create-branch-head`,
          postData,
          {
            headers,
          }
        );
        // Assuming successful, close modal or show success message
        setIsLoading(false);
        closeModal();
        openCompleteModal(); // Implement your completion modal or alert
        setSelectedUser(null);
        setSelectedBranches([]);
        refreshData(); // Refresh parent data if needed
      } catch (error) {
        console.error("Error creating branch head:", error);
        setIsLoading(false);
        // Handle error state or show error message
      }
    } else {
      // Handle case where user or branches are not selected
      console.warn("Please select a user and at least one branch.");
    }
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setSelectedBranches([]);
    closeModal();
  };

  if (!modalIsOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50">
      <div className="p-4 w-10/12 sm:w-1/3 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
        </h2>
        <XMarkIcon
          className="absolute text-black cursor-pointer size-6 right-3"
          onClick={closeModal}
        />
      </div>
      <div className="relative w-10/12 overflow-y-auto bg-white sm:w-1/3 x-20 h-2/3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader size={35} color={"#389df1"} loading={loading} />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            <ClipLoader size={35} color={"#123abc"} />
          </div>
        ) : (
          <div>
            {selectedUser ? (
              <div className="bg-white flex-col w-10/12 sm:w-full h-1/2 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex space-x-2">
                <h3 className="p-4 text-lg font-bold">
                  Branches for {`${selectedUser.name} `}:
                </h3>
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 mb-2 bg-white border border-black rounded-md "
                />
                <div className="px-4">
                  {branches.length === 0 ? (
                    <ClipLoader size={35} color={"#123abc"} loading={loading} />
                  ) : (
                    branches
                      .filter((branch) => {
                        const branchName = branch.branch.toLowerCase();
                        const branchCode = branch.branch_code.toLowerCase();
                        const query = searchQuery.toLowerCase();
                        return (
                          branchName.includes(query) ||
                          branchCode.includes(query)
                        );
                      })
                      .map((branch) => (
                        <div
                          key={branch.id}
                          className="flex items-center justify-between mb-2 bg-blue-100"
                        >
                          <div className="flex items-center justify-between w-full p-4">
                            <div>
                              <p>{branch.branch}</p>
                              <p>{branch.branch_code}</p>
                            </div>
                            <div>
                              <input
                                type="checkbox"
                                checked={selectedBranches.includes(branch.id)}
                                onChange={() => handleCheckboxChange(branch.id)}
                                className="mx-1 text-blue-500 cursor-pointer size-5"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="px-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 ? (
                        <>
                          <tr>
                            <td colSpan={3} className="text-center">
                              No users found
                            </td>
                          </tr>
                        </>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className={`cursor-pointer hover:bg-gray-200  ${
                              selectedUser === user.id ? "bg-blue-200" : ""
                            }`}
                            onClick={() => setSelectedUser(user)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {user.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {`${user.name}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {user.email}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isButtonVisible ? (
        <div className="bg-white w-10/12 sm:w-1/3 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 justify-end flex space-x-2">
          <button
            onClick={handleCancel}
            className="h-12 px-4 py-2 font-bold text-white bg-gray-500 rounded cursor-pointer hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            className="h-12 px-4 py-2 font-bold text-white rounded cursor-pointer hover:bg-blue-400 bg-primary"
          >
            {isLoading ? <ClipLoader color="#36d7b7" /> : "Add Branch Head"}
          </button>
        </div>
      ) : (
        <div className="bg-white w-10/12 sm:w-1/3 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex justify-end space-x-2" />
      )}
    </div>
  );
};
export default AddBranchHeadModal;
