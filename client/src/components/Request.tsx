import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Link } from "react-router-dom";
import ViewStockModal from "./Modals/ViewStockModal";
import ViewPurchaseModal from "./Modals/ViewPurchaseModal";
import ViewCashDisbursementModal from "./Modals/ViewCashDisbursementModal";
import ViewCashAdvanceModal from "./Modals/ViewCashAdvanceModal";
import ViewLiquidationModal from "./Modals/ViewLiquidationModal";
import ViewRequestModal from "./Modals/ViewRequestModal";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import ViewDiscountModal from "./Modals/ViewDiscountModal";
import Swal from "sweetalert2";
import Echo from "../utils/Echo";
type Props = {};

type Record = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  currency: string;
  pending_approver: {
    approver_name: string;
  };
  requested_by: string;
  requested_signature: string;
  requested_position: string;
  id: number;
  noted_by: {
    id: number;
    firstName: string;
    lastName: string;
    firstname: string;
    lastname: string;
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
    firstname: string;
    lastname: string;
    position: string;
    signature: string;
    status: string;
  }[];
  user_id: number;
  request_code: string;

  form_type: string;
  form_data: MyFormData[];
  date: Date;
  created_at: Date;
  branch: string;
  status: string;
  purpose: string;
  totalBoatFare: string;
  destination: string;
  grand_total: string;
  grandTotal: string;
  approvers_id: number;
  attachment: string;
};

type MyFormData = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  approvers_id: number;
  employeeID: string;
  purpose: string;
  items: MyItem[];
  noted_by: {
    id: number;
    firstName: string;
    firstname: string;
    lastname: string;
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

  approvers: {
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
  date: string;
  branch: string;
  grand_total: string;
  supplier: string;
  address: string;
  totalBoatFare: string;
  totalContingency: string;
  totalFare: string;
  totalHotel: string;
  totalperDiem: string;
  totalExpense: string;
  cashAdvance: string;
  short: string;
  name: string;
  signature: string;
  attachment: string;
  branch_id: number;
};

type MyItem = {
  brand: string;
  model: string;
  unit: string;
  partno: string;
  labor: string;
  spotcash: string;
  discountedPrice: string;
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
  date: string;
  cashDate: string;
  branch: string;
  status: string;
  day: string;
  from: string;
  to: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
  liquidationDate: string;
  particulars: string;
  particularsAmount: string;
  destination: string;
  transportation: string;
  transportationAmount: string;
  hotelAmount: string;
  hotelAddress: string;
  grandTotal: string;
};

const tableCustomStyles = {
  headRow: {
    style: {
      color: "black",
      backgroundColor: "#FFFF",
    },
  },
  rows: {
    style: {
      color: "STRIPEDCOLOR",
      backgroundColor: "STRIPEDCOLOR",
      transition: "background-color 0.1s ease",
      "&:hover": {
        backgroundColor: "#D1E4F3",
      },
    },
    stripedStyle: {
      color: "NORMALCOLOR",
      backgroundColor: "#E7F1F9",
    },
  },
};

const Request = (props: Props) => {
  const [selected, setSelected] = useState(0);
  const [requests, setRequests] = useState<Record[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const userId = localStorage.getItem("id");
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notificationReceived, setnotificationReceived] = useState(false);
  const [search, searchRequest] = useState("");
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;

        // Create a mapping of id to branch_code
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

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (Echo) {
      const channel = Echo.private(`App.Models.User.${id}`).notification(
        (notification: any) => {
          setnotificationReceived(true);
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: notification.message,
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: true,
            showCloseButton: true,
          });
        }
      );

      return () => {
        channel.stopListening(
          "IlluminateNotificationsEventsBroadcastNotificationCreated"
        );
      };
    }
  }, []);

  useEffect(() => {
    if (notificationReceived) {
      setnotificationReceived(false);
    }
  }, [notificationReceived]);

  useEffect(() => {
    if (userId) {
      const fetchRequests = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        try {
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/view-request`,
            { headers }
          );
          setRequests(response.data.data);
        } catch (error) {
          console.error("Error fetching requests data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRequests();
    }
  }, [userId, notificationReceived, toDelete]);

  const handleView = (record: Record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
  };

  const handleDelete = (record: Record) => {
    // Check if the status is not "Pending"
    setToDelete(true);
    if (record.status !== "Pending") {
      Swal.fire({
        icon: "info",
        title: "Request Approved",
        html:
          `<strong>Are you sure you want to delete this request, even though it has already been approved?</strong> <br/>` +
          "Request Code: " +
          record.request_code +
          " <br/> Request Type: " +
          record.form_type,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          const token = localStorage.getItem("token");
          if (!token) return;
          const headers = { Authorization: `Bearer ${token}` };

          axios
            .delete(
              `${process.env.REACT_APP_API_BASE_URL}/delete-request/${record.id}`,
              {
                headers,
              }
            )
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: `The request was successfully deleted.`,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Close",
              });
            })
            .catch((error) => {
              console.error("Error deleting request:", error);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Close",
              });
            })
            .finally(() => {
              setToDelete(false);
            });
        }
      });

      return;
    }

    Swal.fire({
      title: "Are you sure you want to delete this request?",
      html:
        "Request Code: " +
        record.request_code +
        " <br/> Request Type: " +
        record.form_type,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        axios
          .delete(
            `${process.env.REACT_APP_API_BASE_URL}/delete-request/${record.id}`,
            {
              headers,
            }
          )
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `The request was successfully deleted.`,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Close",
            });
          })
          .catch((error) => {
            console.error("Error deleting request:", error);
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Close",
            });
          })
          .finally(() => {
            setToDelete(false);
          });
      }
    });
  };

  const handleClick = (index: number) => {
    setSelected(index);
  };

  const handleSearchRequest = (event: React.ChangeEvent<HTMLInputElement>) => {
    searchRequest(event.target.value.toLowerCase());
  };
  const filteredData = () => {
    let filteredRequests;

    switch (selected) {
      case 0:
        filteredRequests = requests;
        break;
      case 1:
        filteredRequests = requests.filter(
          (item: Record) => item.status.trim() === "Completed"
        );
        break;
      case 2:
        filteredRequests = requests.filter(
          (item: Record) =>
            item.status.trim() === "Pending"
        );
        break;
      case 3:
        filteredRequests = requests.filter(
          (item: Record) => item.status.trim() === "Ongoing"
        );
        break;
      case 4:
        filteredRequests = requests.filter(
          (item: Record) => item.status.trim() === "Disapproved"
        );
        break;
      default:
        filteredRequests = requests;
    }

    if (search.trim()) {
      filteredRequests = filteredRequests.filter((item: Record) => {
        const formattedDate = new Date(item.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );
        const branchId = parseInt(item.form_data[0].branch, 10);
        const branchCode = branchMap.get(branchId)?.toLowerCase();

        return (
          item.request_code.toLowerCase().includes(search.toLowerCase()) ||
          item.form_type.toLowerCase().includes(search.toLowerCase()) ||
          formattedDate.toLowerCase().includes(search) ||
          branchCode?.includes(search.toLowerCase()) ||
          item.status.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    return filteredRequests;
  };

  const NoDataComponent = () => (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <p className="text-lg">No {search ? `"${search}"` : ""} records found</p>
    </div>
  );

  const LoadingSpinner = () => (
    <table className="table" style={{ background: "white" }}>
      <thead>
        <tr>
          <th
            className="w-[80px] py-6"
            style={{ color: "black", fontWeight: "500" }}
          >
            Request ID
          </th>
          <th style={{ color: "black", fontWeight: "500" }}>Request Type</th>
          <th style={{ color: "black", fontWeight: "500" }}>Date</th>
          <th style={{ color: "black", fontWeight: "500" }}>Branch</th>
          <th style={{ color: "black", fontWeight: "500" }}>Status</th>
          <th style={{ color: "black", fontWeight: "500" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, index) => (
          <tr key={index}>
            <td className="w-full border border-gray-200" colSpan={6}>
              <div className="flex justify-center">
                <div className="flex flex-col w-full gap-4">
                  <div className="w-full h-12 skeleton bg-slate-300"></div>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const refreshData = () => {
    if (userId) {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/view-request`, {
          headers,
        })
        .then((response) => {
          setRequests(response.data.data); // Assuming response.data.data contains your array of data
        })
        .catch((error) => {});
    }
  };
  const columns = [
    {
      name: "Request ID",
      selector: (row: Record) => row.request_code,
      width: "160px",
      sortable: true,
    },

    {
      name: "Request Type",
      selector: (row: Record) => row.form_type,
      width: "300px",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row: Record) =>
        new Date(row.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row: Record) => {
        // Ensure form_data exists and has at least one item with a branch field
        if (
          row.form_data &&
          row.form_data.length > 0 &&
          row.form_data[0].branch
        ) {
          const branchId = parseInt(row.form_data[0].branch, 10);
          return branchMap.get(branchId) || "Unknown";
        }
        return "Unknown"; // Return "Unknown" if branch is unavailable
      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,
      sortable: true,
      width: "150px",
      cell: (row: Record) => (
        <div className="relative flex items-center w-full group">
          {/* Status Badge */}
          <div
            className={`${
              row.status.trim() === "Pending"
                ? "bg-yellow-400"
                : row.status.trim() === "Approved"
                ? "bg-green-400"
                : row.status.trim() === "Disapproved"
                ? "bg-pink-400"
                : row.status.trim() === "Ongoing"
                ? "bg-blue-500"
                : "bg-blue-700"
            } rounded-lg py-1 px-3 text-center text-white flex items-center`}
          >
            {row.status.trim()}
          </div>

          {/* Tooltip Icon and Tooltip Itself */}
          {(row.status === "Pending" || row.status === "Ongoing") && (
            <div
              className="z-20 flex items-center ml-1 transition-opacity duration-300 transform cursor-pointer tooltip tooltip-right group-hover:opacity-100"
              data-tip={`Pending: ${row.pending_approver.approver_name}`}
            >
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      width: "180px",
      cell: (row: Record) => (
        <div className="flex items-center justify-center w-full gap-2">
          <button
            className="bg-primary text-white px-3 py-1 rounded-[16px]"
            onClick={() => handleView(row)}
          >
            View
          </button>
          <button
            className="bg-pink text-white px-3 py-1 rounded-[16px]"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const items = [
    "All Requests",
    "Completed Requests",
    "Pending Requests",
    "Ongoing Requests",
    "Unsuccessful Requests",
  ];

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="w-full px-10 pt-4 bg-graybg dark:bg-blackbg h-lvh md:px-10 lg:px-30">
      <Link to="/request/sr">
        <button className="bg-primary text-white rounded-[12px] mb-2 w-[120px] sm:w-[151px] h-[34px] z-10">
          Create a Request
        </button>
      </Link>

      <div className="relative w-full h-auto rounded-lg drop-shadow-lg md:mr-4 ">
        <div className="flex flex-col items-center w-full overflow-x-auto bg-white rounded-lg">
          <div className="w-full border-b-2 md:px-30">
            <ul className="flex items-center justify-between px-2 py-4 space-x-4 overflow-x-auto font-medium md:px-30 md:space-x-6">
              <div className="flex justify-start">
                {items.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleClick(index)}
                    className={`cursor-pointer hover:text-primary px-2 ${
                      selected === index ? "underline text-primary" : ""
                    } underline-offset-8 decoration-primary decoration-2`}
                  >
                    {item}
                  </li>
                ))}
              </div>
              <div className="group justify-end flex px-4 py-3 rounded-md border-2 border-blue-300 overflow-hidden max-w-md mx-auto font-[sans-serif] focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 192.904 192.904"
                  width="16px"
                  className="mr-3 rotate-90 fill-gray-600"
                >
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full text-sm text-gray-600 bg-transparent outline-none focus:outline-none"
                  value={search}
                  onChange={handleSearchRequest}
                />
              </div>
            </ul>
          </div>
          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              defaultSortAsc={false}
              data={
                filteredData()
                  .map((item: Record) => ({
                    ...item,
                    date: new Date(item.date),
                  }))
                  .sort((a, b) => b.id - a.id) // Sorts by id in descending order
              }
              noDataComponent={<NoDataComponent />}
              progressPending={loading}
              progressComponent={<LoadingSpinner />}
              pagination
              striped
              customStyles={tableCustomStyles}
            />
          </div>
        </div>
      </div>
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Stock Requisition Slip" && (
          <ViewStockModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ViewDiscountModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ViewPurchaseModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ViewCashDisbursementModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ViewCashAdvanceModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ViewLiquidationModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ViewRequestModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default Request;
