import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import RequestSuccessModal from "./Modals/RequestSuccessModal";
import ClipLoader from "react-spinners/ClipLoader";
import AddCustomModal from "./AddCustomModal";
import Swal from "sweetalert2";
import { RequestType } from "../data/RequestType";

type Props = {};

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
}
 

const schema = z.object({
  approver_list_id: z.number(),
  items: z.array(
    z.object({
      quantity: z.string(),
      description: z.string(),
      unitCost: z.string(),
      totalAmount: z.string(),
      remarks: z.string().optional(),
    })
  ),
});

type FormData = z.infer<typeof schema>;

const buttonStyle = "h-[45px] w-[150px] rounded-[12px] text-white";
const tableStyle = "border border-black p-2 border-collapse";
const inputStyle2 =
  "w-full   rounded-[12px] pl-[10px] bg-white  autofill-input focus:outline-0";

const CreateCashDisbursement = (props: Props) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [file, setFile] = useState<File[]>([]);
  const {
    formState: { errors: formErrors },
  } = useForm<FormData>();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [initialNotedBy, setInitialNotedBy] = useState<Approver[]>([]);
  const [initialApprovedBy, setInitialApprovedBy] = useState<Approver[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFile((prevImages) => [...prevImages, ...files]);
  };

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case "PHP":
        return "₱";
      case "EUR":
        return "€";
      case "USD":
        return "$";
      default:
        return "₱";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    setFile((prevImages) => [...prevImages, ...droppedFiles]);
    setIsHovering(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleRemoveImage = (imageName: string) => {
    setFile((prevImages) =>
      prevImages.filter((image) => image.name !== imageName)
    );
  };

  const formatFileSize = (sizeInBytes: any) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  const navigate = useNavigate();
  const [items, setItems] = useState<
    {
      quantity: string;
      description: string;
      unitCost: string;
      totalAmount: string;
      remarks: string;
    }[]
  >([
    {
      quantity: "1",
      description: "",
      unitCost: "",
      totalAmount: "",
      remarks: "",
    },
  ]);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    setInitialNotedBy(notedBy);
    setInitialApprovedBy(approvedBy);
  }, [notedBy, approvedBy]);

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
      const branch_code = localStorage.getItem("branch_code");

      if (!token || !userId) {
        console.error("Token or userId not found");
        return;
      }
      if (approvedBy.length === 0) {
        Swal.fire({
          icon: "error",
          title: "No approver selected",
          text: "Please select an approver. To proceed, click on 'Add Approver' button above and select an approver from list.",
          confirmButtonText: "Close",
          confirmButtonColor: "#007bff",
        });
        setLoading(false); // Stop loading state
        return; // Prevent form submission
      }

      if (
        items.some((item) =>
          Object.entries(item)
            .filter(([key, value]) => key !== "remarks")
            .some(([key, value]) => value === "")
        )
      ) {
        console.error("Item fields cannot be empty");
        // Display error message to the user or handle it accordingly
        return;
      }

      let grandTotal = 0;
      items.forEach((item) => {
        if (item.totalAmount) {
          grandTotal += parseFloat(item.totalAmount);
        }
      });

      const formData = new FormData();

      // Append each file to FormData
      file.forEach((file) => {
        formData.append("attachment[]", file); // Use "attachment[]" to handle multiple files
      });
      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));
      formData.append("form_type", "Cash Disbursement Requisition Slip");
      formData.append("user_id", userId);
      formData.append("currency", selectedCurrency);
      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: branch_code,
            grand_total: grandTotal.toFixed(2),
            items: items.map((item) => ({
              quantity: item.quantity,
              description: item.description,
              unitCost: item.unitCost,
              totalAmount: item.totalAmount,
              remarks: item.remarks,
            })),
          },
        ])
      );
      // Display confirmation modal
      setShowConfirmationModal(true);
      setFormData(formData);
      // Set form data to be submitted after confirmation
    } catch (error) {
      console.error("An error occurred while submitting the request:", error);
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openAddCustomModal = () => {
    setIsModalOpen(true);
  };

  const handleAddCustomData = (notedBy: Approver[], approvedBy: Approver[]) => {
    setNotedBy(notedBy);
    setApprovedBy(approvedBy);
  };

  const handleConfirmSubmit = async () => {
    // Close the confirmation modal
    setShowConfirmationModal(false);
    const token = localStorage.getItem("token");

    if (!approvedBy) {
      Swal.fire({
        icon: "error",
        title: "No approver selected",
        text: "Please select an approver. To proceed, click on 'Add Approver' button above and select an approver from list.",
        confirmButtonText: "Close",
        confirmButtonColor: "#007bff",
      });
      return; // Prevent form submission
    }
    try {
      setLoading(true);

      // Perform the actual form submission
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/create-request`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setShowSuccessModal(true);
      setFormSubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred while submitting the request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);

    navigate("/request");
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  const [selectedRequestType, setSelectedRequestType] =
    useState("/request/cdrs");

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      Swal.fire({
        title: "Are you sure?",
        text: "This item will be removed!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const updatedItems = items.filter((_, i) => i !== index);
          setItems(updatedItems);
        }
      });
    }
  };

  const calculateGrandTotal = () => {
    let grandTotal = 0;
    items.forEach((item) => {
      if (item.totalAmount) {
        grandTotal += parseFloat(item.totalAmount);
      }
    });
    return grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        quantity: "1",
        description: "",
        unitCost: "",
        totalAmount: "",
        remarks: "",
      },
    ]);
  };

  const handleInputChange = (
    index: number,
    field: keyof (typeof items)[0],
    value: string
  ) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Calculate total amount if both unitCost and quantity are provided
    if (field === "unitCost" || field === "quantity") {
      const unitCost = parseFloat(updatedItems[index].unitCost);
      const quantity = parseFloat(updatedItems[index].quantity);
      if (!isNaN(unitCost) && !isNaN(quantity)) {
        updatedItems[index].totalAmount = (unitCost * quantity).toFixed(2);
      } else {
        updatedItems[index].totalAmount = "";
      }
    }

    setItems(updatedItems);
  };
  const handleTextareaHeight = (index: number, field: string) => {
    const textarea = document.getElementById(
      `${field}-${index}`
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto"; // Reset to auto height first
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`; // Set to scroll height or minimum 100px
    }
  };

  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[15px] px-[30px] pb-[15px]">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <ClipLoader color="#007bff" />
        </div>
      )}
      <h1 className="text-primary text-[32px] font-bold">Create Request</h1>
      <select
        className="w-2/5 lg:h-[56px] md:h-10 p-2 bg-gray-200 pl-[30px] border-2 border-black rounded-xl mb-2"
        value={selectedRequestType}
        onChange={(e) => {
          setSelectedRequestType(e.target.value);
          navigate(e.target.value);
        }}
      >
        <option value="" disabled>
          Type of request
        </option>
        {
          RequestType.map((item) => (
            <option key={item.title} value={item.path}>
              {item.title}
            </option>
          ))
        }
      </select>
      <div className="bg-white w-full mb-5 rounded-[12px] flex flex-col">
        <div className="border-b flex justify-between flex-col px-[30px] md:flex-row ">
          <div>
            <h1 className="flex py-4 mr-2 text-3xl font-bold text-left text-primary">
              <span className="mr-2 text-3xl underline decoration-2 underline-offset-8">
                Cash/Card
              </span>{" "}
              Disbursement Requisition Slip
            </h1>
          </div>
          <div>
            <label htmlFor="currency" className="mb-2 text-xl text-gray-700">
              Select Currency &nbsp;
            </label>
            <select
              id="currency"
              className="p-2 my-3 transition-colors bg-gray-200 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              <option value="PHP">₱ - Peso</option>
              <option value="EUR">€ - Euro</option>
              <option value="USD">$ - USD</option>
            </select>
          </div>

          <div className="my-3 ">
            <button
              onClick={openAddCustomModal}
              className="p-2 text-white rounded bg-primary"
            >
              Add Approver
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-[35px] mt-4">
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 md:flex md:justify-start md:gap-2"></div>
            <div className="w-full mt-4 overflow-x-auto md:overflow-auto">
              <div className="w-full">
                <div className="table-container">
                  <table className="w-full">
                    <thead className="bg-[#8EC7F7]">
                      <tr>
                        <th className={`${tableStyle}`}>Quantity</th>
                        <th className={`${tableStyle}`}>Description</th>
                        <th className={`${tableStyle}`}>Unit Cost</th>
                        <th className={`${tableStyle}`}>Total Amount</th>
                        <th className={`${tableStyle}`}>Usage/Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          {/* Quantity Input */}
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `quantity-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`quantity-${index}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) => {
                                // Prevent non-digit input
                                if (
                                  !/[0-9]/.test(e.key) &&
                                  e.key !== "Backspace" &&
                                  e.key !== "Tab"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                            />
                            {validationErrors[`items.${index}.quantity`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.quantity`]}
                                </p>
                              )}
                            {!item.quantity &&
                              formSubmitted &&
                              !validationErrors[`items.${index}.quantity`] && (
                                <p className="text-red-500">
                                  Quantity Required
                                </p>
                              )}
                          </td>
                          {/* Description Input */}
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `description-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`description-${index}`}
                              value={item.description}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "description")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "description")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "description")
                              }
                            />
                            {validationErrors?.[`items.${index}.description`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {
                                    validationErrors[
                                      `items.${index}.description`
                                    ]
                                  }
                                </p>
                              )}
                            {!item.description &&
                              formSubmitted &&
                              !validationErrors?.[
                                `items.${index}.description`
                              ] && (
                                <p className="text-red-500">
                                  Description Required
                                </p>
                              )}
                          </td>
                          {/* Unit Cost Input */}
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `unit_cost-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`unit_cost-${index}`}
                              type="number"
                              value={item.unitCost}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "unitCost",
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) => {
                                // Prevent non-digit input
                                if (
                                  !/[0-9]/.test(e.key) &&
                                  e.key !== "Backspace" &&
                                  e.key !== "Tab"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              placeholder={getCurrencySymbol()}
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                            />
                            {validationErrors[`items.${index}.unitCost`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.unitCost`]}
                                </p>
                              )}
                            {!item.unitCost &&
                              formSubmitted &&
                              !validationErrors[`items.${index}.unitCost`] && (
                                <p className="text-red-500">
                                  Unit Cost Required
                                </p>
                              )}
                          </td>
                          {/* Total Amount Input */}
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `total_amount-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`total_amount-${index}`}
                              type="number"
                              value={item.totalAmount}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "totalAmount",
                                  e.target.value
                                )
                              }
                              placeholder={getCurrencySymbol()}
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              readOnly
                            />
                            {validationErrors[`items.${index}.totalAmount`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {
                                    validationErrors[
                                      `items.${index}.totalAmount`
                                    ]
                                  }
                                </p>
                              )}
                            {!item.totalAmount &&
                              formSubmitted &&
                              !validationErrors[
                                `items.${index}.totalAmount`
                              ] && (
                                <p className="text-red-500">
                                  Total Amount Required
                                </p>
                              )}
                          </td>
                          {/* Remarks Input */}
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `remarks-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`remarks-${index}`}
                              value={item.remarks}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "remarks")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "remarks")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "remarks")
                              }
                            />
                          </td>
                          <td>
                            {items.length > 1 && (
                              <TrashIcon
                                className="text-[#e63c3c] size-7 cursor-pointer"
                                onClick={() => handleRemoveItem(index)}
                                title="Remove Item"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan={4} className="p-2 font-bold text-right">
                          Grand Total:
                        </td>
                        <td className="p-2 font-bold text-center border border-black">
                          {getCurrencySymbol()} {calculateGrandTotal()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full mt-4">
              <hr className="w-full my-2 border-t-4 border-gray-400 border-dotted" />
              <span
                className={`bg-yellow-400 flex items-center cursor-pointer hover:bg-white hover:border-4 hover:border-yellow-400  hover:text-yellow-400  text-gray-950 mt-2 max-w-md justify-center ${buttonStyle}`}
                onClick={handleAddItem}
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Add Item
              </span>
            </div>
            <div className="flex flex-col justify-between md:flex-row">
              <div className="w-full max-w-md p-4">
                <p className="mb-3 font-semibold">Upload attachment:</p>
                <div
                  className={`relative w-full p-6 text-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
                      ${isHovering ? "bg-gray-200" : "hover:bg-gray-100"}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("files")?.click()}
                >
                  <input
                    type="file"
                    id="files"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-gray-500">
                    Drag and drop your images here <br /> or <br />
                    <span className="text-blue-500">click to upload</span>
                  </p>
                </div>
              </div>
            </div>
            {file.length > 1 && (
              <div className="mt-4">
                <p className="mb-3 font-semibold">Attachments:</p>
                <button
                  onClick={() => setFile([])}
                  className="px-3 py-1 text-xs text-white bg-red-700 rounded-lg hover:bg-red-500"
                >
                  Remove All
                </button>
              </div>
            )}
            <div className="max-w-[500px] overflow-x-auto pb-3 ">
              <div className="flex gap-1">
                {file.map((fileItem) => (
                  <div
                    key={fileItem.name}
                    className="relative w-24 p-2 bg-white rounded-lg shadow-md"
                  >
                    <div className="relative">
                      {fileItem.type.startsWith("image/") ? (
                        // Display image preview if file is an image
                        <img
                          src={URL.createObjectURL(fileItem)}
                          alt={fileItem.name}
                          className="object-cover w-full h-20 rounded-md"
                        />
                      ) : (
                        // Display document icon if file is not an image
                        <div className="flex items-center justify-center w-full h-20 bg-gray-100 rounded-md">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/3396/3396255.png"
                            alt=""
                          />
                        </div>
                      )}

                      {/* Display File Name and Size */}
                      <div className="mt-2">
                        <p className="text-sm font-semibold truncate">
                          {fileItem.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileItem.size)}
                        </p>
                        <p key={fileItem.name} className="text-center">
                          <button
                            onClick={() => handleRemoveImage(fileItem.name)}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg"
                          >
                            Remove
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 mb-4 ml-5">
              <h3 className="mb-3 font-bold">Noted By:</h3>
              <ul className="flex flex-wrap gap-6">
                {" "}
                {/* Use gap instead of space-x */}
                {notedBy.map((user, index) => (
                  <li
                    className="relative flex flex-col items-center justify-center w-auto text-center"
                    key={index}
                  >
                    {" "}
                    {/* Adjust width as needed */}
                    <div className="relative flex flex-col items-center justify-center">
                      <p className="relative inline-block pt-6 font-medium text-center uppercase">
                        <span className="relative z-10 px-2">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                      </p>
                      <p className="font-bold text-[12px] text-center">
                        {user.position}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4 ml-5">
              <h3 className="mb-3 font-bold">Approved By:</h3>
              {approvedBy.length === 0 ? (
                <p className="text-gray-500 ">
                  Please select an approver!
                  <br />
                  <span className="text-sm italic">
                    Note: You can add approvers by clicking the 'Add Approver'
                    button above.
                  </span>
                </p>
              ) : (
                <ul className="flex flex-wrap gap-6">
                  {" "}
                  {/* Use gap instead of space-x */}
                  {approvedBy.map((user, index) => (
                    <li
                      className="relative flex flex-col items-center justify-center text-center"
                      key={index}
                    >
                      <div className="relative flex flex-col items-center justify-center">
                        <p className="relative inline-block pt-6 font-medium text-center uppercase">
                          <span className="relative z-10 px-2">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                        </p>
                        <p className="font-bold text-[12px] text-center">
                          {user.position}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center w-full pb-10 mt-20 space-x-3">
              <button
                className={`bg-[#0275d8] hover:bg-[#6fbcff] ${buttonStyle}`}
                type="submit"
                onClick={handleFormSubmit}
                disabled={loading}
              >
                <span className="text-white hover:text-black">
                  {loading ? "PLEASE WAIT..." : "CREATE REQUEST"}
                </span>
              </button>
            </div>
          </div>
          {showConfirmationModal && (
            <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black/50">
              <div className="p-4 bg-white rounded-md">
                <p>Are you sure you want to submit the request?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 mr-2 font-bold text-gray-800 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={handleCloseConfirmationModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 font-bold text-white rounded bg-primary hover:bg-primary-dark"
                    onClick={handleConfirmSubmit}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      {showSuccessModal && (
        <RequestSuccessModal onClose={handleCloseSuccessModal} />
      )}
      <AddCustomModal
        modalIsOpen={isModalOpen}
        closeModal={closeModal}
        openCompleteModal={() => {}}
        entityType="Approver"
        initialNotedBy={notedBy}
        initialApprovedBy={approvedBy}
        refreshData={() => {}}
        handleAddCustomData={handleAddCustomData}
      />
    </div>
  );
};

export default CreateCashDisbursement;
