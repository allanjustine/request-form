import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import SuccessModal from "./SuccessModal";
import CompleteModal from "./CompleteModal";
import DeleteSuccessModal from "./DeleteSucessModal";
import DeleteModal from "./DeleteModal";
import ViewUserModal from "./ViewUserModal";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

type Props = {};

type Record = {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  branch_code: string;
  email: string;
  role: string;
  contact: string;
  username: string;
  branch: string;
  position: string;
  profile_picture: string;
  email_verified_at: string;
  verification_status: string;
};

const SetupUser = (props: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeletedSuccessModal, setShowDeletedSuccessModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Record | null>(null);
  const [userList, setUserList] = useState<Record[]>([]);
  const userId = localStorage.getItem("id");
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [toVerify, setToVerify] = useState(false);
  const [toVerifyId, setToVerifyId] = useState<number>(0);
  const [verifyingLoading, setVerifyingLoading] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;

        // Create a mapping of id to branch_code
        const branchMapping = new Map<number, string>(
          branches.map((branch: { id: number; branch_code: string }) => [
            branch.id,
            branch.branch_code,
          ])
        );

        setBranchList(branches);
        setBranchMap(branchMapping);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);

  const [filterTerm, setFilterTerm] = useState("");
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          console.error("User ID is missing");
          return;
        }

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

        // Transform data to match columns selector
        const transformedData = response.data.data.map(
          (item: Record, index: number) => ({
            id: item.id,
            firstname: item.firstname,
            lastname: item.lastname,
            username: item.username,
            branch_code: item.branch_code,
            email: item.email,
            role: item.role,
            contact: item.contact,
            branch: item.branch,
            position: item.position,
            profile_picture: item.profile_picture,
            email_verified_at: item.email_verified_at,
            verification_status: item.verification_status,
          })
        );

        setUserList(transformedData);
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, verifyingLoading]);

  const filteredUserList = userList.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(filterTerm.toLowerCase())
    )
  );
  const deleteUser = async () => {
    try {
      if (!userId || !selectedUser) {
        console.error("User ID or selected user is missing");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/delete-user/${selectedUser.id}`,
        {
          headers,
        }
      );

      if (response.data.status) {
        closeDeleteModal();
        openDeleteSuccessModal();
        refreshData();
      } else {
        console.error("Failed to delete user:", response.data.message);
        // Handle error scenario, show error message or alert
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      // Handle error scenario, show error message or alert
    }
  };

  const deleteModalShow = (row: Record) => {
    setSelectedUser(row);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const editModalShow = (row: Record) => {
    setSelectedUser(row);

    setEditModal(true);
  };

  const editModalClose = () => {
    setEditModal(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openCompleteModal = () => {
    setShowCompleteModal(true);
    setModalIsOpen(false);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };

  const openSuccessModal = () => {
    setShowSuccessModal(true);
    setEditModal(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const openDeleteSuccessModal = () => {
    setShowDeletedSuccessModal(true);
    setDeleteModal(false);
  };

  const closeDeleteSuccessModal = () => {
    setShowDeletedSuccessModal(false);
  };

  const viewModalShow = (row: Record) => {
    setSelectedUser(row);
    setViewModalIsOpen(true);
  };

  const viewModalClose = () => {
    setSelectedUser(null);
    setViewModalIsOpen(false);
  };

  const handleToVerify = (row: Record) => {
    setToVerifyId(row.id);
    setSelectedUser(row);
    setToVerify(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedUser(null);
    setToVerify(false);
  };

  const handleVerify = async (toVerifyId: number) => {
    setVerifyingLoading((prev) => ({ ...prev, [toVerifyId]: true }));
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/verified-user/${toVerifyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Verified",
          text: response.data.message,
          confirmButtonText: "Close",
          confirmButtonColor: "#007bff",
        });
      }
    } catch (error: any) {
      console.error("Error verifying user:", error);
      if (error.response.status === 409 || error.response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data.message,
          confirmButtonText: "Close",
          confirmButtonColor: "#007bff",
        });
      }
    } finally {
      setVerifyingLoading((prev) => ({ ...prev, [toVerifyId]: false }));
      setToVerify(false);
    }
  };
  const refreshData = async () => {
    try {
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

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

      // Transform data to match columns selector
      const transformedData = response.data.data.map(
        (item: Record, index: number) => ({
          id: item.id,
          firstname: item.firstname,
          lastname: item.lastname,
          username: item.username,
          branch_code: item.branch_code,
          email: item.email,
          role: item.role,
          contact: item.contact,
          branch: item.branch,
          position: item.position,
          email_verified_at: item.email_verified_at,
          verification_status: item.verification_status,
        })
      );

      setUserList(transformedData);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
  };
  const columns = [
    {
      name: "ID",
      selector: (row: Record) => row.id,
      width: "80px",
      sortable: true,
    },
    {
      name: "Name",
      selector: (row: Record) => `${row.firstname} ${row.lastname}`,
      sortable: true,
    },

    {
      name: "Branch code",
      sortable: true,
      selector: (row: Record) => {
        const branchId = parseInt(row.branch_code, 10);
        return branchMap.get(branchId) || "Unknown";
      },
    },
    {
      name: "Email",
      selector: (row: Record) => row.email,
      sortable: true,
    },
    {
      name: "Role",
      selector: (row: Record) => row.role,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Record) => row.verification_status,
      cell: (row: Record) =>
        row.verification_status === "Verified" ? (
          <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 rounded-md bg-blue-50 ring-1 ring-inset ring-blue-600/20">
            {row.verification_status}
          </div>
        ) : (
          <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 rounded-md bg-red-50 ring-1 ring-inset ring-red-600/10">
            {row.verification_status}
          </div>
        ),
      sortable: true,
    },
    {
      name: "Action",
      sortable: true,
      cell: (row: Record) => (
        <div className="flex items-center gap-2">
          {/* Edit button */}
          <PencilSquareIcon
            className="w-5 h-5 cursor-pointer text-primary"
            onClick={() => editModalShow(row)}
          />

          {/* Delete button */}
          <TrashIcon
            className="w-5 h-5 text-red-600 cursor-pointer"
            onClick={() => deleteModalShow(row)}
          />

          {/* View button */}
          <button
            className="px-3 py-1 text-white transition duration-150 rounded-md bg-primary"
            onClick={() => viewModalShow(row)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>

          {/* Verify button */}
          {row.email_verified_at === null && (
            <button
              key={row.id}
              className="px-3 py-1 text-white transition duration-150 rounded-md bg-green"
              onClick={() => handleToVerify(row)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full px-4 pt-4 bg-graybg dark:bg-blackbg sm:px-10 md:px-10 lg:px-30 xl:px-30">
      <div className="w-full h-auto rounded-lg drop-shadow-lg md:mr-4">
        <div className="flex flex-col w-full overflow-x-auto bg-white rounded-lg">
          <h1 className="pl-4 sm:pl-[30px] text-[24px] text-left py-4 text-primary font-bold mr-2 underline decoration-2 underline-offset-8">
            User
          </h1>
          <div className="flex items-end justify-end mx-2 bg-white">
            <div>
              <button
                className="bg-primary text-white rounded-[12px] p-2"
                onClick={openModal}
              >
                + Add User
              </button>
            </div>
          </div>
          <div className="relative w-2/12 my-2 sm:mx-0 md:mx-4">
            <div className="relative flex-grow">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-3 bg-white border border-black rounded-md"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Search user"
              />
              <MagnifyingGlassIcon className="absolute w-5 h-5 text-black transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
            </div>
          </div>
          {loading ? (
            <table className="table" style={{ background: "white" }}>
              <thead>
                <tr>
                  <th
                    className="py-6"
                    style={{ color: "black", fontWeight: "bold" }}
                  >
                    ID
                  </th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Name</th>
                  <th style={{ color: "black", fontWeight: "bold" }}>
                    Branch code
                  </th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Email</th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Role</th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Status</th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="w-full border border-gray-200" colSpan={10}>
                      <div className="flex justify-center">
                        <div className="flex flex-col w-full gap-4">
                          <div className="w-full h-12 skeleton bg-slate-300"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <DataTable
              columns={columns}
              data={filteredUserList}
              pagination
              striped
              noDataComponent={
                filteredUserList.length === 0 ? (
                  <p className="flex flex-col items-center justify-center h-64">
                    {filterTerm
                      ? "No " + `"${filterTerm}"` + " found"
                      : "No data available."}
                  </p>
                ) : (
                  <ClipLoader color="#36d7b7" />
                )
              }
              customStyles={{
                headRow: {
                  style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "black",
                    backgroundColor: "#FFFF",
                  },
                },
                rows: {
                  style: {
                    color: "black", // Adjust as per your design
                    backgroundColor: "#E7F1F9", // Adjust as per your design
                  },
                  stripedStyle: {
                    color: "black", // Adjust as per your design
                    backgroundColor: "#FFFFFF", // Adjust as per your design
                  },
                },
              }}
            />
          )}
        </div>
      </div>
      <AddUserModal
        refreshData={refreshData}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        openCompleteModal={openCompleteModal}
        entityType="User"
      />
      <DeleteModal
        refreshData={refreshData}
        onDelete={deleteUser}
        deleteModal={deleteModal}
        closeDeleteModal={closeDeleteModal}
        openDeleteSuccessModal={openDeleteSuccessModal}
        entityType="User"
      />
      <DeleteSuccessModal
        showDeleteSuccessModal={showDeletedSuccessModal}
        closeDeleteSuccessModal={closeDeleteSuccessModal}
        openDeleteSuccessModal={openDeleteSuccessModal}
        entityType="User"
      />
      <CompleteModal
        showCompleteModal={showCompleteModal}
        closeCompleteModal={closeCompleteModal}
        openCompleteModal={openCompleteModal}
        entityType="User"
      />
      <EditUserModal
        refreshData={refreshData}
        editModal={editModal}
        editModalClose={editModalClose}
        openSuccessModal={openSuccessModal}
        entityType="User"
        selectedUser={selectedUser}
      />
      <SuccessModal
        showSuccessModal={showSuccessModal}
        closeSuccessModal={closeSuccessModal}
        openSuccessModal={openSuccessModal}
        entityType="User"
      />
      <ViewUserModal
        modalIsOpen={viewModalIsOpen}
        closeModal={viewModalClose}
        user={selectedUser}
      />

      {toVerify && (
        <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 ">
          <div className=" p-4  w-1/2 md:w-1/3 bg-white flex flex-col justify-center rounded-[12px] shadow-lg">
            <div className="flex justify-between w-full">
              <div className="flex items-center">
                <ExclamationCircleIcon className="size-14 rounded-lg text-[#007FFF]  left-3 cursor-pointer" />
                <p className="text-[18px] font-semibold ml-2 text-[#007FFF]">
                  Verifying
                </p>
              </div>
              <div>
                <XMarkIcon
                  className="text-black cursor-pointer size-8 right-3"
                  onClick={handleCloseDeleteModal}
                />
              </div>
            </div>

            <p className="px-2 mt-6 text-gray-500">
              Are you sure you want to verify{" "}
              <strong>
                "{selectedUser?.firstname} {selectedUser?.lastname}"
              </strong>
              ?
            </p>
            <div className="flex justify-center space-x-2 md:justify-end">
              <button
                className="w-full py-2 border border-gray-400 rounded-lg md:w-auto md:px-4"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                disabled={verifyingLoading[toVerifyId]}
                className="w-full py-2 text-white border rounded-lg bg-primary md:w-auto md:px-4"
                onClick={() => handleVerify(toVerifyId)}
              >
                {verifyingLoading[toVerifyId] ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupUser;
