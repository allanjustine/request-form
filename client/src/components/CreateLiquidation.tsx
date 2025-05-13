import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import RequestSuccessModal from "./Modals/RequestSuccessModal";
import ClipLoader from "react-spinners/ClipLoader";
import AddCustomModal from "./AddCustomModal";
import Swal from "sweetalert2";
import { RequestType } from "../data/RequestType"

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
}
type Props = {};
 

const schema = z.object({
  purpose: z.string(),
  totalExpense: z.string(),
  cashAdvance: z.string(),
  approver_list_id: z.number(),
  approver: z.string(),
  short: z.string(),
  items: z.array(
    z.object({
      liquidationDate: z.string(),
      from: z.string(),
      to: z.string(),
      transportation: z.string().optional(),
      transportationAmount: z.string().optional(),
      hotel: z.string().optional(),
      hotelAddress: z.string().optional(),
      hotelAmount: z.string().optional(),
      perDiem: z.string().optional(),
      particaulars: z.string().optional(),
      particularsAmount: z.string().optional(),
      grandTotal: z.string().optional(),
    })
  ),
});
type FormData = z.infer<typeof schema>;
type TableDataItem = {
  liquidationDate: string;
  from: string;
  to: string;
  transportation: string;
  transportationAmount: string;
  hotel: string;
  hotelAddress: string;
  hotelAmount: string;
  perDiem: string;
  particularsAmount: string;
  particulars: string;
  grandTotal: string;
};

const initialTableData: TableDataItem[] = Array.from({ length: 1 }, () => ({
  liquidationDate: new Date().toISOString().split("T")[0],
  from: "",
  to: "",
  transportation: "",
  transportationAmount: "",
  hotel: "",
  hotelAddress: "",
  hotelAmount: "",
  perDiem: "",
  particularsAmount: "",
  particulars: "",

  grandTotal: "0",
}));

const tableStyle = "border border-black p-2";
const inputStyle =
  "w-full  border-2 border-black rounded-[12px] pl-[10px] bg-white  autofill-input focus:outline-0";
const tableInput =
  "w-full h-full bg-white px-2 py-1 focus:outline-0  autofill-input";
const itemDiv = "flex flex-col  w-3/4";

const buttonStyle = "h-[45px] w-[150px] rounded-[12px] text-white";
const CreateLiquidation = (props: Props) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cashAdvance, setCashAdvance] = useState("0");
  const [formData, setFormData] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [signature, setSignature] = useState("");
  const [file, setFile] = useState<File[]>([]);
  const [selectedApproverList, setSelectedApproverList] = useState<
    number | null
  >(null);
  const [employeeID, setEmployeeID] = useState<string | null>(null);
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [initialNotedBy, setInitialNotedBy] = useState<Approver[]>([]);
  const [initialApprovedBy, setInitialApprovedBy] = useState<Approver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    formState: { errors: formErrors },
  } = useForm<FormData>();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFile((prevImages) => [...prevImages, ...files]);
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

  useEffect(() => {
    setInitialNotedBy(notedBy);
    setInitialApprovedBy(approvedBy);
  }, [notedBy, approvedBy]);
  const [items, setItems] = useState<
    {
      liquidationDate: string;
      from: string;
      to: string;
      transportation: string;
      transportationAmount: string;
      hotel: string;
      hotelAddress: string;
      hotelAmount: string;
      perDiem: string;
      particulars: string;
      particularsAmount: string;

      grandTotal: string;
    }[]
  >([
    {
      liquidationDate: new Date().toISOString().split("T")[0],
      from: "",
      to: "",
      transportation: "",
      transportationAmount: "",
      hotel: "",
      hotelAddress: "",
      hotelAmount: "",
      perDiem: "",
      particulars: "",
      particularsAmount: "",

      grandTotal: "0",
    },
  ]);
  const [tableData, setTableData] = useState<TableDataItem[]>(initialTableData);
  const [selectedRequestType, setSelectedRequestType] =
    useState("/request/loae");

  const handleChange = (
    index: number,
    field: keyof TableDataItem,
    value: string
  ) => {
    const newData = [...tableData];
    newData[index][field] = value;

    // Parse the amounts as floats
    const transportationAmount =
      parseFloat(newData[index].transportationAmount) || 0;
    const hotelAmount = parseFloat(newData[index].hotelAmount) || 0;
    const particularsAmount = parseFloat(newData[index].particularsAmount) || 0;
    const perDiem = parseFloat(newData[index].perDiem) || 0;
    // Calculate the grandTotal whenever any of the fields is inputted
    const grandTotal =
      transportationAmount + hotelAmount + particularsAmount + perDiem;
    newData[index].grandTotal = grandTotal.toFixed(2);

    setTableData(newData);

    // Clear the error when the field is changed
    setValidationErrors((prevErrors: Record<string, any>) => {
      const newErrors = { ...prevErrors };
      delete newErrors.items?.[index]?.[field];
      return newErrors;
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleRemoveItem = (index: number) => {
    if (tableData.length > 1) {
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
          const updatedItems = tableData.filter((_, i) => i !== index);
          setTableData(updatedItems);
        }
      });
    }
  };

  const totalExpense = tableData.reduce(
    (total, item) => total + parseFloat(item.grandTotal),
    0
  );

  // Convert cashAdvance to a number before performing subtraction
  const short = Math.abs(parseFloat(cashAdvance || "0") - totalExpense).toFixed(
    2
  );
  const shortLabel = (parseFloat(cashAdvance || "0") - totalExpense).toFixed(2);

  useEffect(() => {
    setTableData([
      {
        liquidationDate: new Date().toISOString().split("T")[0],
        from: "",
        to: "",
        transportation: "",
        transportationAmount: "",
        hotel: "",
        hotelAddress: "",
        hotelAmount: "",
        perDiem: "",
        particulars: "",
        particularsAmount: "",
        grandTotal: "0.00",
      },
    ]);
  }, [selectedRequestType]);

  const handleAddItem = () => {
    const lastRow = tableData[tableData.length - 1];
    let nextDate = new Date();

    if (lastRow?.liquidationDate) {
      const lastDate = new Date(lastRow.liquidationDate);
      nextDate = new Date(lastDate.setDate(lastDate.getDate() + 1));
    }

    const formattedNextDate = nextDate.toISOString().split("T")[0];
    setTableData([
      ...tableData,
      {
        liquidationDate: formattedNextDate,
        from: "",
        to: "",
        transportation: "",
        transportationAmount: "",
        hotel: "",
        hotelAddress: "",
        hotelAmount: "",
        perDiem: "",
        particulars: "",
        particularsAmount: "",
        grandTotal: "0.00",
      },
    ]);
  };

  useEffect(() => {
    const storedFirstName = localStorage.getItem("firstName");
    const storedLastName = localStorage.getItem("lastName");
    const signature = localStorage.getItem("signature");
    const employee_id = localStorage.getItem("employee_id");
    const fullName = `${storedFirstName} ${storedLastName}`.trim();

    setName(fullName);
    setEmployeeID(String(employee_id));
    setSignature(signature || "");
  }, []);

  // Function to close the confirmation modal
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!cashAdvance && errors.cashAdvance) {
        setFormSubmitted(true);
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
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");
      setName(firstName + " " + lastName);
      const branch_code = localStorage.getItem("branch_code");

      if (!token || !userId) {
        console.error("Token or userId not found");
        return;
      }

      setItems(tableData);

      const emptyItems: number[] = [];
      items.forEach((item, index) => {
        if (Object.values(item).some((value) => value === "")) {
          emptyItems.push(index);
        }
      });

      // Calculate total expense by summing up all grand totals
      const totalExpense = tableData
        .reduce((acc, item) => acc + parseFloat(item.grandTotal || "0"), 0)
        .toFixed(2);
      const short = (
        parseFloat(totalExpense) - parseFloat(cashAdvance)
      ).toFixed(2);

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
      formData.append("form_type", "Liquidation of Actual Expense");
      formData.append("approvers_id", String(selectedApproverList));
      formData.append("currency", "PHP");
      formData.append("user_id", userId);

      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: branch_code,
            purpose: data.purpose,
            totalExpense: totalExpense,
            short: short,
            cashAdvance: cashAdvance,
            name: name,
            employeeID: employeeID,
            signature: signature,
            items: tableData.map((item) => ({
              liquidationDate: item.liquidationDate,
              from: item.from,
              to: item.to,
              transportation: item.transportation,
              transportationAmount: item.transportationAmount,
              hotel: item.hotel,
              hotelAddress: item.hotelAddress,
              hotelAmount: item.hotelAmount,
              perDiem: item.perDiem,
              particulars: item.perDiem,
              particularsAmount: item.particularsAmount,
              grandTotal: item.grandTotal,
            })),
          },
        ])
      );

      // Display confirmation modal
      setShowConfirmationModal(true);

      // Set form data to be submitted after confirmation

      setFormData(formData);

      setTableData([]);
      setItems([]);
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
        formData, // Use the formData stored in state
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
      setTableData([]);
    } catch (error) {
      console.error("An error occurred while submitting the request:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/request");
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
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
                Liquidation
              </span>{" "}
              of Actual Expense
            </h1>
          </div>
          <div className="my-2 ">
            <button
              onClick={openAddCustomModal}
              className="p-2 text-white rounded bg-primary"
            >
              Add Approver
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-[35px] mt-4 ">
            <div className="grid w-1/2 grid-cols-1 gap-2 md:grid-cols-2 md:flex md:justify-start md:space-x-8">
              <div className={`${itemDiv}`}>
                <p className="font-semibold">Purpose:</p>
                <textarea
                  className={`${inputStyle} h-[100px] w-full`}
                  {...register("purpose", { required: true })}
                />
                {errors.purpose && formSubmitted && (
                  <p className="text-red-500">Purpose is required</p>
                )}
              </div>
            </div>
            <div className="w-full mt-4 overflow-x-auto">
              <div className="w-full border border-collapse border-black ">
                <div className="table-container">
                  <table className="w-full border border-collapse border-black ">
                    <thead className="bg-[#8EC7F7]">
                      <tr>
                        <th>Date</th>
                        <th colSpan={4} className="border border-black">
                          Transportation
                        </th>
                        <th colSpan={3} className="border border-black">
                          Hotel
                        </th>
                        <th colSpan={5} className="border border-black">
                          PER DIEM OTHER RELATED EXPENSES
                        </th>
                      </tr>
                      <tr>
                        <th className={`${tableStyle}`}>Day</th>
                        <th className={`${tableStyle}`}>From</th>
                        <th className={`${tableStyle}`}>To</th>
                        <th className={`${tableStyle}`}>
                          Type of Transportation
                        </th>
                        <th className={`${tableStyle}`}>Amount</th>
                        <th className={`${tableStyle}`}>Hotel</th>
                        <th className={`${tableStyle}`}>Place</th>
                        <th className={`${tableStyle}`}>Amount</th>
                        <th className={`${tableStyle}`}>Per Diem</th>
                        <th className={`${tableStyle}`}>Particulars</th>
                        <th className={`${tableStyle}`}>Amount</th>
                        <th className={`${tableStyle}`}>Grand Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((item, index) => (
                        <tr key={index} className="border border-black">
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `day-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`day-${index}`}
                              type="date"
                              value={item.liquidationDate}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "liquidationDate",
                                  e.target.value
                                )
                              }
                              className={`${tableInput}`}
                            />
                            {validationErrors[
                              `items.${index}.liquidationDate`
                            ] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {
                                    validationErrors[
                                      `items.${index}.liquidationDate`
                                    ]
                                  }
                                </p>
                              )}
                            {!item.liquidationDate &&
                              formSubmitted &&
                              !validationErrors[
                                `item.${index}.liquidationDate`
                              ] && (
                                <p className="text-red-500">Date Required</p>
                              )}
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `from-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`from-${index}`}
                              value={item.from}
                              onChange={(e) =>
                                handleChange(index, "from", e.target.value)
                              }
                              className={`${tableInput}`}
                            ></textarea>
                            {validationErrors[`items.${index}.from`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.from`]}
                                </p>
                              )}
                            {!item.from &&
                              formSubmitted &&
                              !validationErrors[`item.${index}.from`] && (
                                <p className="text-red-500">Required</p>
                              )}
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `to-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`to-${index}`}
                              value={item.to}
                              onChange={(e) =>
                                handleChange(index, "to", e.target.value)
                              }
                              className={`${tableInput}`}
                            ></textarea>
                            {validationErrors[`items.${index}.to`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.to`]}
                                </p>
                              )}
                            {!item.to &&
                              formSubmitted &&
                              !validationErrors[`item.${index}.to`] && (
                                <p className="text-red-500">Required</p>
                              )}
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `type-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`type-${index}`}
                              value={item.transportation}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "transportation",
                                  e.target.value
                                )
                              }
                              className={`${tableInput}`}
                            />
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `transportation_amount-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`transportation_amount-${index}`}
                              type="number"
                              value={item.transportationAmount}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "transportationAmount",
                                  e.target.value
                                )
                              }
                              className={`${tableInput}`}
                            />
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `hotel_name-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`hotel_name-${index}`}
                              value={item.hotel}
                              onChange={(e) =>
                                handleChange(index, "hotel", e.target.value)
                              }
                              className={`${tableInput}`}
                            ></textarea>
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `hotel_address-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`hotel_address-${index}`}
                              value={item.hotelAddress}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "hotelAddress",
                                  e.target.value
                                )
                              }
                              className={`${tableInput}`}
                            />
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `hotel_amount-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`hotel_amount-${index}`}
                              type="number"
                              value={item.hotelAmount}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "hotelAmount",
                                  e.target.value
                                )
                              }
                              className={`${tableInput}`}
                            />
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `per_diem-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`per_diem-${index}`}
                              type="number"
                              value={item.perDiem}
                              onChange={(e) =>
                                handleChange(index, "perDiem", e.target.value)
                              }
                              className={`${tableInput}`}
                            />
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `particulars-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <textarea
                              id={`particulars-${index}`}
                              value={item.particulars}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "particulars",
                                  e.target.value
                                )
                              }
                              className={`${tableInput} focus:outline-0 resize-none h-[100px]  `}
                            />
                          </td>
                          <td
                            className="p-1 border border-black"
                            onClick={() => {
                              const input = document.getElementById(
                                `particulars_amount-${index}`
                              );
                              if (input) input.focus();
                            }}
                          >
                            <input
                              id={`particulars_amount-${index}`}
                              type="number"
                              value={item.particularsAmount}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "particularsAmount",
                                  e.target.value
                                )
                              }
                              className={`${tableInput} focus:outline-0`}
                            />
                          </td>
                          <td className="p-1 font-bold text-center border border-black">
                            ₱{item.grandTotal}
                          </td>
                          {tableData.length > 1 && (
                            <td>
                              <TrashIcon
                                className="text-[#e63c3c] size-7 cursor-pointer"
                                onClick={() => handleRemoveItem(index)}
                                title="Remove Item"
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <hr className="w-full my-2 border-t-4 border-gray-400 border-dotted" />

              <div className="flex flex-row items-center gap-2">
                <span
                  className={`bg-yellow-400 flex items-center cursor-pointer hover:bg-white hover:border-4 hover:border-yellow-400  hover:text-yellow-400  text-gray-950 max-w-md justify-center ${buttonStyle}`}
                  onClick={handleAddItem}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Add Item
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 overflow-x-auto lg:grid-cols-2 md:gap-2">
              <div>
                <table className="w-full mt-10 border border-black">
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="pl-2 pr-20 font-semibold ">TOTAL EXPENSE</p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold ">₱ {totalExpense}</p>
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="pl-2 pr-20 font-semibold ">CASH ADVANCE</p>
                    </td>
                    <td className={`${tableStyle} `}>
                      ₱&nbsp;
                      <input
                        type="number"
                        value={cashAdvance}
                        onChange={(e) => setCashAdvance(e.target.value)}
                        className="font-bold bg-white focus:outline-0"
                      />
                      {errors.cashAdvance && (
                        <p className="text-red-500">
                          {errors.cashAdvance.message}
                        </p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      {parseFloat(shortLabel) > 0 ? (
                        <p className="pl-2 font-semibold">Excess</p>
                      ) : parseFloat(shortLabel) === 0 ? (
                        <p className="pl-2 font-semibold"></p>
                      ) : (
                        <p className="pl-2 font-semibold">Short</p>
                      )}
                    </td>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold ">₱ {short}</p>
                    </td>
                  </tr>
                </table>
              </div>
              <div>
                <table className="w-full mt-10 border border-black">
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="pl-2 pr-20 font-semibold ">
                        NAME OF EMPLOYEE
                      </p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold ">{name}</p>
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle} h-20`}>
                      <p className="pl-2 font-semibold ">SIGNATURE</p>
                    </td>
                    <td className={`${tableStyle} h-10`}>
                      <div className="flex items-center justify-center overflow-hidden">
                        <div className="relative">
                          <img
                            src={signature}
                            className="h-32"
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
                              SMCT Group of Companies SMCT Group of Companies{" "}
                              <br />
                              SMCT Group of Companies SMCT Group of Companies{" "}
                              <br />
                              SMCT Group of Companies SMCT Group of Companies{" "}
                              <br />
                              SMCT Group of Companies SMCT Group of Companies{" "}
                              <br />
                              SMCT Group of Companies SMCT Group of Companies{" "}
                              <br /> SMCT Group of Companies SMCT Group of
                              Companies
                              <br />
                              SMCT Group of Companies SMCT Group of Companies
                              <br /> SMCT Group of Companies SMCT Group of
                              Companies
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="pl-2 font-semibold ">EMPLOYEE NO.</p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold ">{employeeID}</p>
                    </td>
                  </tr>
                </table>
              </div>
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
                          <img src="https://cdn-icons-png.flaticon.com/512/3396/3396255.png" alt="" />
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

export default CreateLiquidation;
