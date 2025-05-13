import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

interface ApproveSuccessModalProps {
  closeModal: () => void;
  closeParentModal: () => void;
  status: "approved" | "disapproved";
}

const ApproveSuccessModal: React.FC<ApproveSuccessModalProps> = ({
  closeModal,
  closeParentModal,
  status,
}) => {
  const handleOkayClick = () => {
    closeModal();
    closeParentModal(); // Close both modals
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white relative w-10/12 sm:w-1/3 flex flex-col items-center justify-center rounded-md">
        <FontAwesomeIcon
          icon={faCircleCheck}
          className="!size-20 text-primary absolute -top-6"
        />
        <div>
          <h1 className="mt-20 text-[28px] font-bold text-center">
            {" "}
            {status === "approved" ? "Approved!" : "Disapproved!"}
          </h1>
          <p className="my-7 text-gray-400 font-semibold text-center"></p>
        </div>
        <div className="bg-graybg w-full rounded-b-lg flex justify-center items-center p-4">
          <button
            className="bg-primary p-2 w-1/2 rounded-[12px] text-white font-extrabold"
            onClick={handleOkayClick}
          >
            OKAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveSuccessModal;
