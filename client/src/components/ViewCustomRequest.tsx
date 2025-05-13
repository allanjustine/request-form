import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ViewCustomRequest = ({
  modalIsOpen,
  closeModal,
  openCompleteModal,
  entityType,
}: {
  modalIsOpen: boolean;
  closeModal: any;
  openCompleteModal: any;
  entityType: string;
}) => {
  if (!modalIsOpen) {
    return null;
  }

  const pStyle = "font-medium w-full";
  const inputStyle = "border border-black rounded-md p-1 w-full";
  return (
    modalIsOpen && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 flex-col ">
        <div className=" p-4  w-1/3 md:w-1/4 relative bg-primary flex justify-center mx-20  border-b rounded-t-[12px]">
          <h2 className="text-center  text-xl md:text-[32px] font-bold text-white">
            Add {entityType}
          </h2>
          <XMarkIcon
            className="size-6 text-black absolute right-3 cursor-pointer"
            onClick={closeModal}
          />
        </div>
        <div className="bg-white w-1/3 md:w-1/4 x-20 rounded-b-[12px] shadow-lg  overflow-y-auto  h-2/3">
          <div className="grid lg:grid-cols-2 justify-items-center  place-content-center mt-10 mx-10 gap-2">
            <div>
              <p className={`${pStyle}`}>First Name</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Last Name</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Email Address</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Username</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Contact</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Role</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Branch Code</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
          </div>
          <h1 className="ml-4 mt-8 text-[20px] font-medium">PASSWORD</h1>
          <div className="border-b "></div>
          <div className="grid lg:grid-cols-2 justify-items-center mt-4 mb-5 mx-10 gap-2 ">
            <div>
              <p className={`${pStyle}`}>Enter Password</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
            <div>
              <p className={`${pStyle}`}>Confirm Password</p>
              <input type="text" className={`${inputStyle}`} />
            </div>
          </div>
          <div className="flex justify-center lg:justify-end items-center space-x-2 md:mt-20 md:mr-10 mb-10">
            <button
              className="bg-[#9C9C9C] p-2 lg:w-1/4 rounded-[12px] text-white font-medium"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-primary p-2 lg:w-1/4  rounded-[12px] text-white font-medium"
              onClick={openCompleteModal}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )
  );
};
export default ViewCustomRequest;
