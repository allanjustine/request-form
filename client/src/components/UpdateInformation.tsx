import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Avatar3 from "./assets/avatar.png";
import axios from "axios";
import PropogateLoader from "react-spinners/PropagateLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import SignatureCanvas from "react-signature-canvas";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branch_code: string;
  contact: string;
  signature: string;
  userName: string;
  position: string;
  profile_picture: string;
  branch: string;
}

const schema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  email: z.string().email("Invalid email format"),

  branch_code: z.string().nonempty("Branch code is required"),
  role: z.string().nonempty("Role is required"),
  contact: z.string().refine((value) => /^\d{11}$/.test(value), {
    message: "Contact number must be 11 digits",
  }),
  userName: z.string().nonempty("Username is required"),
  position: z.string().nonempty("Position is required"),
});


const pinputStyle =
  "font-medium border-2 border-black rounded-[12px] p-2 w-full";

const UpdateInformation = () => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<User>({
    resolver: zodResolver(schema),
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(null);
  const [newfirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const id = localStorage.getItem("id");
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const [signature, setSignature] = useState<SignatureCanvas | null>(null);
  const [signatureButton, setSignatureButton] = useState(false);
  const navigate = useNavigate();
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const token = localStorage.getItem("token");
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchBranchData = async () => {
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
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`,
          {
            headers,
          }
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

  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          setUser(response.data.data);
          // Set initial form values
          setNewFirstName(response.data.data.firstName);
          setNewLastName(response.data.data.lastName);
          setNewEmail(response.data.data.email);
          setNewBranch(response.data.data.branch_code);
          setNewContact(response.data.data.contact);
          setNewUserName(response.data.data.userName);
          setNewPosition(response.data.data.position);
          setNewRole(response.data.data.role);
          setNewBranchName(response.data.data.branch);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch user information"
          );
        }
      } catch (error: any) {
        setError(
          error.message || "An error occurred while fetching user information"
        );
      } finally {
        setLoading(false); // Update loading state when done fetching
      }
    };

    fetchUserInformation();
  }, []);

  const profilePictureUrl = newProfilePic
    ? URL.createObjectURL(newProfilePic) // Create a temporary URL for the new profile picture
    : user?.profile_picture
    ? `${process.env.REACT_APP_API_BASE_URL}/${user.profile_picture.replace(
        /\\/g,
        "/"
      )}`
    : Avatar3;

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/profile");
  };
  const closeSignatureSuccess = () => {
    setSignatureButton(false);
    navigate("/profile");
  };

  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
      setSubmitting(true);

      // Get current values (original values should be stored somewhere)
      const originalBranchCode = user?.branch_code; // Replace with actual way to get original value
      const originalBranch = user?.branch; // Replace with actual way to get original value

      // Ensure required fields are provided
      if (
        !data.firstName ||
        !data.lastName ||
        !data.email ||
        !data.contact ||
        !data.userName ||
        !data.position ||
        !data.role
      ) {
        setErrorMessage("Please fill out all required fields.");
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      if (!token || !id) {
        console.error("Token or ID is missing");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("contact", data.contact);
      formData.append("userName", data.userName);
      formData.append("position", data.position);
      formData.append("role", data.role);

      // Include branch_code and branch only if they are updated
      formData.append(
        "branch_code",
        data.branch_code || originalBranchCode || ""
      );
      formData.append("branch", data.branch || originalBranch || "");

      // Ensure profile picture is a File object before appending
      if (newProfilePic) {
        formData.append("profile_picture", newProfilePic);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/update-profile/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmitting(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(
        "Failed to update user information:",
        error.response?.data || error.message
      );
      setSubmitting(false);
      setShowSuccessModal(true);
    }
  };

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

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    signature?.clear();
  };

  useEffect(() => {
    if (signature) {
      signature.toDataURL("image/png");
    }
  }, [signature]);
  const handleImageClick = () => {
    inputRef.current?.click();
  };

  const handleSaveSignature = async () => {
    if (signatureRef.current) {
      setSignatureButton(true);
      // Convert the signature to a data URL
      const signatureDataURL = signatureRef.current.toDataURL();

      try {
        // Send the data URL to the backend API
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/update-signature/${id}`, // Ensure the URL is correct
          { signature: signatureDataURL },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure token is valid
              "Content-Type": "application/json",
            },
          }
        );
        setSignatureButton(false);
      } catch (error) {
        setSignatureButton(false);
        console.error("Error saving signature:", error); // Log any errors
      }
    } else {
      setSignatureButton(false);
      console.error("Signature reference is not set."); // Log if signatureRef.current is null
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewProfilePic(file); // Store the selected file in state
  };
  return (
    <div className="w-full h-screen px-4 pt-4 bg-graybg dark:bg-blackbg md:px-10 lg:px-30">
      <div className="bg-white rounded-[12px] flex flex-col md:flex-row w-full px-4 md:px-[88px] pt-[50px] space-y-6 md:space-x-6 md:space-y-0">
        <div className="mb-5 rounded-[12px] w-full flex flex-col md:flex-row justify-between">
          <div className="flex flex-col w-full">
            <div className="flex flex-col items-start mb-4 md:flex-row ">
              <img
                alt="logo"
                height={180}
                width={180}
                src={profilePictureUrl}
              />
              <div className="flex flex-col mt-4 ml-4 ">
                <h1 className="font-bold text-lg md:text-[20px] text-left">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div onClick={handleImageClick}>
                  <p className="cursor-pointer text-primary">
                    Upload new picture
                  </p>
                  <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    onChange={handleProfilePicUpload}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full text-left">
              <h1 className="font-semibold text-lg md:text-[20px] my-5 mt-8">
                User Information
              </h1>
              {user && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">First Name</p>
                      <Controller
                        name="firstName"
                        control={control}
                        defaultValue={newfirstName}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${pinputStyle} w-full`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewFirstName(e.target.value);
                            }}
                          />
                        )}
                      />
                      {errors.firstName && (
                        <span className="text-red-500">
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Last Name</p>
                      <Controller
                        name="lastName"
                        control={control}
                        defaultValue={newLastName}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${pinputStyle}`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewLastName(e.target.value);
                            }}
                          />
                        )}
                      />
                      {errors.lastName && (
                        <span className="text-red-500">
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Email</p>
                      <Controller
                        name="email"
                        control={control}
                        defaultValue={newEmail}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${pinputStyle}`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewEmail(e.target.value);
                            }}
                          />
                        )}
                      />
                      {errors.email && (
                        <span className="text-red-500">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Branch Code</p>
                      <Controller
                        name="branch_code"
                        control={control}
                        defaultValue={newBranch}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`${pinputStyle}`}
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              handleBranchCodeChange(Number(e.target.value));
                            }}
                          >
                            <option value="">Select branch</option>
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

                      {errors.branch_code && (
                        <span className="text-red-500">
                          {errors.branch_code.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400">Branch</p>
                      <Controller
                        name="branch"
                        control={control}
                        defaultValue={newBranchName}
                        render={({ field }) => (
                          <input
                            {...field}
                            readOnly
                            className={`${pinputStyle}`}
                          />
                        )}
                      />
                      {errorMessage && (
                        <p className="text-red-500">{errorMessage}</p>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Contact</p>
                      <Controller
                        name="contact"
                        control={control}
                        defaultValue={newContact}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${pinputStyle}`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewContact(e.target.value);
                            }}
                          />
                        )}
                      />
                      {errors.contact && (
                        <span className="text-red-500">
                          {errors.contact.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Username</p>
                      <Controller
                        name="userName"
                        control={control}
                        defaultValue={newUserName}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${pinputStyle}`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewUserName(e.target.value);
                            }}
                          />
                        )}
                      />
                      {errors.userName && (
                        <span className="text-red-500">
                          {errors.userName.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Position</p>
                      <Controller
                        name="position"
                        control={control}
                        defaultValue={newPosition}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`${pinputStyle}`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewPosition(e.target.value);
                            }}
                          >
                            {roleOptions.map((option, index) => (
                              <option key={index} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.position && (
                        <span className="text-red-500">
                          {errors.position.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-gray-400">Role</p>
                      <Controller
                        name="role"
                        control={control}
                        defaultValue={newRole}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${pinputStyle}`}
                            onChange={(e) => {
                              field.onChange(e);
                              setNewUserName(e.target.value);
                            }}
                          />
                        )}
                      />
                      {errors.role && (
                        <span className="text-red-500">
                          {errors.role.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white w-full h-[48px] rounded-[12px] mt-4 mb-8"
                  >
                    {submitting ? (
                      <ClipLoader color="#36d7b7" />
                    ) : (
                      "Update User Information"
                    )}
                  </button>
                </form>
              )}
              {loading && (
                <div className="flex items-center justify-center w-full">
                  <PropogateLoader color="#ADD8E6" className="" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full mb-4 md:w-1/2">
            <h1 className="mb-2 text-base lg:text-lg">Signature</h1>
            {user?.signature ? (
              <img
                src={user.signature}
                alt="User Signature"
                className="w-full border border-black sigCanvas h-28"
              />
            ) : (
              <SignatureCanvas
                penColor="black"
                ref={signatureRef}
                canvasProps={{
                  className: "sigCanvas border border-black h-20 w-full",
                }}
              />
            )}
            {signatureEmpty && (
              <span className="text-xs text-red-500">
                Please provide a signature.
              </span>
            )}
            {!user?.signature && (
              <div className="flex mt-2">
                <button
                  onClick={handleClear}
                  className="p-1 mr-2 bg-gray-300 rounded-lg"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveSignature}
                  className={`bg-primary text-white p-2 rounded-lg flex items-center ${
                    signatureButton ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={signatureButton}
                >
                  {signatureButton ? (
                    <ClipLoader
                      color="#ffffff" // Adjust the color to match your design
                      size={24} // Adjust the size if needed
                      className="mr-2"
                    />
                  ) : null}
                  {signatureButton ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 ">
          <div className="relative flex flex-col items-center justify-center w-1/4 bg-white rounded-md ">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="absolute !size-20 text-primary -top-6 "
            />
            <div>
              <h1 className="mt-20 text-[28px] font-bold text-center">
                Success
              </h1>
              <p className="font-semibold text-center text-gray-400 my-7">
                User information updated!
              </p>
            </div>
            <div className="flex items-center justify-center w-full p-4 rounded-b-lg bg-graybg">
              <button
                className=" bg-primary p-2 w-1/2 rounded-[12px] text-white font-extrabold"
                onClick={closeSuccessModal}
              >
                OKAY
              </button>
            </div>
          </div>
        </div>
      )}
      {signatureButton && (
        <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 ">
          <div className="relative flex flex-col items-center justify-center w-1/4 bg-white rounded-md ">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="absolute !size-20 text-primary -top-6 "
            />
            <div>
              <h1 className="mt-20 text-[28px] font-bold text-center">
                Success
              </h1>
              <p className="font-semibold text-center text-gray-400 my-7">
                Signature Added!
              </p>
            </div>
            <div className="flex items-center justify-center w-full p-4 rounded-b-lg bg-graybg">
              <button
                className=" bg-primary p-2 w-1/2 rounded-[12px] text-white font-extrabold"
                onClick={closeSignatureSuccess}
              >
                OKAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateInformation;
