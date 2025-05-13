import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

type Branch = z.infer<typeof schema>;
const schema = z.object({
  branchCode: z.string().nonempty(),
  branch: z.string(),
  branchNameInput: z.string(),
});

const branchOptions = [
  "Des Appliance, Inc.",
  "Des Strong Motors, Inc.",
  "Head Office",
  "Honda Des, Inc.",
  "Strong Moto Centrum, Inc.",
];

const AddBranchModal = ({
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
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Branch>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: Branch) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const requestData = {
        branch: data.branch,
        branch_code: data.branchCode,
        branch_name: data.branchNameInput,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/add-branch`,
        requestData,
        { headers }
      );

      if (response.status === 200 && response.data.status) {
        openCompleteModal();
        refreshData();

        setBackendError("");
        reset();
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setBackendError("Branch Name must be uppercase");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: Branch) => {
    submitData(data);
  };

  return modalIsOpen ? (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50">
      <div className="p-4 w-7/12 md:w-2/6 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
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
              <p className="w-full font-medium">Branch</p>
              <select
                {...register("branch")}
                className="w-full bg-[#F5F5F5] border select select-bordered border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => setValue("branch", e.target.value)}
              >
                <option value="" hidden>
                  Select Branch
                </option>
                <option value="" disabled>
                  Select Branch
                </option>
                {branchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <span className="text-xs text-red-500">
                  {errors.branch.message}
                </span>
              )}
            </div>
            <div className="mb-4">
              <p className="w-full font-medium">Branch Code</p>
              <input
                type="text"
                onChange={(e) => setValue("branchCode", e.target.value)}
                className="w-full bg-[#F5F5F5] border input input-bordered border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.branchCode && (
                <span className="text-xs text-red-500">
                  {errors.branchCode.message}
                </span>
              )}
            </div>
            <div className="mb-4">
              <p className="w-full font-medium">Branch Name</p>
              <input
                type="text"
                onChange={(e) => setValue("branchNameInput", e.target.value)}
                className="w-full bg-[#F5F5F5] input input-bordered border border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {backendError && (
                <span className="text-xs text-red-500">{backendError}</span>
              )}
              {errors.branchNameInput && (
                <span className="text-xs text-red-500">
                  {errors.branchNameInput.message}
                </span>
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
              {loading ? <ClipLoader color="#36d7b7" /> : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddBranchModal;
