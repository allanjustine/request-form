import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Link } from "react-router-dom";
import ApproversStock from "./ApproverStock";
import ApproverPurchase from "./ApproverPurchase";
import ApproverCashAdvance from "./ApproverCashAdvance";
import ApproverCashDisbursement from "./ApproverCashDisbursement";
import ApproverLiquidation from "./ApproverLiquidation";
import ApproverRefund from "./ApproverRefund";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import ApproverDiscount from "./ApproverDiscount";
import Echo from "../utils/Echo";
import Swal from "sweetalert2";
type Props = {};

type Record = {
  approved_attachment: string;
  employeeID: string;
  pending_approver: string;
  requested_by: string;
  id: number;
  created_at: Date;
  user_id: number;
  request_id: string;
  request_code: string;
  form_type: string;
  form_data: MyFormData[];
  date: Date;
  branch: string;
  currency: string;
  status: string;
  purpose: string;
  totalBoatFare: string;
  destination: string;
  grand_total: string;
  grandTotal: string;
  approvers_id: number;
  attachment: string;
  noted_by: Approver[];
  approved_by: Approver[];
  avp_staff: Approver[];
  requested_signature: string;
  requested_position: string;
  completed_status: string;
};
interface Approver {
  id: number;
  firstname: string;
  lastname: string;
  firstName: string;
  lastName: string;
  name: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
  branch: string;
}
type MyFormData = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  employeeID: string;
  requested_by: string;
  approvers_id: number;
  purpose: string;
  items: MyItem[];
  approvers: {
    noted_by: {
      firstName: string;
      lastName: string;
      firstname: string;
      lastname: string;
      position: string;
      signature: string;
      status: string;
      branch: string;
    }[];
    approved_by: {
      firstName: string;
      lastName: string;
      position: string;
      signature: string;
      status: string;
      branch: string;
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
  itinerary: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
  liquidationDate: string;
  particulars: string;
  particularsAmount: string;
  destination: string;
  from: string;
  to: string;
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
      color: "black", // Adjust as per your design
      backgroundColor: "#E7F1F9", // Adjust as per your design
    },
    stripedStyle: {
      color: "black", // Adjust as per your design
      backgroundColor: "#E7F1F9", // Adjust as per your design
    },
  },
};

const RequestApprover = (props: Props) => {
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

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (!id) return;
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
    if (userId) {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const fetchRequests = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/request-forms/for-approval/${userId}`,
            { headers }
          );
          setRequests(response.data.request_forms);
        } catch (error) {
          console.error("Error fetching requests data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRequests();
    }
  }, [userId, notificationReceived]);

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
          <th style={{ color: "black", fontWeight: "500" }}>Requested by</th>
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
            <td className="w-full border border-gray-200" colSpan={7}>
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

  const handleView = (record: Record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
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
          (item: Record) => item.completed_status.trim() === "Completed"
        );
        break;
      case 2:
        filteredRequests = requests.filter(
          (item: Record) =>
            item.status.trim() === "Pending" || item.status.trim() === "Ongoing"
        );
        break;
      case 3:
        filteredRequests = requests.filter(
          (item: Record) => item.status.trim() === "Approved" && item.completed_status.trim() !== "Completed"
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
        const branchId = parseInt(item?.form_data[0].branch, 10);
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

  const columns = [
    {
      name: "Request ID",
      selector: (row: Record) => row.request_code,
      width: "160px",
      sortable: true,
    },
    {
      name: "Requested by",
      sortable: true,
      selector: (row: Record) => row.requested_by,
    },
    {
      name: "Request Type",
      sortable: true,
      selector: (row: Record) => row.form_type,
      width: "300px",
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
      sortable: true,
      selector: (row: Record) => {
        const branchId = parseInt(row.form_data[0].branch, 10);
        return branchMap.get(branchId) || "Unknown";
      },
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,
      sortable: true,
      width: "200px",
      cell: (row: Record) => (
        <div className="relative flex items-center w-full group">
          {/* Status Badge */}
          <div
            className={`${
              row.completed_status === "Completed"
                ? "bg-blue-700"
                : row.status.trim() === "Pending"
                ? "bg-yellow-400"
                : row.status.trim() === "Approved"
                ? "bg-green-400"
                : row.status.trim() === "Disapproved"
                ? "bg-pink-400"
                : row.status.trim() === "Ongoing"
                ? "bg-blue-500"
                : "bg-red-600"
            } rounded-lg py-1 px-3 text-center text-white flex items-center`}
          >
            {row.completed_status === "Completed"
              ? row.completed_status.trim()
              : row.status.trim()}
          </div>

          {/* Tooltip Icon and Tooltip Itself */}
          {(row.status === "Pending" || row.status === "Ongoing") && (
            <div
              className="z-20 flex items-center ml-1 transition-opacity duration-300 transform cursor-pointer tooltip tooltip-right group-hover:opacity-100"
              data-tip={`Pending: ${row.pending_approver}`}
            >
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      width: "150px",
      cell: (row: Record) => (
        <button
          className="bg-primary text-white  px-3 py-1 rounded-[16px]"
          onClick={() => handleView(row)}
        >
          View
        </button>
      ),
    },
  ];

  const closeModal = () => {
    setModalIsOpen(false);
  };

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
        .get(
          `${process.env.REACT_APP_API_BASE_URL}/request-forms/for-approval/${userId}`,
          {
            headers,
          }
        )
        .then((response) => {
          setRequests(response.data.request_forms);
        })
        .catch((error) => {
          console.error("Error refreshing requests data:", error);
        });
    }
  };

  const items = [
    "All Requests",
    "Completed Requests",
    "Pending Requests",
    "Approved Requests",
    "Unsuccessful Requests",
  ];

  return (
    <div className="w-full px-10 pt-4 pb-10 bg-graybg dark:bg-blackbg h-lvh md:px-10 lg:px-30">
      <Link to="/request/sr">
        <button className="bg-primary text-white rounded-[12px] mb-2 w-[120px] sm:w-[151px] h-[34px] z-10">
          Send Request
        </button>
      </Link>
      <div className="relative w-full h-auto rounded-lg drop-shadow-lg md:mr-4">
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
          <ApproversStock
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ApproverPurchase
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ApproverDiscount
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ApproverCashDisbursement
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ApproverCashAdvance
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ApproverLiquidation
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ApproverRefund
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default RequestApprover;
