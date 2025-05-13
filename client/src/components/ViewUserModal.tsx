import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Avatar from "./assets/avatar.png";
import { format } from "date-fns";

interface Record {
  id: number;
  firstname: string;
  lastname: string;
  branch_code: string;
  email: string;
  role: string;
  contact: string;
  username: string;
  profile_picture: string;
  email_verified_at: string;
}

interface ViewUserModalProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  user: Record | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  modalIsOpen,
  closeModal,
  user,
}) => {
  if (!modalIsOpen) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50">
      <div className="p-6 w-4/5 md:w-2/5 relative bg-primary flex justify-center mx-4 rounded-t-[12px] shadow-lg">
        <h2 className="text-center text-xl md:text-[32px] font-semibold text-white">
          User Information
        </h2>
        <XMarkIcon
          className="absolute text-white cursor-pointer size-6 right-4 top-4"
          onClick={closeModal}
        />
      </div>

      <div className="bg-white w-4/5 md:w-2/5 rounded-b-[12px] shadow-xl px-10 py-6">
        {user && (
          <div className="flex flex-col items-center gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <img
                src={
                  user.profile_picture
                    ? `${process.env.REACT_APP_URL_STORAGE}/${user.profile_picture}`
                    : Avatar
                } // Default image if no profile image exists
                alt="Profile"
                className="w-32 h-32 mb-4 border-4 rounded-full border-primary"
              />
              <h3 className="flex text-xl font-bold text-gray-800">
                {user.username || "User Name"}{" "}
                {user.email_verified_at !== null ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 text-primary"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </h3>
              <p className="text-gray-600">
                {user.email || "user@example.com"}
              </p>
            </div>

            {/* User Information Section */}
            <div className="grid w-full gap-6 lg:grid-cols-2">
              {/* Left Column of Information */}
              <div className="flex flex-col items-start">
                {Object.entries(user)
                  .filter(
                    ([key]) =>
                      key !== "profile_picture" &&
                      key !== "username" &&
                      key !== "email"
                  )
                  .map(([key, value], index) =>
                    index % 2 === 0 ? (
                      <div key={key} className="w-full mb-4">
                        <p className="font-semibold text-gray-700">
                          {key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <div className="p-4 border border-gray-300 shadow-sm rounded-xl">
                          <p className="text-gray-800 break-words">
                            {key === "email_verified_at"
                              ? value === null
                                ? "Not yet Verified"
                                : format(new Date(value), "MMMM d, yyyy")
                              : value}
                          </p>
                        </div>
                      </div>
                    ) : null
                  )}
              </div>

              {/* Right Column of Information */}
              <div className="flex flex-col items-start">
                {Object.entries(user)
                  .filter(
                    ([key]) =>
                      key !== "profile_picture" &&
                      key !== "username" &&
                      key !== "email"
                  )
                  .map(([key, value], index) =>
                    index % 2 !== 0 ? (
                      <div key={key} className="w-full mb-4">
                        <p className="font-semibold text-gray-700">
                          {key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <div className="p-4 border border-gray-300 shadow-sm rounded-xl">
                          <p className="text-gray-800 break-words">{value}</p>
                        </div>
                      </div>
                    ) : null
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUserModal;
