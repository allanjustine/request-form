import React, { useState, useEffect } from "react";
import Man from "./assets/manComputer.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faRotate,
  faFileLines,
  faFileCircleXmark,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import { useUser } from "../context/UserContext";

interface FormData {
  purpose: string;
  items: Item[];
  date: string;
  branch: string;
  grand_total: string;
  supplier?: string;
  address?: string;
  totalBoatFare?: string;
  totalContingency?: string;
  totalFare?: string;
  totalHotel?: string;
  totalperDiem?: string;
  totalExpense?: string;
  cashAdvance?: string;
  short?: string;
  name?: string;
  signature?: string;
}

interface Item {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks?: string | null;
  date?: string;
  branch?: string;
  status?: string;
  day?: string;
}

interface Request {
  id: number;
  request_code: string;
  user_id: number;
  form_type: string;
  form_data: FormData[];
  date: string;
  branch: string;
  status: string;
  purpose?: string;
  totalBoatFare?: string;
  destination?: string;
  approvers_id?: number;
  created_at?: string;
}

const boxWhite =
  "bg-white w-full h-[190px] rounded-[15px] drop-shadow-lg relative";
const boxPink = "w-full h-[150px] rounded-t-[12px] relative";
const outerLogo =
  "lg:w-[120px] lg:h-[125px] w-[80px] h-[90px] right-0 mr-[56px] lg:mt-[26px] mt-[56px] absolute";
const innerBox =
  "lg:w-[82px] lg:h-[84px] w-[57px] h-[58px] bg-white absolute right-0 mr-[29px] lg:mt-[37px] md:mt-[47px] mt-[47px] rounded-[12px] flex justify-center items-center";
const innerLogo =
  "lg:w-[48px] lg:h-[51px] w-[40px] h-[45px] flex justify-center items-center";

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRequestsSent, setTotalRequestsSent] = useState<number | null>(
    null
  );
  const [totalOngoingRequests, setTotalOngoingRequests] = useState<
    number | null
  >(null);
  const [totalCompletedRequests, setTotalCompletedRequests] = useState<
    number | null
  >(null);
  const [totalPendingRequests, setTotalPendingRequests] = useState<
    number | null
  >(null);
  const [totalDisapprovedRequests, setTotalDisapprovedRequests] = useState<
    number | null
  >(null);

  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const firstName = localStorage.getItem("firstName");
  const userId = localStorage.getItem("id");
  const [dataLoading, setDataLoading] = useState(true);
  const { role } = useUser();

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

  const linkTo = useNavigate();
  const NoDataComponent = () => (
    <div className="flex items-center justify-center h-64 overflow-hidden text-gray-500">
      <p className="text-lg">No records found</p>
    </div>
  );
  const LoadingSpinner = () => (
    <table className="table" style={{ background: "white" }}>
      <thead>
        <tr>
          <th className="py-6" style={{ color: "black", fontWeight: "bold" }}>
            Request ID
          </th>
          <th style={{ color: "black", fontWeight: "bold" }}>Request Type</th>
          <th style={{ color: "black", fontWeight: "bold" }}>Date</th>
          <th style={{ color: "black", fontWeight: "bold" }}>Branch</th>
          <th style={{ color: "black", fontWeight: "bold" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, index) => (
          <tr key={index}>
            <td className="w-full border border-gray-200" colSpan={5}>
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

  useEffect(() => {
    if (userId) {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch requests data
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/view-request`, { headers })
        .then((response) => {
          if (Array.isArray(response.data.data)) {
            setRequests(response.data.data);
            setLoading(false);
          } else {
            console.error("Unexpected data format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching requests data:", error);
          setLoading(false);
        }).finally(() => {
          setDataLoading(false);
        });

      // Fetch total requests sent

      axios
        .get(
          `${process.env.REACT_APP_API_BASE_URL}/total-request-sent/${userId}`,
          {
            headers,
          }
        )
        .then((response) => {
          setTotalRequestsSent(response.data.totalRequestSent);
          setTotalCompletedRequests(response.data.totalCompletedRequest);
          setTotalPendingRequests(response.data.totalPendingRequest);
          setTotalOngoingRequests(response.data.totalOngoingRequest);
          setTotalDisapprovedRequests(response.data.totalDisapprovedRequest);
        })
        .catch((error) => {
          console.error("Error fetching total requests sent:", error);
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [userId]);

  const sortedRequests = requests.sort((a, b) => b.id - a.id);

  // Take the first 5 requests
  const latestRequests = sortedRequests.slice(0, 5);

  const columns = [
    {
      name: "Request ID",
      selector: (row: Request) => row.request_code,
      width: "160px",
      sortable: true,
    },

    {
      name: "Request Type",
      selector: (row: Request) => row.form_type,
      width: "300px",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row: Request) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row: Request) => {
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
      selector: (row: Request) => row.status.trim(),
      sortable: true,
      cell: (row: Request) => (
        <div
          className={`${
            row.status.trim() === "Pending"
              ? "bg-yellow-400"
              : row.status.trim() === "Approved"
              ? "bg-green-400"
              : row.status.trim() === "Disapproved"
              ? "bg-pink-400"
              : row.status.trim() === "Ongoing"
              ? "bg-primary"
              : "bg-blue-700"
          } rounded-lg py-1 w-full md:w-full xl:w-3/4 2xl:w-2/4 text-center text-white`}
        >
          {row.status.trim()}
        </div>
      ),
    },
  ];
  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[26px] px-[35px]">
      <div className="bg-primary w-full sm:w-full h-[210px] rounded-[12px] pl-[30px] flex flex-row justify-between items-center">
        <div>
          <p className="text-[15px] lg:text-[20px]">Hi, {firstName} 👋</p>
          <p className="text-[15px] lg:text-[20px] text-white font-semibold">
            Welcome to Request
          </p>
          <p className="text-[15px] hidden sm:block text-white mb-4">
            Request products and services
          </p>
          {role !== 'Admin' && (
            <div>
              <Link to="/request/sr">
                <button className="bg-[#FF947D] text-[15px] w-full lg:h-[57px] h-[40px] rounded-[12px] font-semibold">
                  Create a Request
                </button>
              </Link>
            </div>
          )}
        </div>
        <div className="ml-4 mr-[29px]">
          <img alt="man" src={Man} width={320} height={176} />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 mt-4 space-y-2 sm:w-full md:grid-cols-2 lg:grid-cols-5 md:space-y-0">
        <div className={`${boxWhite} hover:-translate-y-1`}>
          <div className={`${boxPink} bg-primary`}>
            <FontAwesomeIcon icon={faFileLines} className={`${outerLogo} text-[#298DDE] max-h-[78%]`} />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon icon={faFileLines} className={`${innerLogo} text-primary`} />
            </div>
            <p className="text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
              Total Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {dataLoading ? (
                <div className="my-4 custom-loader bottom-6"></div>
              ) : (
                totalRequestsSent
              )}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1`}>
          <div className={`${boxPink} bg-[#4abffd]`}>
            <FontAwesomeIcon
              icon={faFileCircleCheck}
              className={`${outerLogo} text-[#2a8bbf]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faFileCircleCheck}
                className={`${innerLogo} text-[#2ea7e8]`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
              Completed Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {dataLoading ? (
                <div className="my-4 custom-loader bottom-6"></div>
              ) : (
                totalCompletedRequests
              )}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1`}>
          <div className={`${boxPink} bg-[#32bfd5]`}>
            <FontAwesomeIcon
              icon={faRotate}
              className={`${outerLogo} text-[#368a96]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faRotate}
                className={`${innerLogo} text-[#2da6b9]`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
              Ongoing Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {dataLoading ? (
                <div className="my-4 custom-loader bottom-6"></div>
              ) : (
                totalOngoingRequests
              )}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1`}>
          <div className={`${boxPink} bg-yellow`}>
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              className={`${outerLogo} text-[#D88A1B]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className={`${innerLogo} text-yellow`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
              Pending Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {dataLoading ? (
                <div className="my-4 custom-loader bottom-6"></div>
              ) : (
                totalPendingRequests
              )}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1`}>
          <div className={`${boxPink} bg-pink`}>
            <FontAwesomeIcon
              icon={faFileCircleXmark}
              className={`${outerLogo} text-[#C22158]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faFileCircleXmark}
                className={`${innerLogo} text-pink`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
              Unsuccessful Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {dataLoading ? (
                <div className="my-4 custom-loader bottom-6"></div>
              ) : (
                totalDisapprovedRequests
              )}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`mt-[20px] mb-10 bg-white w-full h-72 data-table-container drop-shadow-lg rounded-[12px] relative sm:w-full ${
          latestRequests.length === 0 ? "overflow-hidden" : "overflow-x-auto"
        }`}
      >
        <h1 className="py-[16px] px-[25px] font-bold text-[20px]">
          Recent requests
        </h1>
        <p className="flex justify-end px-[25px] -mt-10 mb-1">
          <button onClick={() => linkTo("/request")}>
            <span className="bg-primary px-3 py-1 rounded-[12px] text-white">
              See all
            </span>
          </button>
        </p>
        <div>
          <DataTable
            className="data-table"
            columns={columns}
            data={latestRequests}
            noDataComponent={<NoDataComponent />}
            progressPending={loading}
            progressComponent={<LoadingSpinner />}
            pagination
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
