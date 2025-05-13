import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

type Record = {
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

const AddApproverModal = ({
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
  const [isLoading, setisLoading] = useState(false);
  const [users, setUsers] = useState<Record[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

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

        // Filter and map data to desired format
        const transformedData = response.data.data
          .filter((item: Record) => item.role.trim() === "User")
          .map((item: Record) => ({
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
      } finally{
        setLoading(false);
      }
    };


    if (modalIsOpen) {
      fetchUsers();
    }
  }, [modalIsOpen]);

  const filteredApproverlist = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(filterTerm.toLowerCase())
    )
  );

  useEffect(() => {
    // Check if at least one user is selected
    setIsButtonVisible(selectedUsers.length > 0);
  }, [selectedUsers]);

  const handleCheckboxChange = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleConfirmSelection = async () => {
    try {
      setisLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const data = {
        role: "approver",
        userIds: selectedUsers,
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/update-role`,
        data,
        { headers }
      );
      setisLoading(false);
      openCompleteModal();
      refreshData();
      setSelectedUsers([]);

      // Optionally handle success message or UI updates after successful update
    } catch (error) {
      setisLoading(false);
      console.error("Error updating role:", error);
    }
  };

  const handleCancel = () => {
    // Reset all selected users
    setSelectedUsers([]);
  };

  if (!modalIsOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 ">
      <div className="p-4  w-10/12 md:w-1/2 lg:w-1/3 relative bg-primary flex justify-center mx-20  border-b rounded-t-[12px]">
        <h2 className="text-center  text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
        </h2>
        <XMarkIcon
          className="absolute text-black cursor-pointer size-6 right-3"
          onClick={closeModal}
        />
      </div>

      <div className="relative w-10/12 overflow-x-hidden overflow-y-auto bg-white md:w-1/2 lg:w-1/3 x-20 h-2/3">
        <div className="relative w-full my-2 sm:mx-0 md:mx-4 sm:px-5 lg:px-5 lg:mx-0">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-3 bg-white border border-black rounded-md"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Search approvers"
            />
            <MagnifyingGlassIcon className="absolute w-5 h-5 text-black transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader size={35} color={"#389df1"} loading={loading} />
          </div>
        ) : (
          <div className="">
            {filteredApproverlist.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between mb-2 ${
                  index % 2 === 0 ? "bg-white" : "bg-blue-100"
                }`}
              >
                <div className="flex items-center justify-between w-full p-4">
                  <div>
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                    <p>{user.position}</p>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="mx-1 text-blue-500 cursor-pointer size-5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isButtonVisible && (
        <div className="bg-white w-10/12 md:w-1/2 lg:w-1/3 rounded-b-[12px] justify-end shadow-lg p-2 bottom-4 right-4 flex space-x-2">
          <button
            onClick={handleCancel}
            className="h-12 px-4 py-2 font-bold text-white bg-gray-500 rounded cursor-pointer hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            className="h-12 px-4 py-2 font-bold text-white rounded cursor-pointer bg-primary hover:bg-blue-400"
          >
            {isLoading ? "Adding..." : "Add Approver"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddApproverModal;
