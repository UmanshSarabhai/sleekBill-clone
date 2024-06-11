import {
  Button,
  Select,
  Textarea,
  Typography,
  Option,
  Input,
  Tooltip,
} from "@material-tailwind/react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { ProductInvoiceTable } from "../Sales/components/ProductInvoiceTable";
import SelectComp from "../Sales/components/SelectComp";
import {
  get_all_employee,
  get_all_employee_payments,
  get_all_employee_leaves,
  get_all_employee_attendance,
} from "../../../src/utils/SelectOptions";
import HomeButton from "../../assets/Buttons/HomeButton";
import { saveAs } from "file-saver";

const TABLE_HEAD_MAIN = [
  "No",
  "Employee Name",
  "Employee Title",
  "Salary",
  "Contact Number",
  "Address",
  "Joining Date",
  "Notes",
  "Action",
];

const TABLE_HEAD_BALANCE = [
  "No",
  "Employee",
  "Payment Date",
  "Amount",
  "Is_Salary",
  "Payment Type",
  "Payment Notes",
];

const TABLE_HEAD_LEAVE = ["No", "Employee Name", "Leave Date", "Leave Reason"];

const TABLE_HEAD_ATTENDANCE_VIEW = [
  "No",
  "Employee Name",
  "Date",
  "IN Time",
  "Out Time",
];

const initialValue = {
  Employee_name: "",
  Age: "",
  Contact_No: "",
  Address: "",
  Joining_Date: "",
  Notes: "",
  Employee_email: "",
  Employee_title: "",
  Salary: "",
};

const initialLeaveData = {
  employeeName: "",
  leaveDate: "",
  leaveReason: "",
};

const initialAttendanceData = {
  employeeName: "",
  todayDate: convertDateToString(new Date()),
  inTime: "",
  outTime: "",
};

function convertDateToString(date) {
  const dateString = date.toISOString().split("T")[0];
  return dateString;
}

const expense_options = [
  "Food",
  "Fuel",
  "Transportation",
  "Office Expense",
  "Other",
];

const generateDropDownList = (data) => {
  return data.map((x) => ({
    text: x,
    value: x,
  }));
};

const allEmployees = await get_all_employee();
const allPayments = await get_all_employee_payments();
const allLeaves = await get_all_employee_leaves();
const allAttendance = await get_all_employee_attendance();

const uniqueMonths = [
  ...new Set(
    allPayments.map((doc) => new Date(doc.Payment_date).getMonth() + 1)
  ),
];

const uniqueLeaveMonths = [
  ...new Set(allLeaves.map((doc) => new Date(doc.leaveDate).getMonth() + 1)),
];

const uniqueAttendanceMonths = [
  ...new Set(
    allAttendance.map((doc) => new Date(doc.todayDate).getMonth() + 1)
  ),
];

console.log(uniqueAttendanceMonths);

const LEAVE_ROWS = allLeaves.map((item) => {
  return {
    "Employee Name": item.employeeName,
    "Leave Date": convertDateToString(item.leaveDate),
    "Leave Reason": item.leaveReason,
  };
});

const handleDeleteEmployee = async (obj) => {
  const res = await window.api.invoke(
    "delete-employee-by-contact-no",
    obj.Contact_No
  );
  alert(res.message);
};

export default function ShowEmployee() {
  useEffect(() => {
    document.title = "Show Employee";
  });

  const person_option = Array.from(
    new Set(allEmployees.flat().map((x) => x.Employee_name))
  );

  const person_title_option = Array.from(
    new Set(allEmployees.flat().map((x) => x.Employee_title))
  );

  const [filterValues, setFilterValues] = useState({
    Person: "",
    Type: "",
  });
  const [fields, setFields] = useState(initialValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredData, setFilterData] = useState("");

  // State for payment modal
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
  const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [isAttendanceDataModalOpen, setAttendanceDataModalOpen] =
    useState(false);
  const [monthWiseAttendance, setMonthWiseAttendance] = useState([]);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  const [balanceData, setBalanceData] = useState([]);
  const [monthWisePayment, setMonthWisePayment] = useState([]);
  const [paymentDatamentForTheMonth, setPaymentDatamentForTheMonth] =
    useState(0);

  const [employeeApplyingLeave, setEmployeeApplyingLeave] =
    useState(initialLeaveData);
  const [monthWiseLeave, setMonthWiseLeave] = useState([]);

  const [employeeApplyingAttendance, setEmployeeApplyingAttendance] = useState(
    initialAttendanceData
  );
  const [employeeViewingAttendance, setEmployeeViewingAttendance] =
    useState("");

  // Function to open payment modal
  const openPaymentModal = (obj) => {
    handlePaymentFieldChange("Employee_name", obj.Employee_name);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentData(initialPaymentData);
  };

  function generateMonths(uniqueMonths) {
    const monthsToRender = uniqueMonths.sort().map((month) => ({
      value: month,
      text: new Date(2024, month - 1, 1).toLocaleString("en-us", {
        month: "short",
      }),
    }));
    return monthsToRender;
  }

  function calculateNonSalaryTotal(data) {
    let total = 0;
    for (const entry of data) {
      if (entry.Is_Salary === "No") {
        total += entry.Amount;
      }
    }
    return total;
  }

  function filterDocumentsByMonth(month, data) {
    const filteredDocs = data.filter((doc) => {
      const paymentMonth = new Date(doc["Payment Date"]).getMonth() + 1;
      return paymentMonth === getMonthNumber(month);
    });
    return filteredDocs;
  }
  function getMonthNumber(shortMonthName) {
    const shortMonthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthIndex =
      shortMonthNames.indexOf(shortMonthName.toUpperCase()) + 1;
    return monthIndex > 0 ? monthIndex : null;
  }

  function filterLeaveByMonth(month, data) {
    const filteredDocs = data.filter((doc) => {
      const paymentMonth = new Date(doc["Leave Date"]).getMonth() + 1;
      return paymentMonth === getMonthNumber(month);
    });
    return filteredDocs;
  }

  const monthMap = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };

  const filterAttendanceData = (data, employeeName, month) => {
    const monthIndex = monthMap[month.toUpperCase()];

    return data.filter(({ employeeName: name, todayDate }) => {
      const entryDate = new Date(todayDate);
      return name === employeeName && entryDate.getMonth() === monthIndex;
    });
  };

  const openBalanceModal = (obj) => {
    setBalanceData(
      allPayments
        .filter((item) => item.Employee_name === obj.Employee_name)
        .map((items) => {
          return {
            Employee: items.Employee_name,
            "Payment Date": convertDateToString(items.Payment_date),
            Amount: items.Amount,
            Is_Salary: items.Is_Payment_Salary ? "Yes" : "No",
            "Payment Type": items.Payment_type,
            "Payment Notes": items.Payment_notes,
          };
        })
    );
    setBalanceModalOpen(true);
  };

  const closeBalanceModal = () => {
    setBalanceModalOpen(false);
    setMonthWisePayment([]);
  };

  // Function to open attendance modal
  const openAttendanceModal = (obj) => {
    setAttendanceModalOpen(true);
    setEmployeeApplyingAttendance((prevState) => ({
      ...prevState,
      employeeName: obj.Employee_name,
    }));
  };

  // Function to close attendance modal
  const closeAttendanceModal = () => {
    setAttendanceModalOpen(false);
    setEmployeeApplyingAttendance(initialAttendanceData);
  };

  const openAttendanceDataModal = (obj) => {
    setAttendanceDataModalOpen(true);
    setEmployeeViewingAttendance(obj.Employee_name);
    console.log(obj);
  };

  // Function to close attendance modal
  const closeAttendanceDataModal = () => {
    setAttendanceDataModalOpen(false);
    setEmployeeViewingAttendance("");
    setMonthWiseAttendance([]);
  };

  const handleAttendanceSave = async () => {
    const res = await window.api.invoke(
      "add-employee-attendance",
      employeeApplyingAttendance
    );
    alert(res.message);
    setEmployeeApplyingAttendance(initialAttendanceData);
  };

  // Function to open leave modal
  const openLeaveModal = (obj) => {
    setLeaveModalOpen(true);
    setEmployeeApplyingLeave((prevState) => ({
      ...prevState,
      employeeName: obj.Employee_name,
    }));
  };

  // Function to close leave modal
  const closeLeaveModal = () => {
    setLeaveModalOpen(false);
    setEmployeeApplyingLeave(initialLeaveData);
    setMonthWiseLeave([]);
  };

  const handleLeaveSave = async () => {
    const res = await window.api.invoke(
      "add-employee-leave",
      employeeApplyingLeave
    );
    alert(res.message);
    setEmployeeApplyingLeave(initialLeaveData);
  };

  const initialPaymentData = {
    Employee_name: "",
    Payment_date: "",
    Amount: "",
    Payment_type: "",
    Payment_notes: "",
  };
  // State for payment details
  const [paymentData, setPaymentData] = useState(initialPaymentData);

  // Function to handle changes in payment details
  const handlePaymentFieldChange = (field, value) => {
    setPaymentData({ ...paymentData, [field]: value });
  };

  const handlePaymentSave = async () => {
    const res = await window.api.invoke(
      "add-new-employee-payment",
      paymentData
    );
    alert(res.message);
    setPaymentData(initialPaymentData);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const res = await window.api.invoke("add-new-employee", fields);
    alert(res.message);
  };

  const nonEmptyValues = () => {
    return Object.keys(filterValues).filter((key) => filterValues[key] !== "");
  };
  let nonEmptyFields = nonEmptyValues();

  const EXPENSES_ROWS = allEmployees.flat().map((x) => {
    return {
      "Employee Name": x.Employee_name,
      "Employee Title": x.Employee_title,
      Salary: x.Salary,
      "Contact Number": x.Contact_No,
      Address: x.Address,
      "Joining Date": convertDateToString(x.Joining_Date),
      Notes: x.Notes,
      Action: (
        <>
          <Tooltip content="Pay">
            <Button
              color="white"
              size="sm" // Adjusted button size to xs
              onClick={() => openPaymentModal(x)}
              className="py-1 px-2" // Adjusted padding
            >
              <svg
                class="w-[24px] h-[24px] text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 17.345a4.76 4.76 0 0 0 2.558 1.618c2.274.589 4.512-.446 4.999-2.31.487-1.866-1.273-3.9-3.546-4.49-2.273-.59-4.034-2.623-3.547-4.488.486-1.865 2.724-2.899 4.998-2.31.982.236 1.87.793 2.538 1.592m-3.879 12.171V21m0-18v2.2"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Balance">
            <Button
              color="white"
              size="sm" // Adjusted button size to xs
              onClick={() => openBalanceModal(x)}
              className="py-1 px-2" // Adjusted padding
            >
              <svg
                class="w-[24px] h-[24px] text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8H5m12 0a1 1 0 0 1 1 1v2.6M17 8l-4-4M5 8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.6M5 8l4-4 4 4m6 4h-4a2 2 0 1 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Mark Attendance">
            <Button
              color="white"
              size="sm" // Adjusted button size to xs
              onClick={() => openAttendanceModal(x)}
              className="py-1 px-2" // Adjusted padding
            >
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 6H5m2 3H5m2 3H5m2 3H5m2 3H5m11-1a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2M7 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Attendance Details">
            <Button
              color="white"
              size="sm" // Adjusted button size to xs
              onClick={() => openAttendanceDataModal(x)}
              className="py-1 px-2" // Adjusted padding
            >
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7h1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h11.5M7 14h6m-6 3h6m0-10h.5m-.5 3h.5M7 7h3v3H7V7Z"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Leave">
            <Button
              color="white"
              size="sm" // Adjusted button size to xs
              onClick={() => openLeaveModal(x)}
              className="py-1 px-2" // Adjusted padding
            >
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              color="white"
              size="sm" // Adjusted button size to xs
              onClick={() => handleDeleteEmployee(x)}
              className="py-1 px-2" // Adjusted padding
            >
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                />
              </svg>
            </Button>
          </Tooltip>
        </>
      ),
    };
  });

  useEffect(() => {
    let nonEmptyFields = nonEmptyValues();
    let filter = allEmployees
      .flat()
      .filter((object) => {
        return nonEmptyFields.every((field) => {
          if (field === "Person") {
            return object["Employee_name"] === filterValues[field];
          } else {
            return object["Employee_title"] === filterValues[field];
          }
        });
      })
      .map((obj) => {
        return {
          "Employee Name": obj.Employee_name,
          "Employee Title": obj.Employee_title,
          Salary: obj.Salary,
          "Contact Number": obj.Contact_No,
          Address: obj.Address,
          "Joining Date": convertDateToString(obj.Joining_Date),
          Notes: obj.Notes,
          Action: (
            <>
              <Tooltip content="Pay">
                <Button
                  color="white"
                  size="sm" // Adjusted button size to xs
                  onClick={() => openPaymentModal(obj)}
                  className="py-1 px-2" // Adjusted padding
                >
                  <svg
                    class="w-[24px] h-[24px] text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 17.345a4.76 4.76 0 0 0 2.558 1.618c2.274.589 4.512-.446 4.999-2.31.487-1.866-1.273-3.9-3.546-4.49-2.273-.59-4.034-2.623-3.547-4.488.486-1.865 2.724-2.899 4.998-2.31.982.236 1.87.793 2.538 1.592m-3.879 12.171V21m0-18v2.2"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Balance">
                <Button
                  color="white"
                  size="sm" // Adjusted button size to xs
                  onClick={() => openBalanceModal(obj)}
                  className="py-1 px-2" // Adjusted padding
                >
                  <svg
                    class="w-[24px] h-[24px] text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 8H5m12 0a1 1 0 0 1 1 1v2.6M17 8l-4-4M5 8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.6M5 8l4-4 4 4m6 4h-4a2 2 0 1 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Mark Attendance">
                <Button
                  color="white"
                  size="sm" // Adjusted button size to xs
                  onClick={() => openAttendanceModal(obj)}
                  className="py-1 px-2" // Adjusted padding
                >
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 6H5m2 3H5m2 3H5m2 3H5m2 3H5m11-1a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2M7 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Attendance Details">
                <Button
                  color="white"
                  size="sm" // Adjusted button size to xs
                  onClick={() => openAttendanceDataModal(obj)}
                  className="py-1 px-2" // Adjusted padding
                >
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7h1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h11.5M7 14h6m-6 3h6m0-10h.5m-.5 3h.5M7 7h3v3H7V7Z"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Leave">
                <Button
                  color="white"
                  size="sm" // Adjusted button size to xs
                  onClick={() => openLeaveModal(obj)}
                  className="py-1 px-2" // Adjusted padding
                >
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  color="white"
                  size="sm" // Adjusted button size to xs
                  onClick={() => handleDeleteEmployee(obj)}
                  className="py-1 px-2" // Adjusted padding
                >
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                    />
                  </svg>
                </Button>
              </Tooltip>
            </>
          ),
        };
      });
    setFilterData(filter);
  }, [filterValues]);

  const handleFilterChange = (fieldName, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };
  const handleFieldChange = (fieldName, value) => {
    setFields((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };
  const resetFilterValues = () => {
    window.location.reload();
  };

  let salaryToRender = EXPENSES_ROWS.filter(
    (item) => item["Employee Name"] === monthWisePayment[0]?.Employee
  )[0]?.Salary;

  const requiredFields = [
    "Employee_name",
    "Age",
    "Contact_No",
    "Address",
    "Joining_Date",
    "Employee_title",
    "Salary",
  ];

  const isFormIncomplete = requiredFields.some((field) => fields[field] === "");

  const requiredFieldsPayment = [
    "Employee_name",
    "Payment_date",
    "Amount",
    "Payment_type",
    "Payment_notes",
  ];

  const isPaymentFormIncomplete = requiredFieldsPayment.some(
    (field) => paymentData[field] === ""
  );

  const requiredFieldsLeave = ["employeeName", "leaveDate", "leaveReason"];

  const isLeaveFormIncomplete = requiredFieldsLeave.some(
    (field) => employeeApplyingLeave[field] === ""
  );

  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 p-3 mb-3">
        <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Search Employee</Typography>
            <HomeButton />
          </div>
          <hr />
        </div>
        <div className="flex flex-row w-full justify-between my-2">
          <div className="flex mr-12 gap-x-2">
            <SelectComp
              label="Person"
              options={generateDropDownList(person_option)}
              isInput={false}
              handle={(values) => {
                handleFilterChange("Person", values);
              }}
            />
          </div>
          <div className="flex mr-12 gap-x-2">
            <SelectComp
              variant="outlined"
              label="Job Title"
              placeholder="Job Title"
              options={generateDropDownList(person_title_option)}
              handle={(values) => {
                handleFilterChange("Type", values);
              }}
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-between my-2"></div>
        <div className="flex justify-center">
          <div className="mx-3">
            <Button
              onClick={resetFilterValues}
              style={{ margin: "30px 40px 0 0" }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
      <hr />
      <div className="flex my-2 flex-row-reverse">
        <div className="mx-3">
          <Button onClick={openModal}>Add New Employee</Button>
        </div>
      </div>

      <div className="flex flex-1 mb-2">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD_MAIN}
          TABLE_ROWS={
            nonEmptyFields.length === 0 ? EXPENSES_ROWS : filteredData
          }
        />
      </div>
      <>
        {/* New Employee Modal */}
        <Dialog size="l" open={isModalOpen} handleOpen={openModal}>
          <DialogHeader toggler={closeModal}>
            Add New Employee Details
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
                  variant="outlined"
                  label="Employee Name"
                  placeholder="Employee Name"
                  onChange={(e) =>
                    handleFieldChange("Employee_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Age"
                  type="number"
                  onChange={(e) => handleFieldChange("Age", e.target.value)}
                  placeholder="Age"
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Contact No"
                  type="number"
                  onChange={(e) =>
                    handleFieldChange("Contact_No", e.target.value)
                  }
                  placeholder="Contact No"
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Employee Email"
                  placeholder="Employee Email"
                  onChange={(e) =>
                    handleFieldChange("Employee_email", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Employee Title"
                  onChange={(e) =>
                    handleFieldChange("Employee_title", e.target.value)
                  }
                  placeholder="Employee Title"
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Salary"
                  type="number"
                  onChange={(e) => handleFieldChange("Salary", e.target.value)}
                  placeholder="Salary"
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Address"
                  onChange={(e) => handleFieldChange("Address", e.target.value)}
                  placeholder="Address"
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Joining Date"
                  type="date"
                  onChange={(e) =>
                    handleFieldChange("Joining_Date", e.target.value)
                  }
                  placeholder="Joining Date"
                ></Input>
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Notes"
                  onChange={(e) => handleFieldChange("Notes", e.target.value)}
                  placeholder="Notes"
                ></Input>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              style={{ marginRight: 5 }}
            >
              Close
            </Button>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSave}
              disabled={isFormIncomplete}
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Payment Modal */}
        <Dialog
          size="l"
          open={isPaymentModalOpen}
          handleOpen={openPaymentModal}
        >
          <DialogHeader toggler={closePaymentModal}>
            Add Payment Details
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
                  variant="outlined"
                  label="Employee Name"
                  placeholder="Employee Name"
                  value={paymentData.Employee_name}
                  disabled
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Payment Date"
                  type="date"
                  onChange={(e) =>
                    handlePaymentFieldChange("Payment_date", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Amount"
                  type="number"
                  onChange={(e) =>
                    handlePaymentFieldChange("Amount", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Payment Type"
                  placeholder="Payment Type Eg: Cash, UPI"
                  onChange={(e) =>
                    handlePaymentFieldChange("Payment_type", e.target.value)
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Payment Notes"
                  placeholder="Payment Notes"
                  onChange={(e) =>
                    handlePaymentFieldChange("Payment_notes", e.target.value)
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={closePaymentModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              style={{ marginRight: 5 }}
            >
              Close
            </Button>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handlePaymentSave}
              disabled={isPaymentFormIncomplete}
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Balance Modal */}
        <Dialog
          size="l"
          open={isBalanceModalOpen}
          handleOpen={openBalanceModal}
        >
          <DialogHeader toggler={closeBalanceModal}>
            Employee Payment Details
          </DialogHeader>
          <DialogBody>
            <div style={{ marginBottom: 20, width: 100 }}>
              <SelectComp
                label="Month"
                options={generateMonths(uniqueMonths)}
                isInput={false}
                handle={(values) => {
                  setMonthWisePayment(
                    filterDocumentsByMonth(values, balanceData)
                  );
                  setPaymentDatamentForTheMonth(
                    calculateNonSalaryTotal(
                      filterDocumentsByMonth(values, balanceData)
                    )
                  );
                }}
              />
            </div>
            <div className="balanceClass">
              <div>Salary: {salaryToRender}</div>
              <div>Advance: {paymentDatamentForTheMonth}</div>
              <div>
                <b>Balance: {salaryToRender - paymentDatamentForTheMonth}</b>
              </div>
            </div>
            <ProductInvoiceTable
              TABLE_HEAD={TABLE_HEAD_BALANCE}
              TABLE_ROWS={monthWisePayment}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={closeBalanceModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              style={{ marginRight: 5 }}
            >
              Close
            </Button>
          </DialogFooter>
        </Dialog>
        {/* Attendance Modal */}
        <Dialog
          size="l"
          open={isAttendanceModalOpen}
          handleOpen={openAttendanceModal}
        >
          <DialogHeader toggler={closeAttendanceModal}>
            Employee Attendance In/Out
          </DialogHeader>
          <DialogBody>
            <div className="Employee-attendance-modal">
              <div>
                <Input
                  variant="outlined"
                  label="Employee Name"
                  value={employeeApplyingAttendance.employeeName}
                  disabled
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Current Date"
                  type="date"
                  value={employeeApplyingAttendance.todayDate}
                  disabled
                />
              </div>
            </div>
            <div className="Employee-attendance-modal">
              <div>
                <Input
                  variant="outlined"
                  label="IN"
                  type="time"
                  onChange={(e) =>
                    setEmployeeApplyingAttendance((prevState) => ({
                      ...prevState,
                      inTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="OUT"
                  type="time"
                  onChange={(e) =>
                    setEmployeeApplyingAttendance((prevState) => ({
                      ...prevState,
                      outTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={closeAttendanceModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              style={{ marginRight: 5 }}
            >
              Close
            </Button>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleAttendanceSave}
              disabled={
                employeeApplyingAttendance.inTime === "" ||
                employeeApplyingAttendance.outTime === ""
              }
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Attendance Data Modal */}
        <Dialog
          size="l"
          open={isAttendanceDataModalOpen}
          handleOpen={openAttendanceDataModal}
        >
          <DialogHeader toggler={closeAttendanceDataModal}>
            Employee Attendance Details
          </DialogHeader>
          <DialogBody>
            <div style={{ marginBottom: 20, width: 100 }}>
              <SelectComp
                label="Month"
                options={generateMonths(uniqueAttendanceMonths)}
                isInput={false}
                handle={(values) => {
                  setMonthWiseAttendance(
                    filterAttendanceData(
                      allAttendance,
                      employeeViewingAttendance,
                      values
                    )
                  );
                }}
              />
            </div>
            <ProductInvoiceTable
              TABLE_HEAD={TABLE_HEAD_ATTENDANCE_VIEW}
              TABLE_ROWS={monthWiseAttendance.map((x) => {
                return {
                  "Employee Name": x.employeeName,
                  Date: convertDateToString(x.todayDate),
                  "IN Time": x.inTime,
                  "Out Time": x.outTime,
                };
              })}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={closeAttendanceDataModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              style={{ marginRight: 5 }}
            >
              Close
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Leave Modal */}
        <Dialog size="l" open={isLeaveModalOpen} handleOpen={openLeaveModal}>
          <DialogHeader toggler={closeLeaveModal}>
            Employee Leave Details
          </DialogHeader>
          <DialogBody>
            <div className="Employee-leave-modal">
              <div>
                <Input
                  variant="outlined"
                  label="Employee Name"
                  value={employeeApplyingLeave.employeeName}
                  disabled
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Leave Date"
                  placeholder="Leave Date"
                  type="date"
                  onChange={(e) =>
                    setEmployeeApplyingLeave((prevState) => ({
                      ...prevState,
                      leaveDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Input
                  variant="outlined"
                  label="Leave Reason"
                  placeholder="Leave Reason"
                  onChange={(e) =>
                    setEmployeeApplyingLeave((prevState) => ({
                      ...prevState,
                      leaveReason: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <h2 style={{ color: "black", margin: "20px 0px 10px 0px" }}>
              Leaves History:
            </h2>
            <div style={{ marginBottom: 20, width: 100 }}>
              <SelectComp
                label="Month"
                options={generateMonths(uniqueLeaveMonths)}
                isInput={false}
                handle={(values) => {
                  setMonthWiseLeave(filterLeaveByMonth(values, LEAVE_ROWS));
                }}
              />{" "}
            </div>
            <ProductInvoiceTable
              TABLE_HEAD={TABLE_HEAD_LEAVE}
              TABLE_ROWS={monthWiseLeave.filter(
                (x) => x["Employee Name"] === employeeApplyingLeave.employeeName
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={closeLeaveModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              style={{ marginRight: 5 }}
            >
              Close
            </Button>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleLeaveSave}
              disabled={isLeaveFormIncomplete}
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    </div>
  );
}
