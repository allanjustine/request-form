import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

type UserCredentials = z.infer<typeof schema>;
const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(5).max(20),
    userName: z.string().min(5).max(20),
    firstName: z.string().min(2).max(30),
    lastName: z.string().min(2).max(30),
    contact: z.string().refine((value) => /^\d{11}$/.test(value), {
      message: "Contact number must be 11 digits",
    }),
    branchCode: z.string().nonempty(),
    confirmPassword: z.string().min(5).max(20),
    role: z.string().nonempty(),
    position: z.string().nonempty(),
    branch: z.string().nonempty(),
    employee_id: z.string().min(2).max(30),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
const positionOptions = [
  { label: "Approver", value: "approver" },
  { label: "User", value: "User" },
  { label: "Admin", value: "Admin" },
];

const AddUserModal = ({
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);
  const {
    control,
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserCredentials>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;
        // Assuming response.data.data is the array of branches
        const branchOptions = branches.map(
          (branch: { id: number; branch_code: string; branch: string }) => ({
            id: branch.id,
            branch_code: branch.branch_code,
            branch: branch.branch,
          })
        );
        setBranchList(branchOptions);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/positions`
        );

        setRoleOptions(response.data.position);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchPosition();
  }, []);
  

  if (!modalIsOpen) {
    return null;
  }

  const handleBranchCodeChange = (selectedBranchId: number) => {
    const selectedBranch = branchList.find(
      (branch) => branch.id === selectedBranchId
    );

    if (selectedBranch) {
      setValue("branch", selectedBranch.branch);
    } else {
      setValue("branch", "Honda Des, Inc.");
    }
  };
  const capitalizeWords = (str: string) => {
    return str.replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  };
  // Check form state details

  const submitData = async (data: UserCredentials) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/register`,
        {
          email: data.email,
          password: data.password,
          userName: data.userName,
          firstName: data.firstName,
          lastName: data.lastName,
          contact: data.contact,
          branch_code: data.branchCode,
          confirmPassword: data.password,
          position: data.position,
          role: data.role,
          branch: data.branch,
          employee_id: data.employee_id,
        }
      );

      if (response.data.status) {
        openCompleteModal();
        refreshData();
        reset();
      } else {
        alert("Registration failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during the registration process.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: UserCredentials) => {
    submitData(data);
  };

  return (
    modalIsOpen && (
      <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 ">
        <div className=" p-4  w-7/12 md:w-2/5  relative bg-primary flex justify-center mx-20  border-b rounded-t-[12px]">
          <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
            Add {entityType}
          </h2>
          <XMarkIcon
            className="absolute text-white cursor-pointer size-6 right-3"
            onClick={closeModal}
          />
        </div>
        <div className="bg-white w-7/12 md:w-2/5 x-20 rounded-b-[12px] shadow-lg  overflow-y-auto  h-2/3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-w-4xl p-6 mx-auto mt-2 bg-white rounded-lg">

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className="w-full mt-2 bg-white input input-bordered"
                  />
                  {errors.firstName && (
                    <span className="text-xs text-red-500">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className="w-full mt-2 bg-white input input-bordered"
                  />
                  {errors.lastName && (
                    <span className="text-xs text-red-500">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="text"
                    {...register("email")}
                    placeholder="Enter email"
                    className="w-full mt-2 bg-white input input-bordered"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    {...register("userName")}
                    placeholder="Enter username"
                    className="w-full mt-2 bg-white input input-bordered"
                  />
                  {errors.userName && (
                    <span className="text-xs text-red-500">
                      {errors.userName.message}
                    </span>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact
                  </label>
                  <input
                    type="text"
                    {...register("contact")}
                    placeholder="Enter contact number"
                    className="w-full mt-2 bg-white input input-bordered"
                  />
                  {errors.contact && (
                    <span className="text-xs text-red-500">
                      {errors.contact.message}
                    </span>
                  )}
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch Code
                  </label>
                  <Controller
                    name="branchCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full mt-2 bg-white select select-bordered"
                        onChange={(e) => {
                          field.onChange(e);
                          handleBranchCodeChange(Number(e.target.value));
                        }}
                      >
                        <option value="" hidden>Select branch</option>
                        <option value="" disabled>Select branch</option>
                        {branchList.length > 0 ? (
                          branchList.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.branch_code}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No branch codes available
                          </option>
                        )}
                      </select>
                    )}
                  />
                  {errors.branchCode && (
                    <span className="text-xs text-red-500">
                      {errors.branchCode.message}
                    </span>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch
                  </label>
                  <Controller
                    name="branch"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        readOnly
                        className="w-full mt-2 bg-white input input-bordered"
                      />
                    )}
                  />
                  {errors.branch && (
                    <span className="text-xs text-red-500">
                      {errors.branch.message}
                    </span>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    {...register("employee_id")}
                    placeholder="Enter your employee ID"
                    className="w-full mt-2 bg-white input input-bordered"
                  />
                  {errors.employee_id && (
                    <span className="text-xs text-red-500">
                      {errors.employee_id.message}
                    </span>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full mt-2 bg-white select select-bordered"
                      >
                        <option value="" hidden>Select Role</option>
                        <option value="" disabled>Select Role</option>
                        {positionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.role && (
                    <span className="text-xs text-red-500">
                      {errors.role.message}
                    </span>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full mt-2 bg-white select select-bordered"
                      >
                        <option value="" hidden>Select Position</option>
                        <option value="" disabled>Select Position</option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.position && (
                    <span className="text-xs text-red-500">
                      {errors.position.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div>
                <h3 className="mt-6 text-lg font-semibold text-gray-800">
                  Password
                </h3>
                <div className="my-4 border-t"></div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Enter Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Enter password"
                        className="w-full mt-2 bg-white input input-bordered"
                      />
                      {showPassword ? (
                        <EyeSlashIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      ) : (
                        <EyeIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      )}
                    </div>
                    {errors.password && (
                      <span className="text-xs text-red-500">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        placeholder="Confirm password"
                        className="w-full mt-2 bg-white input input-bordered"
                      />
                      {showConfirmPassword ? (
                        <EyeSlashIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      ) : (
                        <EyeIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-xs text-red-500">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 mt-8">
                <button
                  type="button"
                  className="w-24 text-white bg-gray-500 border-gray-500 btn btn-secondary hover:bg-gray-600 hover:border-gray-600"
                  onClick={() => closeModal()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary bg-primary border-primary hover:bg-blue-400 hover:border-blue-400 text-white hover:text-white w-1/3`}
                >
                  {loading ? "Submitting..." : "Add User"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};
export default AddUserModal;
