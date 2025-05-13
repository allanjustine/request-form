import React, { useState, useEffect, useRef } from "react";
import {
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  BellIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  Bars3Icon,
  EnvelopeOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Avatar from "./assets/avatar.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { useSpring, animated } from "@react-spring/web";
import Swal from "sweetalert2";
import Echo from "../utils/Echo";
import { useUser } from "../context/UserContext";

interface NavProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  currentPage: string;
  isSidebarVisible: boolean;
  isSidebarOpen: boolean;
  updateUserInfo: () => void; // Function to update user info
}

interface UserInfo {
  id: number;
}

const Nav: React.FC<NavProps> = ({
  darkMode,
  toggleDarkMode,
  currentPage,
  toggleSidebar,
  isSidebarOpen,
}) => {
  const flexBetween = "flex items-center justify-between";
  const listProfile = "px-4 hover:bg-[#E0E0F9] cursor-pointer py-2";
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [userInfo, setUserInfo] = useState<UserInfo>({ id: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [profilePicture, setProfilePicture] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationReceived, setnotificationReceived] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useUser();
  const [profileLoading, setProfileLoading] = useState(true);
  const { profile_picture, firstName: contextFirstName, lastName: contextLastName } = useUser();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const expiresAt = localStorage.getItem("expires_at");

      if (!token || !expiresAt) {
        // Token or expiration time is missing, clear data and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        navigate("/login"); // Redirect to login page
        setIsAuthenticated(false);
        return;
      }

      // Check if the token has expired
      const expirationDate = new Date(expiresAt);
      if (new Date() > expirationDate) {
        alert("Your token has expired. Please log in again.");

        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        setIsAuthenticated(false);
        navigate("/login"); // Redirect to login page
      }
    };

    checkAuth();
  }, [navigate]);
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage
    navigate("/login");
    setIsAuthenticated(false);
  };
  
  const toggleProfileDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setIsOpenNotif(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notif) => !notif.read_at);

    if (unreadNotifications.length === 0) {
      Swal.fire({
        html: `
        <div style="text-align: center; margin-bottom: 15px;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l9 6 9-6V4a2 2 0 00-2-2H5a2 2 0 00-2 2v4z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8l-9 6-9-6z" />
          </svg>
          <br/>
          <p>No unread notifications to mark as read.</p>
        </div>
      `,
        confirmButtonColor: "#007bff",
        confirmButtonText: "Close",
      });
      return; // Exit early if there are no unread notifications
    }

    try {
      const id = localStorage.getItem("id");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/notifications/mark-all-as-read/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Update all notifications as read in local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => ({
            ...notif,
            read_at: new Date().toISOString(),
          }))
        );

        // Update unread count to 0
        setUnreadCount(0);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "All notifications marked as read.",
          confirmButtonColor: "#007bff",
          confirmButtonText: "Close",
        });
      } else {
        console.error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      alert(
        "Failed to mark all notifications as read. Please try again later."
      );
    }
  };

  useEffect(() => {
    const fetchUserInfoFromDatabase = async () => {
      const id = localStorage.getItem("id");
      if (!id) {
        console.error("No user ID found in localStorage.");
        return;
      }
      try {
        const token = localStorage.getItem("token");

        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/profile`,
          { headers }
        );

        if (response.data && response.data.data) {
          const userData = response.data.data;
          localStorage.setItem("userInfo", JSON.stringify(userData));
          setUserInfo(userData);
          setLastName(userData.lastName);
          setFirstName(userData.firstName);
          setProfilePicture(userData.profile_picture);
        } else {
          console.error("Unexpected response structure:", response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching user information from the database: ",
          error
        );
      } finally {
        setProfileLoading(false);
      }
    };

    // Check local storage for user info
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
      setFirstName(parsedUserInfo.firstName);
      setLastName(parsedUserInfo.lastName);
      setProfilePicture(parsedUserInfo.profile_picture);
      setProfileLoading(false); // Set loading to false since we got data from local storage
    } else {
      // Fetch from database if not found in local storage
      fetchUserInfoFromDatabase();
    }
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.id) {
      if (Echo) {
        const channel = Echo.private(
          `App.Models.User.${userInfo.id}`
        ).notification((notification: any) => {
          setnotificationReceived(true);
        });

        return () => {
          channel.stopListening(
            "IlluminateNotificationsEventsBroadcastNotificationCreated"
          );
        };
      }
    }
  }, [userInfo]);

  useEffect(() => {
    if (notificationReceived) {
      setnotificationReceived(false);
    }
  }, [notificationReceived]);

  useEffect(() => {
    const id = localStorage.getItem("id");

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/notifications/${id}/all`,
          { headers }
        );
        const notificationsData = response.data.unread_notification;
        setNotifications(notificationsData);

        // Count unread notifications
        const unreadNotifications = notificationsData.filter(
          (notif: any) => !notif.read_at
        ).length;
        setUnreadCount(unreadNotifications);
      } catch (error) {
        console.error("Error fetching notifications: ", error);
      }
    };

    fetchNotifications();
  }, [notificationReceived]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isMobileView = windowWidth < 768;

  // Format the notification date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString.replace(" ", "T")), "MMM d, yyyy h:mm a");
  };

  // Animation for the unread notification count
  const springProps = useSpring({
    opacity: unreadCount > 0 ? 1 : 0,
    transform: unreadCount > 0 ? "scale(1)" : "scale(0)",
    config: { tension: 250, friction: 15 },
  });

  const profilePictureUrl = profile_picture
    ? `${process.env.REACT_APP_URL_STORAGE}/${profile_picture.replace(
        /\\/g,
        "/"
      )}`
    : Avatar;

  return (
    <div className={`nav-container ${darkMode ? "dark" : "white"}`}>
      {/* Toggle light and dark mode */}
      <nav className={`${flexBetween} bg-white dark:bg-blackD`}>
        <div className={`h-[67px] flex items-center bg-white dark:bg-blackD`}>
          {isMobileView ? (
            <div onClick={toggleSidebar}>
              {isSidebarOpen ? (
                <XMarkIcon
                  title="Close Menu"
                  className={`size-[36px] font-bold cursor-pointer pl-4 ml-60 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              ) : (
                <Bars3Icon
                  className={`size-[36px] font-bold cursor-pointer pl-4 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              )}
            </div>
          ) : (
            <div onClick={toggleSidebar}>
              {isSidebarOpen ? (
                <XMarkIcon
                  title="Close Menu"
                  className={`size-[36px] font-bold cursor-pointer pl-4 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              ) : (
                <Bars3Icon
                  className={`size-[36px] font-bold cursor-pointer pl-4 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              )}
            </div>
          )}

          <h1
            className={`lg:text-[32px] md:text-[28px] sm:text-[20px] font-bold text-primary ${
              darkMode ? "dark:text-white" : ""
            } pl-4`}
          >
            {currentPage}
          </h1>
        </div>

        <div className="flex items-center justify-between pr-12">
          <div className="pr-2 sm:pr-8">
            {darkMode ? (
              <SunIcon
                className="size-[27px] text-white cursor-pointer"
                onClick={toggleDarkMode}
              />
            ) : (
              <MoonIcon
                className="size-[27px] text-black cursor-pointer"
                onClick={toggleDarkMode}
              />
            )}
          </div>
          <div className={`${flexBetween} gap-2 relative`}>
            {profileLoading ? (
              <div className="relative flex flex-col gap-4 w-52">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full shrink-0 bg-slate-300 skeleton"></div>
                  <div className="flex flex-col gap-4">
                    <div className="h-9 w-28 bg-slate-300 skeleton"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <img
                  alt="logo"
                  className="hidden rounded-full cursor-pointer sm:block w-14 h-14"
                  src={profilePictureUrl}
                  height={45}
                  width={45}
                  onClick={toggleProfileDropdown}
                />
                {/* USER NAME */}
                <p
                  className="pl-2 lg:text-[18px] text-[12px] dark:text-white cursor-pointer"
                  onClick={toggleProfileDropdown}
                >
                  {contextFirstName} {contextLastName}
                </p>
              </>
            )}

            {!isOpen ? (
              <ChevronDownIcon
                className="size-[25px] text-black dark:text-white cursor-pointer"
                onClick={toggleProfileDropdown}
              />
            ) : (
              <ChevronUpIcon
                className="size-[25px] text-black dark:text-white cursor-pointer"
                onClick={toggleProfileDropdown}
              />
            )}
            {/* Profile dropdown */}
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full overflow-x-hidden bg-white top-[55px] rounded-b-lg shadow-sm"
                style={{ zIndex: 1000 }}
              >
                <ul>
                  <Link to="/profile" onClick={handleClose}>
                    <li className={`${listProfile}`}>My Profile</li>
                  </Link>
                  <Link to="/help" onClick={handleClose}>
                    <li className={`${listProfile}`}>Help</li>
                  </Link>
                  <hr/>
                  <li
                    className={`${listProfile}`}
                    onClick={() => {
                      handleClose();
                      handleLogout();
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="relative pl-4 sm:pl-10">
            <div className="relative">
              <BellIcon
                className={`size-[30px] cursor-pointer ${
                  isOpenNotif ? "text-yellow-400" : "text-gray-400"
                }`}
                onClick={() => {
                  setIsOpenNotif(!isOpenNotif);
                  // handleOpenNotification();
                }}
              />
              {/* Notification Count */}
              {unreadCount > 0 && (
                <animated.div
                  style={{
                    ...springProps,
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {unreadCount}
                </animated.div>
              )}
            </div>
            {/* Notification */}
            {isOpenNotif && (
              <div className="flex flex-row">
                <div
                  className="w-96 md:w-[500px] bg-white absolute top-11 right-0 border-2 border-black z-40 overflow-y-auto max-h-[500px] rounded-lg shadow-lg flex flex-col"
                  ref={dropdownRef}
                >
                  <ul className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-4 text-center text-gray-500">
                        No notifications yet
                      </li>
                    ) : (
                      notifications.map((notif) => {
                        const message =
                          notif.data?.message || "No message available";
                        const createdAt =
                          notif.data?.created_at || new Date().toISOString();
                        const notificationId =
                          notif.notification_id || "unknown-id";

                        const linkTo =
                          notif.type ===
                            "App\\Notifications\\ApprovalProcessNotification" ||
                          notif.type ===
                            "App\\Notifications\\PreviousReturnRequestNotification"
                            ? "/request/approver"
                            : notif.type ===
                                "App\\Notifications\\EmployeeNotification" ||
                              notif.type ===
                                "App\\Notifications\\ReturnRequestNotification"
                            ? "/request"
                            : "/profile";

                        const textColor =
                          notif.data.status === "approved"
                            ? "text-green-400"
                            : notif.data.status === "ongoing"
                            ? "text-blue-500"
                            : notif.type ===
                                "App\\Notifications\\PreviousReturnRequestNotification" ||
                              notif.type ===
                                "App\\Notifications\\ReturnRequestNotification"
                            ? "text-red-500"
                            : "text-primary";

                        return (
                          <Link to={linkTo} key={notif.id}>
                            <li
                              className={`px-4 py-4 hover:bg-[#E0E0F9] cursor-pointer border-b flex items-center`}
                              onClick={() => setIsOpenNotif(false)}
                              aria-label={`Notification: ${message}`}
                            >
                              <div className="flex items-center justify-center w-12 h-12 bg-black rounded-full">
                                {notif.read_at ? (
                                  <EnvelopeOpenIcon className="text-white size-5" />
                                ) : (
                                  <EnvelopeIcon className="text-white size-5" />
                                )}
                              </div>
                              <div className="flex-1 ml-4">
                                <p
                                  className={`${textColor} text-sm ${
                                    notif.read_at ? "" : "font-bold"
                                  } text-center`}
                                >
                                  {message}
                                </p>
                                <p className="text-sm text-center text-gray-400">
                                  {formatDate(createdAt)}
                                </p>
                              </div>
                            </li>
                          </Link>
                        );
                      })
                    )}
                  </ul>
                  <hr />
                  {notifications.length > 0 && ( // Conditionally render this section
                    <div
                      className="py-5 text-center text-gray-500 cursor-pointer"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark All As Read
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
