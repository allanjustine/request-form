import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

interface Branch {
  id: number;
  branch: string;
  branch_code: string;
  branch_id: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface Record {
  id: number;
  user_id: number;
  branch_id: number[];
  branches: {
    message: string;
    data: Branch[];
  }[];
  user: UserObject;
}

interface UserObject {
  message: string;
  data: User;
  status: boolean;
}

const EditBranchHead = ({
  editModal,
  editModalClose,
  openSuccessModal,
  selectedUser,
  refreshData,
  branchHeadId,
  modalIsOpen,
}: {
  editModal: boolean;
  openCompleteModal: any;
  closeModal: any;
  modalIsOpen: boolean;
  branchHeadId: number;
  editModalClose: any;
  openSuccessModal: any;
  entityType: string;
  selectedUser: any;
  closeSuccessModal: any;
  refreshData: any;
}) => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [initialSelectedBranches, setInitialSelectedBranches] = useState<
    number[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchHeadData, setBranchHeadData] = useState<Record | null>(null);

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
          `${process.env.REACT_APP_API_BASE_URL}/view-branch-head/${selectedUser.id}`,
          {
            headers,
          }
        );

        setBranchHeadData(response.data.data);

        // If selectedUser has branches, pre-select them
        if (selectedUser?.branch_id) {
          setSelectedBranches(selectedUser.branch_id);
          setInitialSelectedBranches(selectedUser.branch_id); // Save the initial selected branches
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        // Handle error state or show error message
      } finally{
        setLoading(false)
      }
    };

    if (selectedUser) {
      fetchBranches();
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchBranchHeadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/branch-head/${branchHeadId}`, // Replace with your API endpoint to fetch branch head data
          {
            headers,
          }
        );

        // Assuming your API response includes selected branch IDs for the branch head
        const selectedBranchIds = response.data.selected_branches.map(
          (branch: any) => branch.id
        );
        setSelectedBranches(selectedBranchIds);
        setInitialSelectedBranches(selectedBranchIds); // Save the initial selected branches
      } catch (error) {
        console.error("Error fetching branch head data:", error);
        setError("Failed to fetch branch head data");
      }
    };

    if (modalIsOpen && branchHeadId) {
      fetchBranchHeadData();
    }
  }, [modalIsOpen, branchHeadId]);

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
      }
    };

    if (selectedUser) {
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedUser]);

  const handleCheckboxChange = (id: number) => {
    if (selectedBranches.includes(id)) {
      setSelectedBranches(
        selectedBranches.filter((branchId) => branchId !== id)
      );
    } else {
      setSelectedBranches([...selectedBranches, id]);
    }
  };

  if (!editModal) {
    return null;
  }

  const handleConfirmSelection = async () => {
    if (selectedBranches.length > 0) {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Example of PUT request to update branch head with selectedBranches
        const putData = {
          user_id: selectedUser.user_id,
          branch_id: selectedBranches, // Ensure this is an array of branch IDs
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/update-branch-head/${selectedUser.user_id}`,
          putData,
          {
            headers,
          }
        );

        // Assuming successful, close modal or show success message
        openSuccessModal();
        editModalClose();
        refreshData();
        setIsLoading(false); // Refresh parent data if needed
      } catch (error) {
        console.error("Error updating branch head:", error);
        setIsLoading(false);
        setError("Failed to update branch head. Please try again."); // Show error message
      }
    } else {
      setError("Please select at least one branch."); // Show error message
    }
    setError("");
  };

  const handleCancel = () => {
    setSelectedBranches(initialSelectedBranches); // Reset to the initial selected branches
    editModalClose();
  };

  const handleRemoveBranch = (branchIdToRemove: number) => {
    setSelectedBranches(
      selectedBranches.filter((id) => id !== branchIdToRemove)
    );
  };
  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50">
      <div className="p-4 w-10/12 sm:w-1/3 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold h-full text-white">
          Edit Branch Head
        </h2>
        <XMarkIcon
          className="absolute text-black cursor-pointer size-6 right-3"
          onClick={handleCancel}
        />
      </div>
      <div className="relative w-10/12 overflow-y-auto bg-white sm:w-1/3 x-20 h-1/2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader size={35} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          <div className="bg-white flex-col w-10/12 sm:w-full  rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex space-x-2">
            <h3 className="p-4 text-lg font-bold">
              Branches for{" "}
              {`${selectedUser?.user.data.firstName} ${selectedUser?.user.data.lastName}`}
              :
            </h3>
            <input
              type="text"
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 mb-2 border border-gray-300 rounded-md "
            />
            <div className="h-auto px-4">
              {branches.length === 0 ? (
                <ClipLoader size={35} color={"#123abc"} loading={loading} />
              ) : (
                branches
                  .filter((branch) => {
                    const branchName = branch.branch.toLowerCase();
                    const branchCode = branch.branch_code.toLowerCase();
                    const query = searchQuery.toLowerCase();
                    return (
                      branchName.includes(query) || branchCode.includes(query)
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
        )}
      </div>
      <div className="flex flex-wrap w-10/12 gap-2 p-2 overflow-y-auto bg-white shadow-lg sm:w-1/3 bottom-4 right-4 max-h-48">
        {selectedBranches.map((branchId) => {
          const branch = branches.find((b) => b.id === branchId);
          return (
            <div
              key={branchId}
              className="relative p-3 mb-2 bg-gray-300 rounded-sm"
            >
              <XMarkIcon
                className="absolute top-0 right-0 text-gray-500 cursor-pointer size-4"
                onClick={() => handleRemoveBranch(branchId)}
              />

              <div>
                <p>{branch?.branch}</p>
                <p>{branch?.branch_code}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white justify-end w-10/12 sm:w-1/3 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex space-x-2">
        <button
          onClick={handleCancel}
          className="h-12 px-4 py-2 font-bold text-white bg-gray-500 rounded cursor-pointer hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmSelection}
          className="h-12 px-4 py-2 font-bold text-white rounded cursor-pointer bg-primary hover:bg-blue-400"
        >
          {isLoading ? <ClipLoader color="#36d7b7" /> : "Update Branch Head"}
        </button>
      </div>
      {error && (
        <div className="p-2 mt-2 text-white bg-red-500 rounded">{error}</div>
      )}
    </div>
  );
};

export default EditBranchHead;