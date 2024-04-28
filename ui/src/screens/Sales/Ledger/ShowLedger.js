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
import {
  get_all_client_option,
  get_all_invoices,
  get_company_details,
  get_all_payment_details,
} from "../../../utils/SelectOptions";
import { saveAs } from "file-saver";
import Invoice from "../components/Invoice";
import { PDFViewer } from "@react-pdf/renderer";
import HomeButton from "../../../assets/Buttons/HomeButton";
const { ipcRenderer } = window.require("electron");

const TABLE_HEAD = [
  "No",
  "Client Name",
  "Invoice No",
  "Issue Date",
  "Due Date",
  "Total",
  "Status",
  "Amount Paid",
  "Balance",
  "Date of payemnt",
  "Type",
  "Action",
];

const TABLE_HEAD_SECOND = [
  "No",
  "Client Name",
  "Document No",
  "Pay Date",
  "Type",
  "Amount Payment",
  "Amount Used",
  "Available Credit",
  "Payment Type",
];

const TABLE_HEAD_THREE = [
  "No",
  "Document No",
  "Date",
  "Type",
  "Credit (+)",
  "Debit (-)",
];

const payemnt_options = [
  {
    text: "Cash",
    value: "Cash",
  },
  {
    text: "Cheque",
    value: "Cheque",
  },
  {
    text: "Bank Transfer",
    value: "Bank Transfer",
  },
];

const status_options = [
  {
    text: "Unpaid",
    value: "Unpaid",
  },
  {
    text: "Paid",
    value: "Paid",
  },
];

let invoices = await get_all_invoices();
let companyDetails = await get_company_details();
let client_option = await get_all_client_option();
client_option.shift();
let paymentDetails = await get_all_payment_details();
console.log(JSON.stringify(paymentDetails));

export default function ShowLedgerPage() {
  useEffect(() => {
    document.title = "Show Ledger";
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
  const [paymentRows, setPaymentRows] = useState([]);
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

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const defaultDateFormatted = `${currentYear}-04-01`;
    handleFilterChange("Issue_From", defaultDateFormatted);
    const today = new Date();
    // Format the date
    const formattedDate =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      today.getDate().toString().padStart(2, "0");
    handleFilterChange("Issue_To", formattedDate);
  }, []);

  let filteredArray = invoices.flat().map((obj) => {
    const dueDate = new Date(obj.Due_Date);
    // Get today's date
    const today = new Date();
    return {
      "Client Name": obj.Client,
      "Invoice No": obj.Document_No,
      "Issue Date": obj.Issue_Date,
      "Due Date": (
        <p style={{ color: dueDate <= today ? "red" : "inherit" }}>
          {obj.Due_Date}
        </p>
      ),
      Total: (
        Number(obj.Total_BeforeTax) +
        Number(obj.Total_Tax) +
        Number(obj.Shipping_Charges)
      ).toFixed(2),
      Status:
        Number(obj.Total_BeforeTax) +
          Number(obj.Total_Tax) +
          Number(obj.Shipping_Charges) -
          obj.Amount_Paid <=
        0 ? (
          <p style={{ color: "green" }}>Paid</p>
        ) : (
          <p style={{ color: "orangered" }}>Unpaid</p>
        ),
      "Amount Paid": obj.Amount_Paid,
      Balance: (
        Number(obj.Total_BeforeTax) +
        Number(obj.Total_Tax) +
        Number(obj.Shipping_Charges) -
        obj.Amount_Paid
      ).toFixed(2),
      "Date of payment": obj.Date_of_payment,
      Type: obj.Transaction_type,
      ActionButton: (
        <>
          {" "}
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
            // Check if Issue Date lies in the range between Issue_From and Issue_To
            const fromDate = new Date(filterValues.Issue_From);
            const toDate = new Date(filterValues.Issue_To);
            const issueDate = new Date(object.Issue_Date);
            return issueDate >= fromDate && issueDate <= toDate;
          } else if (field === "Status") {
            // Check if the invoice is paid or unpaid
            if (filterValues.Status === "Paid") {
              // Filter for paid invoices
              return (
                Number(object.Total_BeforeTax) +
                  Number(object.Total_Tax) +
                  Number(object.Shipping_Charges) -
                  object.Amount_Paid <=
                0
              );
            } else if (filterValues.Status === "Unpaid") {
              // Filter for unpaid invoices
              return (
                Number(object.Total_BeforeTax) +
                  Number(object.Total_Tax) +
                  Number(object.Shipping_Charges) -
                  object.Amount_Paid >
                0
              );
            }
          } else if (field === "Document_No") {
            return object[field].includes(filterValues[field]);
          } else {
            return object[field] === filterValues[field];
          }
        });
      })
      .map((obj) => {
        return {
          "Client Name": obj.Client,
          "Invoice No": obj.Document_No,
          "Issue Date": obj.Issue_Date,
          "Due Date": obj.Due_Date,
          Total: (
            Number(obj.Total_BeforeTax) +
            Number(obj.Total_Tax) +
            Number(obj.Shipping_Charges)
          ).toFixed(2),
          Status:
            Number(obj.Total_BeforeTax) +
              Number(obj.Total_Tax) +
              Number(obj.Shipping_Charges) -
              obj.Amount_Paid <=
            0 ? (
              <p style={{ color: "green" }}>Paid</p>
            ) : (
              <p style={{ color: "orangered" }}>Unpaid</p>
            ),
          "Amount Paid": obj.Amount_Paid,
          Balance: (
            Number(obj.Total_BeforeTax) +
            Number(obj.Total_Tax) +
            Number(obj.Shipping_Charges) -
            obj.Amount_Paid
          ).toFixed(2),
          "Date of payment": obj.Date_of_payment,
          Type: obj.Transaction_type,
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

  useEffect(() => {
    let rowData = paymentDetails
      .flat()
      .filter((object) => object.Client === filterValues.Client)
      .map((obj) => {
        let combinedBill = obj.rowData.reduce((total, item) => {
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
        };
      });
    setPaymentRows(rowData);
  }, [filterValues.Client]);

  const nonEmptyFields = nonEmptyValues();

  const handleDeleteInvoice = async (obj) => {
    const res = await ipcRenderer.invoke(
      "delete-invoice-by-Document-no",
      obj.Document_No
    );
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
      const response = await ipcRenderer.invoke(
        "export-invoices-to-excel",
        nonEmptyFields.length === 0
          ? removeStatusField(filteredArray)
          : removeStatusField(filterData)
      );
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "export_invoices.xlsx");
        alert("yo");
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
              <Invoice
                data={selectedRow.rowData.flat()}
                details={{
                  Client: selectedRow.Client,
                  Issue_Date: selectedRow.Issue_Date,
                  Document_No: selectedRow.Document_No,
                  Ship_To: selectedRow.Ship_To,
                  PO_Number: selectedRow.PO_Number,
                  PO_Date: selectedRow.PO_Date,
                  Due_Date: selectedRow.Due_Date,
                  Payment_Term: selectedRow.Payment_Term,
                  Place_Of_Supply: selectedRow.Place_Of_Supply,
                  Notes: selectedRow.Notes,
                  Shipping_Charges: Number(selectedRow.Shipping_Charges),
                  Shipping_Tax: selectedRow.Shipping_Tax || 0,
                  Discount_on_all: selectedRow.Discount_on_all,
                  Total_BeforeTax: selectedRow.Total_BeforeTax,
                  Total_Tax: selectedRow.Total_Tax,
                  Type: "INVOICE",
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

  let totalAmountPaid = paymentRows.reduce((total, obj) => {
    console.log(obj);
    let paymentAmount = isNaN(obj["Amount Used"])
      ? 0
      : Number(obj["Amount Used"]);
    return total + paymentAmount;
  }, 0);

  console.log(totalAmountPaid);

  let combinedBill = paymentRows.reduce((total, item) => {
    // Convert 'Amount Due' to a number and add it to the total
    return total + parseFloat(item["Amount Payment"]);
  }, 0);

  console.log(combinedBill);

  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 p-3 mb-3">
      <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Search Data</Typography>
            <HomeButton />
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
                handleFilterChange(
                  "Client",
                  getTextForValue(client_option, values.select)
                );
              }}
            />
          </div>

          <div className="flex mr-12 gap-x-2">
            <Input
              variant="outlined"
              label="Issue From"
              placeholder="Issue From"
              type="date"
              value={filterValues.Issue_From}
              onChange={(e) => handleFilterChange("Issue_From", e.target.value)}
            />

            <Input
              variant="outlined"
              label="Issue To "
              placeholder="Issue To"
              type="date"
              value={filterValues.Issue_To}
              onChange={(e) => handleFilterChange("Issue_To", e.target.value)}
            />
          </div>
          <div className="flex mr-12 gap-x-2">
            <Input
              variant="outlined"
              label="Due Date"
              placeholder="Due to"
              type="date"
              onChange={(e) => handleFilterChange("Due_Date", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-between my-2">
          <div className="mr-12">
            <SelectComp
              label="Status"
              options={status_options}
              isinput={false}
              handle={(values) => {
                handleFilterChange("Status", values.select);
              }}
            />
          </div>
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
              label="Type"
              options={payemnt_options}
              isinput={false}
              handle={(values) => {
                handleFilterChange(
                  "Transaction_type",
                  getTextForValue(payemnt_options, values.select)
                );
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
      </div>
      <div className="flex flex-1 mb-2">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD}
          TABLE_ROWS={nonEmptyFields.length === 0 ? filteredArray : filterData}
        />
      </div>
      {renderInvoicePreview()}
      {paymentRows.length > 0 ? (
        <>
          <div className="my-2 flex-1">
            <Typography variant="h6">Payment Details</Typography>
            <hr />
          </div>
          <div className="flex flex-1 mb-2">
            <ProductInvoiceTable
              TABLE_HEAD={TABLE_HEAD_SECOND}
              TABLE_ROWS={paymentRows}
            />
          </div>

          <div className="py-2 self-end" style={{ marginRight: 40 }}>
            <div style={{ textAlign: "left", marginRight: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "250px" }}>Total Pending:</div>
                <div style={{ textAlign: "right" }}>{combinedBill}</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "250px" }}>Amount Received:</div>
                <div style={{ textAlign: "right" }}>{totalAmountPaid}</div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "250px" }}>Amount in excess:</div>
                <div style={{ textAlign: "right" }}>
                  {totalAmountPaid > combinedBill
                    ? totalAmountPaid - combinedBill
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
       <div className="flex flex-1 mb-2">
            <ProductInvoiceTable
              TABLE_HEAD={TABLE_HEAD_THREE}
              TABLE_ROWS={[]}
            />
          </div>
    </div>
  );
}