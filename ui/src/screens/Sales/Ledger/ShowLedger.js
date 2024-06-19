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

const TABLE_HEAD_THREE = [
  "No",
  "Date",
  "Type",
  "Client",
  "Document No",
  <p style={{ color: "green" }}>{"Credit (+)"}</p>,
  <p style={{ color: "red" }}>{"Debit (-)"}</p>,
];

let invoices = await get_all_invoices();
let companyDetails = await get_company_details();
let client_option = await get_all_client_option();
client_option.shift();
let paymentDetails = await get_all_payment_details();

export default function ShowLedgerPage() {
  useEffect(() => {
    document.title = "Show Ledger";
  });

  const [filterValues, setFilterValues] = useState({
    Client: "",
    Issue_From: "",
    Issue_To: "",
    Document_No: "",
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

  function extractInvoiceData(invoices) {
    return invoices.map((item) => ({
      Client: item.Client,
      "Document No": item.Document_No,
      Date: item.Issue_Date,
      Type: "Invoice",
      "Credit (+)": 0,
      "Debit (-)":
        item.Shipping_Charges + item.Total_BeforeTax + item.Total_Tax,
    }));
  }

  function extractPaymentData(payments) {
    return payments.map((item) => ({
      Client: item.Client,
      "Document No": item.Document_No,
      Date: item.Pay_Date ? item.Pay_Date : item.Document_Date,
      Type: "Payment",
      "Credit (+)": item.Amount_Received,
      "Debit (-)": 0,
    }));
  }

  let mergedArray = [
    ...extractInvoiceData(invoices.flat()),
    ...extractPaymentData(paymentDetails.flat()),
  ];

  const [filterData, setFilterData] = useState([]);
  const nonEmptyValues = () => {
    return Object.keys(filterValues).filter((key) => filterValues[key] !== "");
  };

  useEffect(() => {
    let rowData = mergedArray
      .filter((object) => object.Client === filterValues.Client)
      .map((item) => {
        return {
          Date: item.Date,
          Type: item.Type,
          Client: item.Client,
          "Document No": item["Document No"],
          "Credit (+)": item["Credit (+)"],
          "Debit (-)": item["Debit (-)"],
        };
      });
    const { creditSum, debitSum } = calculateSum(rowData);

    const totalRow = {
      Date: "",
      Type: "",
      Client: "",
      "Document No": (
        <p style={{ fontWeight: 700, fontSize: "medium" }}>{"Total"}</p>
      ),
      "Credit (+)": creditSum,
      "Debit (-)": debitSum,
    };
    rowData.push(totalRow);

    setPaymentRows(rowData);
  }, [filterValues.Client]);

  function calculateSum(data) {
    let creditSum = 0;
    let debitSum = 0;

    data.forEach((item) => {
      creditSum += item["Credit (+)"];
      debitSum -= item["Debit (-)"];
    });

    const totalSum = creditSum + debitSum;

    // Determine the sign for totalSum
    const totalSumSign = totalSum === 0 ? "" : totalSum > 0 ? "+" : "-";

    return {
      creditSum,
      debitSum,
      totalSum: `${totalSumSign}${Math.abs(totalSum)}`,
    };
  }

  function calculateSumExceptLastRow(data) {
    let creditSum = 0;
    let debitSum = 0;

    // Iterate through the data except for the last object
    for (let i = 0; i < data.length - 1; i++) {
      creditSum += data[i]["Credit (+)"];
      debitSum -= data[i]["Debit (-)"];
    }

    const totalSum = creditSum + debitSum;

    // Determine the sign for totalSum
    const totalSumSign = totalSum === 0 ? "" : totalSum > 0 ? "+" : "-";

    return {
      creditSum,
      debitSum,
      totalSum: `${totalSumSign}${Math.abs(totalSum)}`,
    };
  }

  const nonEmptyFields = nonEmptyValues();

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
        "export-ledger-to-excel",
        nonEmptyFields.length === 0
          ? paymentRows.filter((x) => x.Date !== "")
          : paymentRows.filter((x) => x.Date !== ""),
      );
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "export_ledger.xlsx");
      } else {
        //console.error("Error:", response?.error);
      }
      //console.log("Export response:", response);
    } catch (error) {
      //console.error("Export error:", error);
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
                handleFilterChange("Client", values);
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
      <div
        className="flex justify-center items-center"
        style={{ height: "25px", marginBottom: 10 }}
      >
        <h1 className="text-2xl">{`Total Outstanding: ${
          calculateSumExceptLastRow(paymentRows).totalSum
        }`}</h1>
      </div>

      <div className="flex flex-1 mb-2">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD_THREE}
          TABLE_ROWS={paymentRows}
        />
      </div>
    </div>
  );
}
