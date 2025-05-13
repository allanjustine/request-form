import React, { useState, useEffect, useRef } from "react";
import Avatar2 from "./assets/avatar.png";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import PropogateLoader from "react-spinners/PropagateLoader";
import SignatureCanvas from "react-signature-canvas";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUser } from "../context/UserContext";

interface Branch {
  branch: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branch_code: string;
  contact: string;
  signature: string;
  userName: string;
  profile_picture: string;
  position: string;
  branch: Branch;
}

const Profile = ({ isdarkMode }: { isdarkMode: boolean }) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setChangePasswordLoading] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string }[]
  >([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const [signature, setSignature] = useState<SignatureCanvas | null>(null);
  const [signatureButton, setSignatureButton] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [signatureError, setSignatureError] = useState("");
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureSuccess, setSignatureSuccess] = useState(false);
  const [loadingChange, setLoading] = useState(false);
  const { setProfile_picture } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`,
          { headers }
        );
        const branches = response.data.data;
        const branchOptions = branches.map(
          (branch: { id: number; branch_code: string }) => ({
            id: branch.id,
            branch_code: branch.branch_code,
          })
        );
        setBranchList(branchOptions);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [token]);

  useEffect(() => {
    if (signature) {
      signature.toDataURL("image/png");
    }
  }, [signature]);

  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        if (!token || !branchList.length) {
          return; // Ensure branch list is available before fetching user data
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/profile`,
          { headers }
        );

        if (response.data.status) {
          const userData = response.data.data;
          setUser(userData);

          const branch = branchList.find(
            (b) => b.id === Number(userData?.branch_code)
          );
          if (branch) {
            setSelectedBranchCode(branch?.branch_code);
          }
        } else {
          throw new Error(
            response.data.message || "Failed to fetch user information"
          );
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "An error occurred while fetching user information"
        );
      }
    };

    fetchUserInformation();
  }, [token, id, branchList, shouldRefresh, loadingChange]);

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    signature?.clear();
  };
  const handleChangePassword = async () => {
    setErrorMessage("");
    if (!token || !id) {
      console.error("User not authenticated. Please log in.");
      return;
    }
    try {
      setChangePasswordLoading(true);
      if (newPassword !== confirmNewPassword) {
        setErrorMessage("The new password fields confirmation does not match.");
        setChangePasswordLoading(false);
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/change-password/${id}`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password changed successfully",
        confirmButtonText: "Close",
        confirmButtonColor: "#007bff",
      });
      // alert("Password changed successfully");
      setChangePasswordLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowCurrent(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      setChangePasswordLoading(false);
      console.error(
        "Failed to change password:",
        error.response?.data?.message || error.response.data.error
      );
      setErrorMessage(error.response?.data?.message || error.response.data.error);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSignatureButton(false);
    setShouldRefresh(true); // Set to true to trigger data refetch
    navigate("/profile");
  };
  const closeSignatureSuccess = () => {
    setSignatureSuccess(false);
    setShouldRefresh(true); // Set to true to trigger data refetch
    navigate("/profile");
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return (
      <>
        <div className="w-full h-full px-4 py-4 dark:bg-gray-900 md:px-10 lg:px-30">
          <div className="flex flex-col w-full px-4 py-12 bg-white rounded-lg md:px-8 lg:px-10 xl:px-12">
            <div className="flex flex-col items-center justify-center rounded-lg lg:flex-row">
              <div className="flex flex-col items-start w-full px-4 text-left md:px-10">
                <div className="flex flex-col items-center lg:flex-row md:items-start">
                  <div className="border-4 rounded-full bg-slate-300 skeleton w-44 h-44"></div>
                  <div className="flex flex-col mt-4 ml-2">
                    <h1 className="w-56 h-8 mb-3 text-lg font-bold skeleton bg-slate-300 md:text-xl lg:text-2xl"></h1>
                    <div>
                      <p className="h-4 mb-3 cursor-pointer w-36 text-primary skeleton bg-slate-300"></p>
                      <input type="file" className="hidden" />
                    </div>
                    <p className="w-40 h-4 italic font-semibold text-black skeleton bg-slate-300"></p>
                  </div>
                </div>

                <h1 className="h-8 my-5 text-lg font-semibold md:text-xl w-44 lg:text-2xl skeleton bg-slate-300"></h1>
                <div className="grid w-full grid-cols-1 gap-4 lg:gap-6">
                  <div className="flex flex-col">
                    <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                    <p className="p-2 font-medium border rounded-md skeleton h-9 bg-slate-300"></p>
                  </div>
                  <div className="flex flex-col">
                    <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                    <p className="p-2 font-medium border rounded-md skeleton h-9 bg-slate-300"></p>
                  </div>
                  <div className="flex flex-col">
                    <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                    <p className="p-2 font-medium border rounded-md skeleton h-9 bg-slate-300"></p>
                  </div>
                  <div className="flex flex-col">
                    <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                    <p className="p-2 font-medium border rounded-md skeleton h-9 bg-slate-300"></p>
                  </div>
                </div>
              </div>

              <div className="w-full mt-4 md:mt-0 md:px-10">
                <h1 className="h-8 my-8 text-lg font-semibold w-44 md:text-xl lg:text-2xl skeleton bg-slate-300"></h1>
                <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                <div className="relative flex items-center w-full">
                  <input
                    type="password"
                    className="w-full h-10 p-2 rounded-lg skeleton bg-slate-300"
                  />
                </div>
                <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                <div className="relative flex items-center w-full">
                  <input
                    type="password"
                    className="w-full h-10 p-2 rounded-lg skeleton bg-slate-300"
                  />
                </div>
                <p className="w-32 h-4 mt-2 mb-2 text-gray-400 skeleton bg-slate-300"></p>
                <div className="relative flex items-center w-full">
                  <input
                    type="password"
                    className="w-full h-10 p-2 rounded-lg skeleton bg-slate-300"
                  />
                </div>
                <button className="flex items-center justify-center w-full h-12 mt-4 text-white rounded-lg skeleton bg-primary"></button>
              </div>

              <div className="flex flex-col w-full mb-4 md:w-1/2">
                <p className="w-10 h-4 mb-2 text-base lg:text-lg skeleton bg-slate-300"></p>
                <div className="flex items-center justify-center overflow-hidden">
                  <div className="w-full border skeleton bg-slate-300 h-28"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error === "User not authenticated") {
    return <div>User not authenticated. Please log in.</div>;
  }

  const saveInfo = async () => {
    if (!newProfilePic) {
      console.error("No profile picture selected.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_picture", newProfilePic);

    try {
      setChangePasswordLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/upload-profile-pic/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setUser((prevUser) =>
          prevUser
            ? { ...prevUser, signature: response.data.data.signature }
            : null
        );
      } else {
        throw new Error(
          response.data.message || "Failed to upload profile picture"
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to upload profile picture:",
        error.response?.data?.message || error.message
      );
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleImageClick = () => {
    inputRef.current?.click();
  };

  const profilePictureUrl = newProfilePic
    ? URL.createObjectURL(newProfilePic) // Create a temporary URL for the new profile picture
    : user?.profile_picture
    ? `${process.env.REACT_APP_URL_STORAGE}/${user.profile_picture.replace(
        /\\/g,
        "/"
      )}`
    : Avatar2;
  const onSubmit = async () => {
    setLoading(true);
    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      if (!token || !id) {
        console.error("Token or ID is missing");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Ensure profile picture is a File object before appending
      if (newProfilePic) {
        formData.append("profile_picture", newProfilePic);
      } else {
        console.error("Profile picture is missing");
        setSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/update-profilepic/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        setProfile_picture(
          newProfilePic ? profilePictureUrl : user?.profile_picture
        );
        setSubmitting(false);
        setShowSuccessModal(true);
        setNewProfilePic(null);
        setProfileError(null);
      }
    } catch (error: any) {
      console.error(
        "Failed to update profile picture:",
        error.response?.data || error.message
      );
      setProfileError(error.response?.data.message);
      setSubmitting(false);
    } finally {
      setLoading(false);
    }
  };
  const saveSignature = () => {
    if (signatureRef.current) {
      const signatureImage = signatureRef.current.toDataURL();
      // You can save signatureImage or set it to a form field for submission
    }
  };
  const signatureIsEmpty = () => {
    if (signature && signature.isEmpty && signature.isEmpty()) {
      setSignatureEmpty(true);
      return true;
    }
    return false;
  };
  const handleSaveSignature = async () => {
    setSignatureLoading(true);
    try {
      // Send the data URL to the backend API

      if (signature && !signature.isEmpty()) {
        const signatureDataURL = signature.toDataURL();
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
        if (response.status === 200) {
          setSignatureSuccess(true);
          setSignatureError("");
        }
      } else {
        setSignatureLoading(false);
        setSignatureError("Please add signature first before saving.");
      }
    } catch (error) {
      console.error("Error saving signature:", error); // Log any errors
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewProfilePic(file); // Store the selected file in state
  };
  return (
    <div className="w-full h-full px-4 py-4 bg-graybg dark:bg-blackbg md:px-10 lg:px-30 ">
      <div className="bg-white rounded-[12px] flex flex-col w-full px-4 md:px-8 lg:px-10 xl:px-12 py-[50px]">
        <div className="rounded-[12px] flex flex-col lg:flex-row items-center justify-center">
          <div className="flex flex-col items-start w-full px-4 text-left md:px-10">
            <div className="flex flex-col items-center lg:flex-row md:items-start">
              <img
                alt="profile"
                src={profilePictureUrl}
                className="rounded-full w-[180px] h-[180px] border-4 border-blue-600"
              />
              <div className="flex flex-col mt-4 ml-2">
                <h1 className="text-lg font-bold md:text-xl lg:text-2xl">
                  {user.firstName} {user.lastName}
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
                <p className="italic font-semibold text-black">
                  {user.position}
                </p>
              </div>
            </div>
            {profileError && (
              <span className="text-red-500">{profileError}</span>
            )}
            <h1 className="my-5 text-lg font-semibold md:text-xl lg:text-2xl">
              User Information
            </h1>
            <div className="grid w-full grid-cols-1 gap-4 lg:gap-6">
              <div className="flex flex-col">
                <p className="text-gray-400">Email</p>
                <p className="p-2 font-medium border rounded-md">
                  {user.email}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Branch</p>
                <p className="p-2 font-medium border rounded-md">
                  {selectedBranchCode}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Contact</p>
                <p className="p-2 font-medium border rounded-md">
                  {user.contact}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Username</p>
                <p className="p-2 font-medium border rounded-md">
                  {user.userName}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Branch</p>
                <p className="p-2 font-medium border rounded-md">
                  {user.branch?.branch}
                </p>
              </div>
            </div>

            {newProfilePic && (
              <div className="bg-black text-white w-full h-[48px] rounded-[12px] mt-4 flex items-center justify-center">
                <button
                  disabled={loadingChange}
                  className="text-white"
                  onClick={onSubmit}
                >
                  {loadingChange ? "Uploading..." : "Upload Profile Picture"}
                </button>
              </div>
            )}
          </div>

          <div className="w-full mt-4 md:mt-0 md:px-10 ">
            <h1 className="my-5 text-lg font-semibold md:text-xl lg:text-2xl">
              Change Password
            </h1>
            <p className="mt-2 text-gray-400">Enter your current password</p>
            <div className="relative flex items-center justify-center w-full">
              <input
                type={showCurrent ? "text" : "password"}
                className="w-full h-10 p-2 bg-gray-300 rounded-lg"
                onChange={(e) => setCurrentPassword(e.target.value)}
                value={currentPassword}
              />
              {showCurrent ? (
                <EyeSlashIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowCurrent(!showCurrent)}
                />
              ) : (
                <EyeIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowCurrent(!showCurrent)}
                />
              )}
            </div>
            <p className="mt-2 text-gray-400">Enter your new password</p>
            <div className="relative flex items-center justify-center w-full">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-10 p-2 bg-gray-300 rounded-lg"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {showPassword ? (
                <EyeSlashIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <EyeIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
            <p className="mt-2 text-gray-400">Confirm password</p>
            <div className="relative flex items-center justify-center w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full h-10 p-2 bg-gray-300 rounded-lg"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              {showConfirmPassword ? (
                <EyeSlashIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              ) : (
                <EyeIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button
              disabled={!currentPassword || loading}
              className={`text-white bg-primary flex justify-center items-center rounded-[12px] w-full h-[50px] mt-4 ${!currentPassword && 'cursor-not-allowed'}`}
              onClick={handleChangePassword}
            >
              {loading ? <PropogateLoader color="#FFFF" /> : "Change Password"}
            </button>
          </div>

          <div className="flex flex-col w-full mb-4 md:w-1/2">
            <h1 className="mb-2 text-base lg:text-lg">Signature</h1>
            {user?.signature ? (
              <div className="flex items-center justify-center overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={user.signature}
                    className="w-full border border-black sigCanvas h-28"
                    alt="signature"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="text-gray-950 opacity-30"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255, 255, 255, 0.3) 20px, rgba(255, 255, 255, 0.3) 100px)",
                        backgroundSize: "400px 400px",
                        width: "100%",
                        height: "100%",
                        fontSize: "1.2em",
                        transform: "rotate(-12deg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      SMCT Group of Companies SMCT Group of Companies <br />
                      SMCT Group of Companies SMCT Group of Companies <br />
                      SMCT Group of Companies SMCT Group of Companies <br />
                      SMCT Group of Companies SMCT Group of Companies <br />
                      SMCT Group of Companies SMCT Group of Companies <br />{" "}
                      SMCT Group of Companies SMCT Group of Companies
                      <br />
                      SMCT Group of Companies SMCT Group of Companies
                      <br /> SMCT Group of Companies SMCT Group of Companies
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <SignatureCanvas
                penColor="black"
                ref={(ref) => setSignature(ref)}
                canvasProps={{
                  className: "sigCanvas border border-black h-20 w-full",
                }}
              />
            )}
            {signatureError && (
              <span className="text-xs text-red-500">{signatureError}</span>
            )}
            {user?.signature === null && (
              <div className="flex mt-2">
                <button
                  onClick={(e) => handleClear(e)}
                  className="p-1 mr-2 bg-gray-300 rounded-lg"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveSignature}
                  className={`bg-primary text-white p-2 rounded-lg flex items-center ${
                    signatureLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={signatureLoading}
                >
                  {signatureLoading ? (
                    <ClipLoader
                      color="#ffffff" // Adjust the color to match your design
                      size={24} // Adjust the size if needed
                      className="mr-2"
                    />
                  ) : null}
                  {signatureLoading ? "Saving..." : "Save"}
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
      {signatureSuccess && (
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

export default Profile;
