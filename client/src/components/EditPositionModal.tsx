import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import Swal from "sweetalert2";

const EditPositionModal = ({
  editModal,
  editModalClose,
  selectedUser,
  setIsRefresh,
}: {
  editModal: boolean;
  editModalClose: any;
  openSuccessModal: any;
  selectedUser: any;
  setIsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [position, setPosition] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCancel = () => {
    editModalClose();
    setPosition("");
    setErrorMessage("");
  };

  if (!editModal) {
    return null;
  }

  const handleUpdatePosition = async (e: any) => {
    e.preventDefault();
    setLoading(true);
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

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/update-position/${selectedUser.id}`,
        {
          value: position,
        },
        {
          headers,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Position Updated",
          text: response.data.message,
          timer: 6000,
          toast: true,
          position: "top-end",
          timerProgressBar: true,
          showCloseButton: true,
          showConfirmButton: false,
        });
        editModalClose();
        setPosition("");
      }
    } catch (error: any) {
      console.error("Error updating position:", error);
      setErrorMessage(error.response.data.errors.value[0]);
    } finally {
      setLoading(false);
      setIsRefresh(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50">
      <div className="p-6 w-10/12 md:w-2/5 bg-primary text-white rounded-t-[12px] shadow-xl relative">
        <h2 className="text-center text-xl md:text-[32px] font-bold">
          Edit Position
        </h2>
        <XMarkIcon
          className="absolute text-white cursor-pointer size-6 right-3 top-6"
          onClick={handleCancel}
        />
      </div>
      <div className="bg-white w-10/12 md:w-2/5 mx-auto rounded-b-[12px] shadow-lg overflow-y-auto p-6">
        <form onSubmit={handleUpdatePosition}>
          <div className="flex flex-col">
            {/* Render input fields dynamically */}
            <p className="w-full font-medium">Edit Position</p>
            <input
              type="text"
              defaultValue={selectedUser.value}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-[#F5F5F5] border input input-bordered border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {/* Error message */}
          <div className="mt-4">
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              className="w-24 text-white bg-gray-500 border-gray-500 btn btn-secondary hover:bg-gray-600 hover:border-gray-600"
              onClick={handleCancel}
            >
              Cancel
            </button>
            {position !== "" && (
              <button
                disabled={loading}
                type="submit"
                className="w-1/3 text-white btn btn-primary bg-primary border-primary hover:bg-blue-400 hover:border-blue-400 hover:text-white"
                // onClick={}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPositionModal;
