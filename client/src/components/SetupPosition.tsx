import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import AddPositionModal from "./AddPositionModal";
import EditPositionModal from "./EditPositionModal";
import axios from "axios";
import { set } from "react-hook-form";
import Swal from "sweetalert2";

export type Branch = {
  id: number;
  branch: string;
  user_id: number;
};

interface Position {
  id: number;
  value: string;
  label: string;
}

const SetupPosition: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const userId = localStorage.getItem("id");
  const [filterTerm, setFilterTerm] = useState("");
  const [positionData, setPositionData] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<Position>({
    id: 0,
    value: "",
    label: "",
  });
  const [toDelete, setToDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(0);

  const filteredPosition = positionData.filter((position) =>
    Object.values(position).some((value) =>
      String(value).toLowerCase().includes(filterTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/positions`
        );

        if (response.status === 200) {
          setPositionData(response.data.position);
        }
      } catch (error: any) {
        console.error("Error fetching position data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositionData();
  }, [isRefresh]);
  const editModalShow = (row: Position) => {
    setEditModal(true);
    setSelectedUser(row);
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

  const openDeleteModal = (row: any) => {
    setToDelete(true);
    setSelectedUser(row);
    setToDeleteId(row.id);
  };

  const closeDeleteModal = () => {
    setToDelete(false);
    setSelectedUser({
      id: 0,
      value: "",
      label: "",
    });
  };

  const columns = [
    {
      name: "ID",
      selector: (row: Position) => row.id,
      width: "80px",
      sortable: true,
    },

    {
      name: "Position",
      selector: (row: Position) => row.value,
      sortable: true,
    },
    {
      name: "Action",
      sortable: true,
      cell: (row: Position) => (
        <div className="flex space-x-2">
          <PencilSquareIcon
            className="cursor-pointer text-primary size-8"
            onClick={() => editModalShow(row)}
          />
          <TrashIcon
            className="text-[#A30D11] size-8 cursor-pointer"
            onClick={() => openDeleteModal(row)}
          />
        </div>
      ),
    },
  ];

  const handleDelete = async (toDeleteId: number) => {
    setDeleteLoading(true);
    setIsRefresh(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/delete-position/${toDeleteId}`,
        {
          headers,
        }
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted Position",
          text: response.data.message,
          timer: 6000,
          toast: true,
          position: "top-end",
          timerProgressBar: true,
          showCloseButton: true,
          showConfirmButton: false,
        });
        setToDelete(false);
        setToDeleteId(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setIsRefresh(false);
    }
  };

  return (
    <div className="w-full h-full px-4 pt-4 bg-graybg dark:bg-blackbg sm:px-10 md:px-10 lg:px-30 xl:px-30">
      <div className="w-full h-auto rounded-lg drop-shadow-lg md:mr-4">
        <div className="flex flex-col w-full overflow-x-auto bg-white rounded-lg">
          <h1 className="pl-4 sm:pl-[30px] text-[24px] text-left py-4 text-primary font-bold mr-2 underline decoration-2 underline-offset-8">
            Position
          </h1>
          <div className="flex items-end justify-end mx-2 bg-white">
            <div>
              <button
                className="bg-primary text-white rounded-[12px] p-2"
                onClick={openModal}
              >
                + Add Position
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
                placeholder="Search position"
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
                  <th style={{ color: "black", fontWeight: "bold" }}>
                    Position
                  </th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="w-full border border-gray-200" colSpan={4}>
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
              data={filteredPosition}
              pagination
              striped
              noDataComponent={
                filteredPosition.length === 0 ? (
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
                    color: "black",
                    backgroundColor: "#E7F1F9",
                  },
                  stripedStyle: {
                    color: "black",
                    backgroundColor: "#FFFFFF",
                  },
                },
              }}
            />
          )}
        </div>
      </div>
      <AddPositionModal
        setIsRefresh={setIsRefresh}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
      />
      <EditPositionModal
        editModal={editModal}
        editModalClose={editModalClose}
        openSuccessModal={openModal}
        selectedUser={selectedUser}
        setIsRefresh={setIsRefresh}
      />
      {toDelete && (
        <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 ">
          <div className=" p-4  w-1/2 md:w-1/3 bg-white flex flex-col justify-center rounded-[12px] shadow-lg">
            <div className="flex justify-between w-full">
              <div className="flex items-center">
                <ExclamationCircleIcon className="text-red-500 rounded-lg cursor-pointer size-14 left-3" />
                <p className="text-[18px] font-semibold ml-2 text-red-500">
                  Confirm Delete
                </p>
              </div>
              <div>
                <XMarkIcon
                  className="text-black cursor-pointer size-8 right-3"
                  onClick={closeDeleteModal}
                />
              </div>
            </div>

            <p className="px-2 mt-6 text-gray-500">
              Are you sure you want to delete{" "}
              <strong>"{selectedUser?.value}"</strong>?
            </p>
            <div className="flex justify-center space-x-2 md:justify-end">
              <button
                className="w-full py-2 border border-gray-400 rounded-lg md:w-auto md:px-4"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                type="button"
                className="w-full py-2 text-white bg-red-500 border rounded-lg md:w-auto md:px-4"
                onClick={() => handleDelete(toDeleteId)}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupPosition;
