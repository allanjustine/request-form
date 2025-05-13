import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";

type Position = z.infer<typeof schema>;
const schema = z.object({
  value: z.string(),
});

const AddPositionModal = ({
  modalIsOpen,
  closeModal,
  setIsRefresh,
}: {
  modalIsOpen: boolean;
  setIsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  closeModal: any;
}) => {
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState([]);
  const {
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Position>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: Position) => {
    setLoading(true);
    setIsRefresh(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const requestData = {
        value: data.value,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/create-position`,
        requestData,
        { headers }
      );

      if (response.status === 200) {
        setBackendError([]);
        closeModal();
        reset();
        Swal.fire({
          icon: "success",
          title: "Position Added",
          text: response.data.message,
          timer: 6000,
          toast: true,
          position: "top-end",
          timerProgressBar: true,
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      setBackendError(error.response.data.errors.value[0]);
    } finally {
      setLoading(false);
      setIsRefresh(false);
    }
  };

  const onSubmit = (data: Position) => {
    submitData(data);
  };

  return modalIsOpen ? (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50">
      <div className="p-4 w-7/12 md:w-2/6 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Add Position
        </h2>
        <XMarkIcon
          className="absolute text-black cursor-pointer size-6 right-3"
          onClick={closeModal}
        />
      </div>
      <div className="bg-white w-7/12 md:w-2/6 x-20 rounded-b-[12px] shadow-lg overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="gap-4 mt-10 md:mx-5">
            <div className="mb-4">
              <p className="w-full font-medium">New Position</p>
              <input
                type="text"
                onChange={(e) => setValue("value", e.target.value)}
                className="w-full bg-[#F5F5F5] border input input-bordered border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.value && (
                <span className="text-xs text-red-500">
                  {errors.value.message}
                </span>
              )}
              {backendError && (
                <span className="text-xs text-red-500">{backendError}</span>
              )}
            </div>
          </div>
          <div className="flex justify-center mt-5 mb-10 space-x-2 lg:flex-row md:mt-10">
            <button
              className="bg-gray-500 p-2 h-12 hover:bg-gray-400 w-1/2 sm:w-1/3 rounded-[12px] text-white font-medium"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-primary hover:bg-blue-400 p-2 w-1/2 sm:w-1/3  h-12 rounded-[12px] text-white font-medium"
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddPositionModal;
