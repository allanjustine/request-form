import React, { useState, CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slice from "./assets/Slice.png";
import building from "./assets/building.jpg";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import BounceLoader from "react-spinners/ClipLoader";
import { useUser } from "../context/UserContext";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

type UserCredentials = z.infer<typeof schema>;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(5).max(20),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { updateUser } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCredentials>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const submitData: SubmitHandler<UserCredentials> = async (data) => {
    setLoading(true);
    if (errors.email?.message === "Invalid email address") {
      setLoading(false); // Reset loading if it's an invalid email
      return; // Exit early
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/login`,
        {
          email: data.email,
          password: data.password,
        }
      );

      if (response.data.status) {
        updateUser(
          response.data.id,
          response.data.firstName,
          response.data.lastName,
          response.data.email,
          response.data.role,
          response.data.branch_code,
          response.data.contact,
          response.data.signature,
          response.data.profile_picture
        );

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("firstName", response.data.firstName);
        localStorage.setItem("lastName", response.data.lastName);
        localStorage.setItem("contact", response.data.contact);
        localStorage.setItem("branch_code", response.data.branch_code);
        localStorage.setItem("signature", response.data.signature);
        localStorage.setItem("profile_picture", response.data.profile_picture);
        localStorage.setItem("employee_id", response.data.employee_id);
        localStorage.setItem("expires_at", response.data.expires_at);
        navigate("/dashboard");
        // window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          iconColor: "#dc3545",
          title: "Oops...",
          text: response.data.message || "Something went wrong!",
          confirmButtonText: "Close",
          confirmButtonColor: "#dc3545",
        });
        setError(response.data.message);
      }
    } catch (error: any) {
      if (error.response.status === 500) {
        const errorMessage = `${error.response.statusText}, Please contact the administrator.`;

        setError(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonText: "Close",
          confirmButtonColor: "#dc3545",
        });
      } else {
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred.";

        setError(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonText: "Close",
          confirmButtonColor: "#dc3545",
        });
      }
      if (error.response.status === 429) {
        setError(error?.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError("");
  };

  const inputStyle =
    "w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg text-black";
  return (
    <div className="flex flex-row bg-[#FFFFFF] text-black">
      <div className="relative flex items-center justify-center w-full p-8 bg-center bg-cover lg:w-1/2">
        <img
          className="absolute inset-0 z-0 object-cover w-full h-screen lg:hidden"
          src={building}
          alt="photo"
        />

        <div className="lg:max-w-[481px] bg-white md:max-w-sm max-w-xs w-full lg:mt-0  mt-20  bg-opacity-90 p-8 rounded-lg z-10 lg:m-0 m-10 ">
          <h1 className="text-primary font-bold lg:text-[32px] md:text-2xl  mb-6 text-left lg:mt-0 ">
            ACCOUNT LOGIN
          </h1>
          {error && (
            <div
              className="flex items-center px-4 py-5 mb-4 text-red-700 bg-red-100 border border-red-400 rounded"
              role="alert"
              aria-live="assertive"
            >
              <FontAwesomeIcon
                className="w-6 h-6 mr-4 text-red-500"
                icon={faTriangleExclamation}
              />
              <div>
                <strong className="font-bold">Error!</strong>
                <span className="block ml-2 sm:inline">{error}</span>
              </div>
              <button
                onClick={handleCloseAlert}
                className="ml-auto text-red-500 hover:text-red-700 focus:outline-none"
                aria-label="Close alert"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(submitData)}>
            <div className="mb-4">
              <h1 className="mb-2 text-base lg:text-lg">Email</h1>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter Email"
                className={`${inputStyle} autofill-input`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {" "}
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <h1 className="mb-2 text-base lg:text-lg">Password</h1>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                className={`${inputStyle}  autofill-input`}
              />
              <div className="flex flex-row items-center">
                <label className="cursor-pointer label">
                  <input
                    type="checkbox"
                    checked={showPassword} // Controlled component
                    className="checkbox checkbox-info checked:[--chkfg:white]"
                    onChange={() => setShowPassword(!showPassword)}
                  />
                </label>
                <span className="label-text">Show password</span>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
              <div className="flex justify-center">
                <Link to="/forgotpassword">
                  <p className=" font-medium lg:text-base text-xs mt-[12px]  cursor-pointer">
                    Forgot Password
                  </p>
                </Link>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <button
                className="bg-primary text-white px-4 rounded-lg w-full lg:max-w-[417px] lg:h-[56px] h-10"
                type="submit"
                disabled={loading || !!errors.email || !!errors.password}
              >
                {!loading && "Log In"}
              </button>
              {loading ? (
                <BounceLoader color="#FFFFFF" className="absolute" />
              ) : null}
            </div>
          </form>

          <Link to="/registration">
            <div className="flex flex-row justify-center items-center mt-[10px]">
              <p className="text-sm italic text-center lg:text-base">
                Don't have an account?{" "}
              </p>
              <p className="pl-2 text-sm italic font-bold underline text-primary lg:text-base">
                Sign Up
              </p>
            </div>
          </Link>
        </div>
      </div>
      <div className="items-center justify-center hidden w-1/2 lg:block">
        <img className="object-cover w-full h-screen" src={Slice} alt="photo" />
      </div>
    </div>
  );
};

export default Login;
