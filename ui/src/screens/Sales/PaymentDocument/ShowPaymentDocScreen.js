import {
  Button,
  Select,
  Textarea,
  Typography,
  Option,
  Input,
  Tooltip,
} from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { ProductInvoiceTable } from "../components/ProductInvoiceTable";
import SelectComp from "../components/SelectComp";
import { api_new_client, api_new_payment } from "../../../utils/PageApi";
import {
  get_all_client_option,
  get_all_payment_details,
  get_company_details,
} from "../../../utils/SelectOptions";
import { saveAs } from "file-saver";
import PaymentReceipt from "../components/Receipts/PaymentReceipt";
import { PDFViewer } from "@react-pdf/renderer";
import HomeButton from "../../../assets/Buttons/HomeButton";
import ReportsDropDown from "../../../assets/DropDown/ReportDropDown";

const TABLE_HEAD = [
  "No",
  "Client Name",
  "Document No",
  "Pay Date",
  "Type",
  "Amount Payment",
  "Amount Used",
  "Available Credit",
  "Payment Type",
  "Action",
];

const payment_type = ["Received", "Made", "Advance Payment"];
function convertDropdownData(data) {
  return data.map((item) => ({
    text: item,
    value: item,
  }));
}

let invoices = await get_all_payment_details();
let companyDetails = await get_company_details();
let client_option = await get_all_client_option();
client_option.shift();

export default function ShowPaymentDocScreen() {
  useEffect(() => {
    document.title = "Payment Documents Report";
  });

  const [filterValues, setFilterValues] = useState({
    Client: "",
    Status: "",
    Issue_From: "",
    Issue_To: "",
    Document_No: "",
    Due_Date: "",
    Transaction_type: "",
  });
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

  const openInvoicePreviewWindow = (obj) => {
    setSelectedRow(obj);
    setIsInvoicePreviewOpen(true);
  };
  const closeInvoicePreviewWindow = () => {
    setIsInvoicePreviewOpen(false);
  };

  const resetFilterValues = () => {
    window.location.reload();
  };
  const handleFilterChange = (fieldName, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };
  let filteredArray = invoices.flat().map((obj) => {
    let combinedBill = obj.rowData.reduce((total, item) => {
      // Convert 'Amount Due' to a number and add it to the total
      return total + parseFloat(item["Amount Due"]);
    }, 0);
    return {
      "Client Name": obj.Client,
      "Invoice No": obj.Document_No,
      "Pay Date": obj.Pay_Date,
      Type: obj.Payment_Type,
      "Amount Payment": combinedBill.toFixed(2),
      "Amount Used": obj.Amount_Received,
      "Available Credit": (obj.Amount_Received > combinedBill
        ? Number(obj.Amount_Received) - Number(combinedBill)
        : 0.0
      ).toFixed(2),
      "Payment Type": obj.Payment_Mode,
      ActionButton: (
        <>
          <Tooltip content="Edit">
            <Button
              size="xs"
              className="py-1 px-2"
              style={{ background: "none" }}
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
                  d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Open">
            <Button
              size="xs"
              className="py-1 px-2"
              style={{ background: "none" }}
              onClick={() => openInvoicePreviewWindow(obj)}
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
                  d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0-8.029-4.46a2 2 0 0 0-1.942 0L3 8m18 0-9 6.5L3 8"
                />
              </svg>
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              color="white"
              size="xs" // Adjusted button size to xs
              onClick={() => handleDeleteInvoice(obj)}
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
  // .filter((obj) => obj["Amount Used"]);

  const [filterData, setFilterData] = useState([]);
  const nonEmptyValues = () => {
    return Object.keys(filterValues).filter((key) => filterValues[key] !== "");
  };

  useEffect(() => {
    let nonEmptyFields = nonEmptyValues();
    let filteredData = invoices
      .flat()
      .filter((object) => {
        return nonEmptyFields.every((field) => {
          if (field === "Issue_From" || field === "Issue_To") {
            const fromDate = new Date(filterValues.Issue_From);
            const toDate = new Date(filterValues.Issue_To);
            const issueDate = new Date(object.Pay_Date);
            return issueDate >= fromDate && issueDate <= toDate;
          } else if (field === "Document_No") {
            return object[field].includes(filterValues[field]);
          } else if (field === "Transaction_type") {
            return object.Payment_Type === filterValues[field];
          } else {
            return object[field] === filterValues[field];
          }
        });
      })
      .map((obj) => {
        let combinedBill = obj.rowData.reduce((total, item) => {
          // Convert 'Amount Due' to a number and add it to the total
          return total + parseFloat(item["Amount Due"]);
        }, 0);
        return {
          "Client Name": obj.Client,
          "Invoice No": obj.Document_No,
          "Pay Date": obj.Pay_Date,
          Type: obj.Payment_Type,
          "Amount Payment": combinedBill.toFixed(2),
          "Amount Used": obj.Amount_Received,
          "Available Credit": (obj.Amount_Received > combinedBill
            ? Number(obj.Amount_Received) - Number(combinedBill)
            : 0.0
          ).toFixed(2),
          "Payment Type": obj.Payment_Mode,
          ActionButton: (
            <>
              <Tooltip content="Edit">
                <Button
                  size="xs"
                  className="py-1 px-2"
                  style={{ background: "none" }}
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
                      d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Open">
                <Button
                  size="xs"
                  className="py-1 px-2"
                  style={{ background: "none" }}
                  onClick={() => openInvoicePreviewWindow(obj)}
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
                      d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0-8.029-4.46a2 2 0 0 0-1.942 0L3 8m18 0-9 6.5L3 8"
                    />
                  </svg>
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  color="white"
                  size="xs" // Adjusted button size to xs
                  onClick={() => handleDeleteInvoice(obj)}
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
    setFilterData(filteredData);
  }, [filterValues]);

  const nonEmptyFields = nonEmptyValues();
  const handleDeleteInvoice = async (obj) => {
    const res = await window.api.invoke(
      "delete-payment-by-Document-no",
      obj.Document_No,
    );
    alert(res.message);
  };
  function getTextForValue(option, value) {
    const clients = option;
    const client = clients.find((client) => client.value === value);
    return client ? client.text : "Unknown";
  }
  function removeStatusField(objectsArray) {
    // Iterate through each object in the array
    return objectsArray.map((obj) => {
      // Destructure the object to remove the "Status" field
      const { Status, ActionButton, ...rest } = obj;
      // Return the object without the "Status" field
      return rest;
    });
  }

  const exportInvoicesToExcel = async () => {
    try {
      const response = await window.api.invoke(
        "export-payment_report-to-excel",
        nonEmptyFields.length === 0
          ? removeStatusField(filteredArray)
          : removeStatusField(filterData),
      );
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "export_payment_report.xlsx");
      } else {
        console.error("Error:", response?.error);
      }
      console.log("Export response:", response);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const renderInvoicePreview = () => {
    if (isInvoicePreviewOpen) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)" /* Semi-transparent black */,
            backdropFilter:
              "blur(5px)" /* Apply blur effect to the background */,
            zIndex: 999 /* Ensure the backdrop is above other content */,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "80%",
              maxWidth: "800px" /* Set maximum width for the container */,
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
              padding: "20px",
            }}
          >
            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <button
                style={{
                  background: "orangered",
                  border: "1px solid",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "5px",
                  marginLeft: 10,
                }}
                onClick={closeInvoicePreviewWindow}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <PDFViewer
              style={{
                width: "100%",
                height: "90vh" /* Adjusted height */,
              }}
            >
              <PaymentReceipt
                tableData={selectedRow.rowData}
                details={{
                  Client: selectedRow.Client,
                  Issue_Date: selectedRow.Issue_Date,
                  Document_No: selectedRow.Document_No,
                  Pay_Date: selectedRow.Pay_Date,
                  Bank_Charges: selectedRow.Bank_Charges,
                  Payment_Type: selectedRow.Payment_Type,
                  Payment_Mode: selectedRow.Payment_Mode,
                  Amount_Received: selectedRow.Amount_Received,
                  Type: "PAYMENT NOTE",
                  companyDetails: companyDetails.data[0],
                }}
              />
            </PDFViewer>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 p-3 mb-3">
        <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Search Payment</Typography>
            <HomeButton />
            <ReportsDropDown />
          </div>
          <hr />
        </div>
        <div className="flex flex-row w-full justify-between my-2">
          <div className="mr-12">
            <SelectComp
              label="Client"
              options={client_option}
              isinput={false}
              handle={(values) => {
                handleFilterChange("Client", values);
              }}
            />
          </div>

          <div className="flex mr-12 gap-x-2">
            <Input
              variant="outlined"
              label="Paid From"
              placeholder="Paid From"
              type="date"
              onChange={(e) => handleFilterChange("Issue_From", e.target.value)}
            />

            <Input
              variant="outlined"
              label="Paid To "
              placeholder="Paid To"
              type="date"
              onChange={(e) => handleFilterChange("Issue_To", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-between my-2">
          <div className=" mr-12">
            <Input
              variant="outlined"
              label="Invoice Number"
              placeholder="Invoice Number"
              onChange={(e) =>
                handleFilterChange("Document_No", e.target.value)
              }
            />
          </div>
          <div className="mr-12">
            <SelectComp
              label="Payment Type"
              options={convertDropdownData(payment_type)}
              isinput={false}
              handle={(values) => {
                handleFilterChange("Transaction_type", values);
              }}
            />
          </div>
        </div>
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
          <Button onClick={exportInvoicesToExcel}>Export</Button>
        </div>
        <div className="mx-3">
          <Button onClick={api_new_payment}>New Payment Document</Button>
        </div>
      </div>

      <div className="flex flex-1 mb-2">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD}
          TABLE_ROWS={nonEmptyFields.length === 0 ? filteredArray : filterData}
        />
      </div>
      {/* Modal */}
      {renderInvoicePreview()}
    </div>
  );
}
