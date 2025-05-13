import React, { useState } from "react";
import DataTable from "react-data-table-component";

type Props = {};
type Record = {
  id: number;
  request_id: string;
  requestType: string;
  date: Date;
  branch: string;
  status: string;
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
    },
    stripedStyle: {
      color: "NORMALCOLOR",
      backgroundColor: "#E7F1F9",
    },
  },
};

const ApproverViewRequest = (props: Props) => {
  const [selected, setSelected] = useState(0);

  const handleClick = (index: number) => {
    setSelected(index);
  };

  const columns = [
    {
      name: "ID",
      selector: (row: Record) => row.id,
      width: "50px",
    },
    {
      name: "Request ID",
      selector: (row: Record) => row.request_id,
    },
    {
      name: "Request Type",
      selector: (row: Record) => row.requestType,
    },
    {
      name: "Date",
      selector: (row: Record) => new Date(row.date).toDateString(),
    },
    {
      name: "Branch",
      selector: (row: Record) => row.branch,
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,

      cell: (row: Record) => (
        <div
          className={`${
            row.status === "Pending"
              ? "bg-yellow-400"
              : row.status === "Approved"
              ? "bg-green-400"
              : "bg-pink-400"
          } rounded-lg w-5/12 py-1 text-center text-white`}
        >
          {row.status}
        </div>
      ),
    },

    {
      name: "Modify",
      cell: (row: Record) => (
        <button className="bg-primary text-white  px-4 py-1 rounded-[12px]">
          View
        </button>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      request_id: "4384040423",
      requestType: "Stock Requisition",
      date: "5/7/2024",
      branch: "9782 Gina Circle",
      status: "Disapproved",
    },
    {
      id: 2,
      request_id: "0963418106",
      requestType: "Stock Requisition",
      date: "4/3/2024",
      branch: "09427 Westend Circle",
      status: "Disapproved",
    },
    {
      id: 3,
      request_id: "9926229387",
      requestType: "Purchase Order",
      date: "12/29/2023",
      branch: "1 Clove Lane",
      status: "Approved",
    },
    {
      id: 4,
      request_id: "2380152772",
      requestType: "Cash Disbursement",
      date: "1/28/2024",
      branch: "49 Elmside Pass",
      status: "Pending",
    },
    {
      id: 5,
      request_id: "8541951650",
      requestType: "Cash Disbursement",
      date: "3/8/2024",
      branch: "11 Darwin Park",
      status: "Pending",
    },
    {
      id: 6,
      request_id: "0584064896",
      requestType: "Purchase Order",
      date: "10/7/2023",
      branch: "8795 Trailsway Crossing",
      status: "Approved",
    },
    {
      id: 7,
      request_id: "3822013196",
      requestType: "Stock Requisition",
      date: "9/18/2023",
      branch: "07696 Sachs Pass",
      status: "Disapproved",
    },
    {
      id: 8,
      request_id: "8262319338",
      requestType: "Purchase Order",
      date: "12/6/2023",
      branch: "23039 Morrow Avenue",
      status: "Pending",
    },
    {
      id: 9,
      request_id: "4870218690",
      requestType: "Purchase Order",
      date: "11/25/2023",
      branch: "5465 Arkansas Parkway",
      status: "Pending",
    },
    {
      id: 10,
      request_id: "3951329823",
      requestType: "Stock Requisition",
      date: "2/18/2024",
      branch: "21 Emmet Terrace",
      status: "Approved",
    },
    {
      id: 11,
      request_id: "3346573478",
      requestType: "Stock Requisition",
      date: "1/1/2024",
      branch: "372 Shelley Way",
      status: "Disapproved",
    },
    {
      id: 12,
      request_id: "0552084174",
      requestType: "Cash Disbursement",
      date: "6/26/2023",
      branch: "9 Dunning Avenue",
      status: "Disapproved",
    },
    {
      id: 13,
      request_id: "9805205193",
      requestType: "Cash Disbursement",
      date: "5/3/2024",
      branch: "685 Derek Point",
      status: "Pending",
    },
    {
      id: 14,
      request_id: "7258271953",
      requestType: "Cash Disbursement",
      date: "10/23/2023",
      branch: "2 Northport Trail",
      status: "Approved",
    },
    {
      id: 15,
      request_id: "1509696326",
      requestType: "Stock Requisition",
      date: "1/5/2024",
      branch: "72 7th Avenue",
      status: "Disapproved",
    },
    {
      id: 16,
      request_id: "4013719886",
      requestType: "Stock Requisition",
      date: "5/27/2023",
      branch: "51 Old Gate Point",
      status: "Disapproved",
    },
    {
      id: 17,
      request_id: "9492118971",
      requestType: "Cash Disbursement",
      date: "8/8/2023",
      branch: "6 Farmco Street",
      status: "Pending",
    },
    {
      id: 18,
      request_id: "0949216771",
      requestType: "Cash Disbursement",
      date: "1/23/2024",
      branch: "41320 Hagan Drive",
      status: "Pending",
    },
    {
      id: 19,
      request_id: "4642876723",
      requestType: "Stock Requisition",
      date: "6/7/2023",
      branch: "26 Sunnyside Lane",
      status: "Disapproved",
    },
    {
      id: 20,
      request_id: "7283188061",
      requestType: "Stock Requisition",
      date: "12/25/2023",
      branch: "21954 Arizona Street",
      status: "Pending",
    },
    {
      id: 21,
      request_id: "2869226527",
      requestType: "Purchase Order",
      date: "1/3/2024",
      branch: "5927 Pepper Wood Court",
      status: "Disapproved",
    },
    {
      id: 22,
      request_id: "0270075801",
      requestType: "Stock Requisition",
      date: "8/7/2023",
      branch: "61907 Lotheville Drive",
      status: "Approved",
    },
    {
      id: 23,
      request_id: "9873252975",
      requestType: "Purchase Order",
      date: "8/13/2023",
      branch: "684 Knutson Crossing",
      status: "Pending",
    },
    {
      id: 24,
      request_id: "8989763312",
      requestType: "Stock Requisition",
      date: "4/12/2024",
      branch: "936 Hintze Avenue",
      status: "Approved",
    },
    {
      id: 25,
      request_id: "3019708222",
      requestType: "Stock Requisition",
      date: "9/19/2023",
      branch: "1 Memorial Terrace",
      status: "Pending",
    },
    {
      id: 26,
      request_id: "8005318111",
      requestType: "Stock Requisition",
      date: "6/14/2023",
      branch: "99 High Crossing Alley",
      status: "Approved",
    },
    {
      id: 27,
      request_id: "2289240710",
      requestType: "Stock Requisition",
      date: "8/9/2023",
      branch: "460 Scott Park",
      status: "Pending",
    },
    {
      id: 28,
      request_id: "2256510859",
      requestType: "Cash Disbursement",
      date: "8/29/2023",
      branch: "83 Lindbergh Point",
      status: "Disapproved",
    },
    {
      id: 29,
      request_id: "6744185608",
      requestType: "Cash Disbursement",
      date: "3/14/2024",
      branch: "34779 Iowa Avenue",
      status: "Disapproved",
    },
    {
      id: 30,
      request_id: "4624665368",
      requestType: "Stock Requisition",
      date: "3/17/2024",
      branch: "43285 Division Plaza",
      status: "Pending",
    },
    {
      id: 31,
      request_id: "2817989163",
      requestType: "Stock Requisition",
      date: "8/31/2023",
      branch: "4603 Anhalt Crossing",
      status: "Pending",
    },
    {
      id: 32,
      request_id: "9902125123",
      requestType: "Cash Disbursement",
      date: "3/18/2024",
      branch: "8612 Cardinal Drive",
      status: "Pending",
    },
    {
      id: 33,
      request_id: "3179588365",
      requestType: "Cash Disbursement",
      date: "1/7/2024",
      branch: "2912 Westerfield Road",
      status: "Pending",
    },
    {
      id: 34,
      request_id: "9119211104",
      requestType: "Stock Requisition",
      date: "6/15/2023",
      branch: "315 Loeprich Alley",
      status: "Disapproved",
    },
    {
      id: 35,
      request_id: "2264508442",
      requestType: "Purchase Order",
      date: "7/17/2023",
      branch: "032 Melrose Avenue",
      status: "Pending",
    },
    {
      id: 36,
      request_id: "7625462072",
      requestType: "Stock Requisition",
      date: "12/20/2023",
      branch: "7559 Bayside Plaza",
      status: "Approved",
    },
    {
      id: 37,
      request_id: "7219641524",
      requestType: "Stock Requisition",
      date: "10/8/2023",
      branch: "40 Reinke Circle",
      status: "Pending",
    },
    {
      id: 38,
      request_id: "1348259477",
      requestType: "Purchase Order",
      date: "1/30/2024",
      branch: "619 Northland Terrace",
      status: "Disapproved",
    },
    {
      id: 39,
      request_id: "4247957287",
      requestType: "Stock Requisition",
      date: "9/19/2023",
      branch: "7090 Westend Court",
      status: "Approved",
    },
    {
      id: 40,
      request_id: "0983440654",
      requestType: "Purchase Order",
      date: "3/18/2024",
      branch: "06646 Loftsgordon Point",
      status: "Disapproved",
    },
    {
      id: 41,
      request_id: "7706405478",
      requestType: "Purchase Order",
      date: "4/18/2024",
      branch: "242 Del Mar Junction",
      status: "Approved",
    },
    {
      id: 42,
      request_id: "1953306314",
      requestType: "Cash Disbursement",
      date: "1/10/2024",
      branch: "45 Gateway Place",
      status: "Disapproved",
    },
    {
      id: 43,
      request_id: "2730982302",
      requestType: "Cash Disbursement",
      date: "3/2/2024",
      branch: "11 Dovetail Crossing",
      status: "Disapproved",
    },
    {
      id: 44,
      request_id: "9584092456",
      requestType: "Purchase Order",
      date: "6/21/2023",
      branch: "0 Truax Hill",
      status: "Disapproved",
    },
    {
      id: 45,
      request_id: "9993131083",
      requestType: "Cash Disbursement",
      date: "12/22/2023",
      branch: "6 Mcbride Lane",
      status: "Pending",
    },
    {
      id: 46,
      request_id: "5337384732",
      requestType: "Stock Requisition",
      date: "9/17/2023",
      branch: "77 Heath Place",
      status: "Approved",
    },
    {
      id: 47,
      request_id: "4533483038",
      requestType: "Purchase Order",
      date: "4/14/2024",
      branch: "082 Mayer Circle",
      status: "Pending",
    },
    {
      id: 48,
      request_id: "1357179782",
      requestType: "Purchase Order",
      date: "11/2/2023",
      branch: "37145 Hintze Terrace",
      status: "Disapproved",
    },
    {
      id: 49,
      request_id: "0782775977",
      requestType: "Cash Disbursement",
      date: "11/19/2023",
      branch: "3196 Pearson Plaza",
      status: "Approved",
    },
    {
      id: 50,
      request_id: "1815193743",
      requestType: "Stock Requisition",
      date: "2/29/2024",
      branch: "9574 Columbus Place",
      status: "Disapproved",
    },
    {
      id: 51,
      request_id: "0145523497",
      requestType: "Purchase Order",
      date: "11/15/2023",
      branch: "4 Ronald Regan Parkway",
      status: "Approved",
    },
    {
      id: 52,
      request_id: "2133624279",
      requestType: "Purchase Order",
      date: "2/19/2024",
      branch: "3276 Lukken Alley",
      status: "Disapproved",
    },
    {
      id: 53,
      request_id: "5330471605",
      requestType: "Purchase Order",
      date: "8/27/2023",
      branch: "67952 Sunnyside Court",
      status: "Disapproved",
    },
    {
      id: 54,
      request_id: "6610371709",
      requestType: "Cash Disbursement",
      date: "6/7/2023",
      branch: "00 Basil Street",
      status: "Disapproved",
    },
    {
      id: 55,
      request_id: "3394501597",
      requestType: "Purchase Order",
      date: "2/4/2024",
      branch: "10 Veith Trail",
      status: "Disapproved",
    },
    {
      id: 56,
      request_id: "3493662688",
      requestType: "Stock Requisition",
      date: "11/17/2023",
      branch: "94 Canary Point",
      status: "Disapproved",
    },
    {
      id: 57,
      request_id: "8039328101",
      requestType: "Cash Disbursement",
      date: "3/21/2024",
      branch: "7691 Dexter Lane",
      status: "Pending",
    },
    {
      id: 58,
      request_id: "5812169705",
      requestType: "Purchase Order",
      date: "4/20/2024",
      branch: "268 Banding Way",
      status: "Approved",
    },
    {
      id: 59,
      request_id: "5117901843",
      requestType: "Stock Requisition",
      date: "12/29/2023",
      branch: "0 Ridgeway Hill",
      status: "Approved",
    },
    {
      id: 60,
      request_id: "7917442314",
      requestType: "Purchase Order",
      date: "5/10/2024",
      branch: "0 Harper Alley",
      status: "Approved",
    },
    {
      id: 61,
      request_id: "3973919607",
      requestType: "Purchase Order",
      date: "3/2/2024",
      branch: "2 Village Pass",
      status: "Disapproved",
    },
    {
      id: 62,
      request_id: "6326648548",
      requestType: "Purchase Order",
      date: "7/30/2023",
      branch: "3805 South Road",
      status: "Disapproved",
    },
    {
      id: 63,
      request_id: "0953207943",
      requestType: "Purchase Order",
      date: "11/15/2023",
      branch: "08 Steensland Crossing",
      status: "Pending",
    },
    {
      id: 64,
      request_id: "4120427374",
      requestType: "Stock Requisition",
      date: "3/28/2024",
      branch: "864 Hazelcrest Drive",
      status: "Pending",
    },
    {
      id: 65,
      request_id: "3825183416",
      requestType: "Cash Disbursement",
      date: "3/20/2024",
      branch: "0495 Nelson Terrace",
      status: "Disapproved",
    },
    {
      id: 66,
      request_id: "6054627554",
      requestType: "Stock Requisition",
      date: "7/14/2023",
      branch: "0 Londonderry Place",
      status: "Approved",
    },
    {
      id: 67,
      request_id: "1811246478",
      requestType: "Stock Requisition",
      date: "7/11/2023",
      branch: "55 Forster Street",
      status: "Approved",
    },
    {
      id: 68,
      request_id: "2138409880",
      requestType: "Purchase Order",
      date: "7/3/2023",
      branch: "0 Sachs Alley",
      status: "Approved",
    },
    {
      id: 69,
      request_id: "8297436853",
      requestType: "Cash Disbursement",
      date: "12/30/2023",
      branch: "31 Lotheville Lane",
      status: "Approved",
    },
    {
      id: 70,
      request_id: "1522066225",
      requestType: "Purchase Order",
      date: "8/17/2023",
      branch: "8 1st Parkway",
      status: "Approved",
    },
    {
      id: 71,
      request_id: "3616883636",
      requestType: "Cash Disbursement",
      date: "3/12/2024",
      branch: "855 Dunning Park",
      status: "Disapproved",
    },
    {
      id: 72,
      request_id: "9447891160",
      requestType: "Purchase Order",
      date: "11/20/2023",
      branch: "431 Gulseth Parkway",
      status: "Pending",
    },
    {
      id: 73,
      request_id: "8916667151",
      requestType: "Stock Requisition",
      date: "9/5/2023",
      branch: "2772 Northport Way",
      status: "Disapproved",
    },
    {
      id: 74,
      request_id: "3593113910",
      requestType: "Purchase Order",
      date: "4/1/2024",
      branch: "934 Prairie Rose Lane",
      status: "Approved",
    },
    {
      id: 75,
      request_id: "3647841196",
      requestType: "Stock Requisition",
      date: "10/8/2023",
      branch: "393 Rockefeller Circle",
      status: "Pending",
    },
    {
      id: 76,
      request_id: "4421906034",
      requestType: "Purchase Order",
      date: "8/23/2023",
      branch: "5088 Springs Pass",
      status: "Pending",
    },
    {
      id: 77,
      request_id: "3363907222",
      requestType: "Stock Requisition",
      date: "1/22/2024",
      branch: "95 South Lane",
      status: "Disapproved",
    },
    {
      id: 78,
      request_id: "5347805269",
      requestType: "Stock Requisition",
      date: "12/2/2023",
      branch: "37 Esch Park",
      status: "Approved",
    },
    {
      id: 79,
      request_id: "2580974121",
      requestType: "Cash Disbursement",
      date: "7/18/2023",
      branch: "511 Ridgeway Place",
      status: "Approved",
    },
    {
      id: 80,
      request_id: "6408062008",
      requestType: "Cash Disbursement",
      date: "8/12/2023",
      branch: "0154 Nova Parkway",
      status: "Pending",
    },
    {
      id: 81,
      request_id: "0345754859",
      requestType: "Cash Disbursement",
      date: "4/13/2024",
      branch: "0173 Butterfield Lane",
      status: "Disapproved",
    },
    {
      id: 82,
      request_id: "3107688177",
      requestType: "Purchase Order",
      date: "6/6/2023",
      branch: "8 Northport Lane",
      status: "Disapproved",
    },
    {
      id: 83,
      request_id: "4949794973",
      requestType: "Cash Disbursement",
      date: "9/4/2023",
      branch: "53 Hermina Hill",
      status: "Disapproved",
    },
    {
      id: 84,
      request_id: "0373356382",
      requestType: "Stock Requisition",
      date: "4/16/2024",
      branch: "46411 Riverside Center",
      status: "Disapproved",
    },
    {
      id: 85,
      request_id: "5347053291",
      requestType: "Purchase Order",
      date: "2/29/2024",
      branch: "3 Shopko Park",
      status: "Approved",
    },
    {
      id: 86,
      request_id: "6684679960",
      requestType: "Purchase Order",
      date: "10/24/2023",
      branch: "9622 Melody Lane",
      status: "Approved",
    },
    {
      id: 87,
      request_id: "9551617096",
      requestType: "Stock Requisition",
      date: "6/17/2023",
      branch: "5 Cherokee Place",
      status: "Pending",
    },
    {
      id: 88,
      request_id: "0208176489",
      requestType: "Purchase Order",
      date: "7/20/2023",
      branch: "9 Farwell Circle",
      status: "Pending",
    },
    {
      id: 89,
      request_id: "7053481441",
      requestType: "Cash Disbursement",
      date: "1/27/2024",
      branch: "42269 Debs Center",
      status: "Disapproved",
    },
    {
      id: 90,
      request_id: "7339408061",
      requestType: "Stock Requisition",
      date: "8/24/2023",
      branch: "13168 Toban Point",
      status: "Pending",
    },
    {
      id: 91,
      request_id: "3260113169",
      requestType: "Stock Requisition",
      date: "6/11/2023",
      branch: "91195 Jenifer Way",
      status: "Pending",
    },
    {
      id: 92,
      request_id: "7642335598",
      requestType: "Purchase Order",
      date: "11/24/2023",
      branch: "3292 Hooker Place",
      status: "Pending",
    },
    {
      id: 93,
      request_id: "9378270506",
      requestType: "Stock Requisition",
      date: "2/8/2024",
      branch: "28 Cardinal Place",
      status: "Disapproved",
    },
    {
      id: 94,
      request_id: "4604741050",
      requestType: "Stock Requisition",
      date: "10/12/2023",
      branch: "7 American Plaza",
      status: "Approved",
    },
    {
      id: 95,
      request_id: "5397580937",
      requestType: "Purchase Order",
      date: "2/27/2024",
      branch: "536 Delladonna Point",
      status: "Pending",
    },
    {
      id: 96,
      request_id: "4707426069",
      requestType: "Cash Disbursement",
      date: "2/6/2024",
      branch: "824 Nevada Junction",
      status: "Pending",
    },
    {
      id: 97,
      request_id: "2489860496",
      requestType: "Purchase Order",
      date: "2/4/2024",
      branch: "9 Garrison Pass",
      status: "Approved",
    },
    {
      id: 98,
      request_id: "6770557355",
      requestType: "Cash Disbursement",
      date: "12/14/2023",
      branch: "40288 Bartillon Junction",
      status: "Disapproved",
    },
    {
      id: 99,
      request_id: "8915629612",
      requestType: "Cash Disbursement",
      date: "4/11/2024",
      branch: "9 Continental Pass",
      status: "Pending",
    },
    {
      id: 100,
      request_id: "9789314817",
      requestType: "Stock Requisition",
      date: "5/25/2024",
      branch: "7 Morningstar Court",
      status: "Disapproved",
    },
  ];

  const items = [
    "All Requests",
    "Pending Requests",
    "Approved Requests",
    "Unsuccessful Requests",
  ];

  return (
    <div className="bg-graybg dark:bg-blackbg w-full h-screen pt-4 px-10 md:px-10 lg:px-30">
      <div className="w-full  h-auto  drop-shadow-lg rounded-lg  md:mr-4 relative ">
        <div className="bg-white   rounded-lg  w-full flex flex-col items-center overflow-x-auto">
          <div className="w-full border-b-2  md:px-30">
            <ul className=" px-2 md:px-30 flex justify-start items-center space-x-4 md:space-x-6 py-4 font-medium overflow-x-auto">
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
            </ul>
          </div>
          <div className="w-full  overflow-x-auto ">
            <DataTable
              columns={columns}
              data={data.map((item) => ({
                ...item,
                date: new Date(item.date),
              }))}
              pagination
              striped
              customStyles={tableCustomStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproverViewRequest;
