import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import BeatLoader from "react-spinners/BeatLoader";
import EditStockModalSuccess from "./EditStockModalSuccess";
import { PencilIcon } from "@heroicons/react/24/solid";
import Avatar from "../assets/avatar.png";
import PrintLiquidation from "../PrintLiquidation";
import AddCustomModal from "../EditCustomModal";

type Props = {
  closeModal: () => void;
  record: Record;
  refreshData: () => void;
};

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
}

type Record = {
  id: number;
  request_code: string;
  created_at: Date;
  status: string;
  approvers_id: number;
  form_data: FormData[];
  supplier?: string;
  address?: string;
  branch: string;
  date: string;
  user_id: number;
  destination: string;
  attachment: string;
  noted_by: {
    id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];
  approved_by: {
    id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];
};

type FormData = {
  approvers_id: number;
  approvers: {
    noted_by: { firstName: string; lastName: string }[];
    approved_by: { firstName: string; lastName: string }[];
  };
  purpose: string;
  items: Item[];
  branch: string;
  date: string;
  grand_total: string;
  supplier: string;
  address: string;
  totalExpense: string;
  cashAdvance: string;
  short: string;
  name: string;
  signature: string;
  employeeID: string;
};

type Item = {
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
};
const tableStyle2 = "bg-white p-2 text-center";
const tableStyle = "border-2 border-black p-2 ";
const inputStyle = "  border-2 border-black rounded-[12px] text-sm";
const input2Style = "  border-2 border-black rounded-[12px] text-sm";
const inputStyles =
  "  border-2 border-black rounded-[12px] text-end font-bold text-sm";
const tableCellStyle = "border-2 border-black  text-center p-2 text-sm";
const ViewLiquidationModal: React.FC<Props> = ({
  closeModal,
  record,
  refreshData,
}) => {
  const [editableRecord, setEditableRecord] = useState(record);
  const [newData, setNewData] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedApprovers, setEditedApprovers] = useState<number>(
    record.approvers_id
  );
  const [fetchingApprovers, setFetchingApprovers] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [newCashAdvance, setNewCashAdvance] = useState("");
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [isFetchingApprovers, setisFetchingApprovers] = useState(false);
  const [isFetchingUser, setisFetchingUser] = useState(false);
  const [user, setUser] = useState<any>({});
  const [attachmentUrl, setAttachmentUrl] = useState<string[]>([]);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<
    (string | number)[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const hasDisapprovedInNotedBy = notedBy.some(
    (user) => user.status === "Disapproved"
  );
  const hasDisapprovedInApprovedBy = approvedBy.some(
    (user) => user.status === "Disapproved"
  );
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const longPressTimeout = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;

        // Create a mapping of id to branch_name
        const branchMapping = new Map<number, string>(
          branches.map((branch: { id: number; branch_code: string }) => [
            branch.id,
            branch.branch_code,
          ])
        );

        setBranchList(branches);
        setBranchMap(branchMapping);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);
  // Get branch ID from record
  const branchId = parseInt(record.form_data[0].branch, 10);
  // Get branch name or default to "Unknown"
  const branchName = branchMap.get(branchId) || "Unknown";

  useEffect(() => {
    const currentUserId = localStorage.getItem("id");
    setNotedBy(editableRecord.noted_by);
    setApprovedBy(editableRecord.approved_by);
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord(record);
    setNewCashAdvance(record.form_data[0].cashAdvance);

    if (currentUserId) {
      fetchUser(record.user_id);
    }
    try {
      if (typeof record.attachment === "string") {
        // Parse the JSON string if it contains the file path
        const parsedAttachment: string[] = JSON.parse(record.attachment);

        if (parsedAttachment.length > 0) {
          // Construct file URLs
          const fileUrls = parsedAttachment.map(
            (filePath) =>
              `${process.env.REACT_APP_URL_STORAGE}/${filePath.replace(
                /\\/g,
                "/"
              )}`
          );
          setAttachmentUrl(fileUrls);
        }
      }
    } catch (error) {
      console.error("Error parsing attachment:", error);
    }
  }, [record]);

  const fetchUser = async (id: number) => {
    setisFetchingUser(true);
    setisFetchingApprovers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
    } finally {
      setisFetchingUser(false);
      setisFetchingApprovers(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedApprovers(record.approvers_id);
    setAttachmentUrl(attachmentUrl);
    setNewAttachments([]); // Clear new attachments
    setRemovedAttachments([]); // Reset removed attachments
    // Reset newData to original values
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: record.form_data[0].grand_total, // Reset grand_total
        },
      ],
    }));
    // Reset cashAdvance to its original value
    setNewCashAdvance(record.form_data[0].cashAdvance);
  };

  const calculateTotalExpense = () => {
    return newData
      .reduce((total, item) => {
        return total + parseFloat(item.grandTotal || "0");
      }, 0)
      .toFixed(2);
  };

  const calculateShort = (totalExpense: number, cashAdvance: number) => {
    const short = cashAdvance - totalExpense;
    return short.toFixed(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewAttachments((prevImages) => [...prevImages, ...files]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    setNewAttachments((prevImages) => [...prevImages, ...droppedFiles]);
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
    setNewAttachments((prevImages) =>
      prevImages.filter((image) => image.name !== imageName)
    );
  };

  const handleRemoveAttachment = (index: number) => {
    // Get the path of the attachment to be removed
    const attachmentPath = attachmentUrl[index].split(
      "request-form-files/request_form_attachments/"
    )[1];

    // Add the path to the removedAttachments state
    setRemovedAttachments((prevRemoved) => [...prevRemoved, attachmentPath]);

    // Remove the attachment from the current list
    setAttachmentUrl((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleEdit = () => {
    setEditedDate(editableRecord.form_data[0].date);

    setIsEditing(true);
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDate2 = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  if (!record) return null;

  const handleSaveChanges = async () => {
    
    // Simple validation
    if (
      !newData.every(
        (item) =>
          item.from &&
          item.from.trim() !== "" &&
          item.to &&
          item.to.trim() !== "" &&
          item.liquidationDate &&
          item.liquidationDate.trim() !== ""
      )
    ) {
      setErrorMessage("Itinerary and date cannot be empty.");
      return;
    }

    // Check if cashAdvance is less than 1 or negative
    // if (parseFloat(newCashAdvance) < 1 || isNaN(parseFloat(newCashAdvance))) {
    //   setErrorMessage(
    //     "Cash advance must be a positive number greater than or equal to 1."
    //   );
    //   return;
    // }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Token is missing");
        return;
      }

      const formData = new FormData();
      formData.append("updated_at", new Date().toISOString());
      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));
      formData.append("currency", "PHP");
      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: editableRecord.form_data[0].branch,
            date:
              editedDate !== "" ? editedDate : editableRecord.form_data[0].date,
            status: editableRecord.status,
            totalExpense: calculateTotalExpense(),
            cashAdvance: newCashAdvance,
            name: editableRecord.form_data[0].name,
            purpose: editableRecord.form_data[0].purpose,
            items: newData,
            short: calculateShort(
              parseFloat(calculateTotalExpense()),
              parseFloat(newCashAdvance)
            ).toString(),
            signature: editableRecord.form_data[0].signature,
          },
        ])
      );

      // Append existing attachments
      attachmentUrl.forEach((url, index) => {
        const path = url.split(
          "request-form-files/request_form_attachments/"
        )[1];
        formData.append(`attachment_url_${index}`, path);
      });

      // Append new attachments
      newAttachments.forEach((file, index) => {
        formData.append("new_attachments[]", file);
      });

      // Append removed attachments
      removedAttachments.forEach((path, index) => {
        formData.append("removed_attachments[]", String(path));
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/update-request/${record.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);
      setIsEditing(false);
      setSavedSuccessfully(true);
      refreshData();
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update stock requisition."
      );
    }
  };

  if (!record) return null;

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    const newDataCopy = [...newData];
    newDataCopy[index] = { ...newDataCopy[index], [field]: value };
    setErrorMessage("");

    // Calculate the new grandTotal for the row
    const hotelAmount = parseFloat(newDataCopy[index].hotelAmount) || 0;
    const perDiem = parseFloat(newDataCopy[index].perDiem) || 0;
    const particularsAmount =
      parseFloat(newDataCopy[index].particularsAmount) || 0;
    const grandTotal = hotelAmount + perDiem + particularsAmount;

    // Update the grandTotal in the newDataCopy
    newDataCopy[index] = {
      ...newDataCopy[index],
      grandTotal: parseFloat(grandTotal.toString()).toFixed(2),
    };

    // Calculate the totalExpense by summing up all the grandTotal values
    const totalExpense = newDataCopy.reduce((total, item) => {
      return total + parseFloat(item.grandTotal);
    }, 0);

    // Update the state with the new data and totalExpense
    setNewData(newDataCopy);

    // Calculate the short amount
    const cashAdvance =
      parseFloat(editableRecord.form_data[0].cashAdvance) || 0;
    const short = totalExpense - cashAdvance;

    // Update the editableRecord with new totalExpense and short values
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          totalExpense: totalExpense.toString(),
          short: short.toFixed(2),
        },
      ],
      approvers_id: editedApprovers,
    }));
  };

  const openAddCustomModal = () => {
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };

  const handleAddCustomData = (notedBy: Approver[], approvedBy: Approver[]) => {
    setNotedBy(notedBy);
    setApprovedBy(approvedBy);
  };

  const handlePrint = () => {
    // Construct the data object to be passed
    const data = {
      id: record,
      approvedBy: approvedBy,
      notedBy: notedBy,
      user: user,
    };

    localStorage.setItem("printData", JSON.stringify(data));
    // Open a new window with PrintRefund component
    const newWindow = window.open(`/print-liquidation`, "_blank");

    // Optional: Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  const isImageFile = (fileUrl: any) => {
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"];
    const extension = fileUrl.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  const handleViewImage = (imageUrl: any) => {
    setCurrentImage(imageUrl);
    setIsImgModalOpen(true);
  };

  const closeImgModal = () => {
    setIsImgModalOpen(false);
    setCurrentImage(null);
  };

  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3));
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.2, 1));
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleLongPressStart = (e: any) => {
    if (zoom > 1) {
      const startX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      const startY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
      setStartPosition({ x: startX - position.x, y: startY - position.y });

      longPressTimeout.current = window.setTimeout(() => {
        setDragging(true);
      }, 500) as unknown as number;
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current !== null) {
      clearTimeout(longPressTimeout.current);
    }
    setDragging(false);
  };

  const handleMouseMove = (e: any) => {
    if (dragging) {
      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

      setPosition({
        x: clientX - startPosition.x,
        y: clientY - startPosition.y,
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black/50">
      <div className="relative z-10 w-full p-4 px-10 overflow-scroll bg-white border-black rounded-t-lg shadow-lg md:mx-0 md:w-1/2 lg:w-2/3 space-y-auto h-4/5">
        <div className="sticky flex justify-end cursor-pointer top-2">
          <XMarkIcon
            className="w-8 h-8 p-1 text-black bg-white rounded-full "
            onClick={closeModal}
          />
        </div>
        <div className="flex flex-col items-start justify-start w-full space-y-2">
          {!fetchingApprovers && !isFetchingApprovers && (
            <>
              <button
                className="p-1 px-2 text-white bg-blue-600 rounded-md"
                onClick={handlePrint}
              >
                Print
              </button>
              {printWindow && (
                <PrintLiquidation
                  data={{
                    id: record,
                    approvedBy: approvedBy,
                    notedBy: notedBy,
                    user: user,
                  }}
                />
              )}
            </>
          )}
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="font-semibold text-[18px]">
                Liquidation of Actual Expense
              </h1>
            </div>
            <div className="flex w-auto ">
              <p>Date: </p>
              <p className="pl-1 font-bold">
                {formatDate(editableRecord.created_at)}
              </p>
            </div>
          </div>

          <p className="font-medium text-[14px]">
            Request ID: {record.request_code}
          </p>
          <div className="flex items-center w-full md:w-1/2">
            <p>Status:</p>
            <p
              className={`${
                record.status.trim() === "Pending"
                  ? "bg-yellow-400"
                  : record.status.trim() === "Approved"
                  ? "bg-green-400"
                  : record.status.trim() === "Disapproved"
                  ? "bg-pink-400"
                  : record.status.trim() === "Ongoing"
                  ? "bg-primary"
                  : "bg-blue-700"
              } rounded-lg  py-1 w-1/3
             font-medium text-[14px] text-center ml-2 text-white`}
            >
              {" "}
              {record.status}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex w-1/2 ">
              <h1 className="flex items-center">Branch: </h1>
              <p className="w-full pl-1 font-bold bg-white rounded-md ">
                {branchName}
              </p>
            </div>
          </div>
          <div className="w-full mt-6 overflow-x-auto ">
            <div className="w-full border-collapse ">
              <div className="table-container">
                <table className="w-full border-2 border-black ">
                  <thead className="">
                    <tr>
                      <th className="border-2 border-black bg-[#8EC7F7]"></th>
                      <th
                        colSpan={4}
                        className="border-2 border-black bg-[#8EC7F7] py-2 text-center"
                      >
                        TRANSPORTATION
                      </th>
                      <th
                        colSpan={3}
                        className="border-2 border-black bg-[#8EC7F7] text-center"
                      >
                        HOTEL
                      </th>
                      <th
                        colSpan={3}
                        className="border-2 border-black bg-[#8EC7F7] whitespace-nowrap px-2 text-center"
                      >
                        PER DIEM OTHER RELATED EXPENSES
                      </th>
                      <th className="bg-[#8EC7F7]"></th>
                    </tr>
                    <tr>
                      <th>Date</th>

                      <th className={`${tableStyle}`}>From</th>
                      <th className={`${tableStyle}`}>To</th>
                      <th className={`${tableStyle}whitespace-nowrap`}>
                        Type of Transportation
                      </th>
                      <th className={`${tableStyle}`}>Amount</th>
                      <th className={`${tableStyle}`}>Name</th>
                      <th className={`${tableStyle}`}>Place</th>
                      <th className={`${tableStyle}`}>Amount</th>
                      <th className={`${tableStyle}whitespace-nowrap`}>
                        Per Diem
                      </th>
                      <th className={`${tableStyle}`}>Particulars</th>
                      <th className={`${tableStyle}`}>Amount</th>
                      <th className={`${tableStyle}whitespace-nowrap`}>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${tableCellStyle}`}>
                    {isEditing
                      ? newData.map((item, index) => (
                          <tr key={index}>
                            <td className={`${tableCellStyle}`}>
                              <input
                                type="date"
                                value={item.liquidationDate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "liquidationDate",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.from}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "from",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.to}
                                onChange={(e) =>
                                  handleItemChange(index, "to", e.target.value)
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.transportation}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "transportation",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.transportationAmount}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "transportationAmount",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.hotel}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "hotel",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.hotelAddress}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "hotelAddress",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.hotelAmount}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "hotelAmount",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.perDiem}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "perDiem",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.particulars}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "particulars",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.particularsAmount}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "particularsAmount",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2}`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.grandTotal}
                                readOnly
                                className={`${tableStyle2}`}
                              />
                            </td>
                          </tr>
                        ))
                      : editableRecord.form_data[0].items.map((item, index) => (
                          <tr key={index}>
                            <td className={tableCellStyle}>
                              {formatDate2(item.liquidationDate)}
                            </td>
                            <td className={tableCellStyle}>{item.from}</td>
                            <td className={`${tableCellStyle}`}>{item.to}</td>
                            <td className={tableCellStyle}>
                              {item.transportation}
                            </td>
                            <td className={tableCellStyle}>
                              {item.transportationAmount
                                ? parseFloat(item.transportationAmount).toFixed(
                                    2
                                  )
                                : ""}
                            </td>
                            <td className={tableCellStyle}>{item.hotel}</td>
                            <td className={tableCellStyle}>
                              {item.hotelAddress}
                            </td>
                            <td className={tableCellStyle}>
                              {item.hotelAmount &&
                              !isNaN(parseFloat(item.hotelAmount))
                                ? parseFloat(item.hotelAmount).toFixed(2)
                                : ""}
                            </td>
                            <td className={tableCellStyle}>
                              {item.perDiem && !isNaN(parseFloat(item.perDiem))
                                ? parseFloat(item.perDiem).toFixed(2)
                                : ""}
                            </td>
                            <td className={tableCellStyle}>
                              {item.particulars &&
                              !isNaN(parseFloat(item.particulars))
                                ? parseFloat(item.particulars).toFixed(2)
                                : ""}
                            </td>
                            <td className={tableCellStyle}>
                              {item.particularsAmount &&
                              !isNaN(parseFloat(item.particularsAmount))
                                ? parseFloat(item.particularsAmount).toFixed(2)
                                : ""}
                            </td>
                            <td className={tableCellStyle}>
                              {item.grandTotal &&
                              !isNaN(parseFloat(item.grandTotal))
                                ? parseFloat(item.grandTotal).toFixed(2)
                                : ""}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 lg:grid-cols-2 md:gap-2">
            <div>
              <table className="w-full mt-10 border border-black">
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="pl-2 pr-20 font-semibold ">TOTAL EXPENSE</p>
                  </td>
                  <td className={`${inputStyles} font-bold`}>
                    {isEditing
                      ? calculateTotalExpense()
                      : parseFloat(
                          editableRecord.form_data[0].totalExpense
                        ).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="pl-2 pr-20 font-semibold ">CASH ADVANCE</p>
                  </td>
                  <td className={`${inputStyle} font-bold text-right`}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={newCashAdvance}
                        onChange={(e) => setNewCashAdvance(e.target.value === "" ? "0" : e.target.value)}
                        className="w-full font-bold text-right bg-white"
                        readOnly={!isEditing}
                      />
                    ) : (
                      parseFloat(
                        editableRecord.form_data[0].cashAdvance
                      ).toFixed(2)
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="pl-2 font-semibold ">SHORT</p>
                  </td>
                  <td className={`${inputStyles} font-bold`}>
                    ₱
                    {isEditing
                      ? calculateShort(
                          parseFloat(editableRecord.form_data[0].totalExpense),
                          parseFloat(newCashAdvance)
                        ) === "NaN"
                        ? "0.00"
                        : calculateShort(
                            parseFloat(
                              editableRecord.form_data[0].totalExpense
                            ),
                            parseFloat(newCashAdvance)
                          )
                      : parseFloat(editableRecord.form_data[0].short).toFixed(
                          2
                        )}
                  </td>
                </tr>
              </table>
            </div>
            <div>
              <table className="w-full mt-10 mb-10 border border-black">
                <tr>
                  <td className={`${input2Style} `}>
                    <p className="pl-2 pr-20 font-semibold ">
                      NAME OF EMPLOYEE
                    </p>
                  </td>
                  <td className={`${tableStyle} font-bold`}>
                    {record.form_data[0].name}
                  </td>
                </tr>
                <tr>
                  <td className={`${input2Style} h-20 `}>
                    <p className="pl-2 font-semibold ">SIGNATURE</p>
                  </td>
                  <td className={`${tableStyle} h-10`}>
                    <div className="flex items-center justify-center overflow-hidden">
                      <div className="relative">
                        <img
                          src={record.form_data[0].signature}
                          alt="signature"
                          draggable="false"
                          className="h-24"
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ filter: "blur(1px)" }}
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
                  <td className={`${input2Style} `}>
                    <p className="pl-2 font-semibold">EMPLOYEE NO.</p>
                  </td>
                  <td className={`${tableStyle}`}>
                    {record.form_data[0].employeeID}
                  </td>
                </tr>
              </table>
            </div>
          </div>
          {isEditing && (
            <div className="my-2">
              <button
                onClick={openAddCustomModal}
                className="p-2 text-white rounded bg-primary"
              >
                Edit Approver
              </button>
            </div>
          )}
          <div className="flex-col items-center justify-center w-full">
            {isFetchingApprovers ? (
              <div className="flex items-center justify-center w-full h-40">
                <h1>Fetching..</h1>
              </div>
            ) : (
              <div className="flex flex-wrap">
                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Requested By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    <li className="relative flex flex-col items-center justify-center w-auto text-center">
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Signature */}
                        {user.data?.signature && (
                          <div className="absolute -top-4">
                            <img
                              src={user.data?.signature}
                              alt="avatar"
                              width={120}
                              className="relative z-20 pointer-events-none"
                              draggable="false"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                            />
                          </div>
                        )}
                        {/* Name */}
                        <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                          <span className="relative z-10">
                            {user.data?.firstName} {user.data?.lastName}
                          </span>
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                        </p>
                        {/* Position */}
                        <p className="font-bold text-[12px] text-center mt-1">
                          {user.data?.position}
                        </p>
                        {/* Status, if needed */}
                        {user.data?.status && (
                          <p
                            className={`font-bold text-[12px] text-center mt-1 ${
                              user.data?.status === "Approved"
                                ? "text-green-400"
                                : user.data?.status === "Pending"
                                ? "text-yellow-400"
                                : user.data?.status === "Rejected"
                                ? "text-red"
                                : ""
                            }`}
                          >
                            {user.data?.status}
                          </p>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>

                {notedBy.length > 0 && (
                  <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Noted By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {notedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-4">
                              <img
                                src={user.signature}
                                alt="avatar"
                                width={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green-400"
                                  : user.status === "Pending" || !user.status
                                  ? "text-yellow-400"
                                  : ""
                              }`}
                            >
                              {user.status ? user.status : "Pending"}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                )}

                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Approved By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {approvedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-4">
                              <img
                                src={user.signature}
                                alt="avatar"
                                width={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green-400"
                                  : user.status === "Pending" || !user.status
                                  ? "text-yellow-400"
                                  : ""
                              }`}
                            >
                              {user.status ? user.status : "Pending"}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="w-full">
            {isEditing && (
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
            )}
            {newAttachments.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 font-semibold">Attachments:</p>
                <button
                  onClick={() => setNewAttachments([])}
                  className="px-3 py-1 text-xs text-white bg-red-700 rounded-lg hover:bg-red-500"
                >
                  Remove All
                </button>
              </div>
            )}
            <div className="max-w-[500px] overflow-x-auto pb-3">
              <div className="flex gap-1">
                {attachmentUrl.map((fileItem, index) => (
                  <div
                    key={fileItem}
                    className="relative w-24 p-2 bg-white rounded-lg shadow-md"
                  >
                    <div className="relative w-20">
                      {isImageFile(fileItem) ? (
                        // Display image preview if file is an image
                        <>
                          <img
                            src={fileItem}
                            alt="attachment"
                            className="object-cover w-full h-20 rounded-md"
                          />

                          {!isEditing ? (
                            <div className="px-3 py-1 mt-2 text-xs text-center text-white rounded-lg bg-primary">
                              <button
                                onClick={() => handleViewImage(fileItem)}
                                className="text-xs"
                              >
                                View
                              </button>
                            </div>
                          ) : (
                            <p key={index} className="text-center">
                              <button
                                onClick={() => handleRemoveAttachment(index)}
                                className="px-3 py-1 mt-2 text-xs text-white bg-red-500 rounded-lg"
                              >
                                Remove
                              </button>
                            </p>
                          )}
                        </>
                      ) : (
                        // Display document icon if file is not an image
                        <>
                          <div className="flex items-center justify-center w-full h-20 bg-gray-100 rounded-md">
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/3396/3396255.png"
                              alt=""
                            />
                          </div>
                          <div className="mt-2">
                            {!isEditing ? (
                              <a
                                href={fileItem}
                                download
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1 text-xs text-white rounded-lg bg-primary"
                              >
                                Download
                              </a>
                            ) : (
                              <p key={index} className="text-center">
                                <button
                                  onClick={() => handleRemoveAttachment(index)}
                                  className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg"
                                >
                                  Remove
                                </button>
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {newAttachments.map((fileItem) => (
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
              {isImgModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center w-full bg-black bg-opacity-75"
                  onClick={closeImgModal}
                >
                  <div className={zoom > 1 ? "w-4/5" : ""}>
                    <div
                      className="relative rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleLongPressEnd}
                      onTouchMove={handleMouseMove}
                      onTouchEnd={handleLongPressEnd}
                    >
                      <div
                        className="overflow-hidden"
                        style={{
                          cursor: dragging
                            ? "grabbing"
                            : zoom > 1
                            ? "grab"
                            : "default",
                        }}
                        onMouseDown={handleLongPressStart}
                        onTouchStart={handleLongPressStart}
                      >
                        <img
                          src={currentImage || ""}
                          alt="Viewed"
                          className="object-contain w-full max-h-screen transform"
                          style={{
                            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                          }}
                        />
                      </div>

                      <div className="fixed flex w-10 h-10 gap-8 text-4xl text-white rounded-full right-48 top-4">
                        <button
                          onClick={resetZoom}
                          className="w-10 h-10 text-lg text-white"
                        >
                          Reset
                        </button>
                        <button
                          onClick={zoomOut}
                          className="w-10 h-10 text-4xl text-white"
                        >
                          -
                        </button>
                        <button
                          onClick={zoomIn}
                          className="w-10 h-10 text-4xl text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={closeImgModal}
                        className="fixed w-10 h-10 text-4xl text-white right-4 top-4"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* <div>
              {attachmentUrl
                .filter((_, index) => !removedAttachments.includes(index))
                .map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {url.split("/").pop()}
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

              {attachmentUrl.filter(
                (_, index) => !removedAttachments.includes(index)
              ).length === 0 && (
                <p className="text-gray-500">No attachments available.</p>
              )}
            </div> */}
          </div>

          <div className="w-full">
            <h2 className="mb-2 text-lg font-bold">Comments</h2>

            {/* Check if there are no comments in both notedBy and approvedBy */}
            {notedBy.filter((user) => user.comment).length === 0 &&
            approvedBy.filter((user) => user.comment).length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              <>
                {/* Render Noted By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {notedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <img
                            alt="avatar"
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>

                {/* Render Approved By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {approvedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <img
                            alt="avatar"
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>
              </>
            )}
          </div>

          <div className="items-center md:absolute right-20 top-2">
            {isEditing ? (
              <div>
                <button
                  className="items-center h-10 p-2 text-white bg-primary rounded-xl"
                  onClick={handleSaveChanges}
                >
                  {loading ? (
                    <BeatLoader color="white" size={10} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  className="p-2 ml-2 text-white bg-red-600 rounded-xl"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              !fetchingApprovers &&
              !isFetchingApprovers &&
              (editableRecord.status === "Pending" ||
                editableRecord.status === "Disapproved") && (
                <button
                  className="flex p-2 ml-2 text-white bg-blue-500 rounded-xl"
                  onClick={handleEdit}
                >
                  <PencilIcon className="w-6 h-6 mr-2" />
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {savedSuccessfully && (
        <EditStockModalSuccess
          closeSuccessModal={closeModal}
          refreshData={refreshData}
        />
      )}
      <AddCustomModal
        modalIsOpen={isModalOpen}
        closeModal={closeModals}
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

export default ViewLiquidationModal;
