import {
  Button,
  Select,
  Textarea,
  Typography,
  Option,
  Input,
  Checkbox,
} from "@material-tailwind/react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { ProductInvoiceTable } from "../components/ProductInvoiceTable";
import SelectComp from "../components/SelectComp";
import {
  get_all_client_option,
  get_all_product_option,
  tax_type,
  uom_type,
  get_all_invoices,
  get_company_details,
} from "../../../utils/SelectOptions";
import { api_show_client, api_show_product } from "../../../utils/PageApi";
import PaymentReceipt from "../components/Receipts/PaymentReceipt";
import { PDFViewer } from "@react-pdf/renderer";
import HomeButton from "../../../assets/Buttons/HomeButton";
import BackButton from "../../../assets/Buttons/BackButton";
import { showmessage } from "../../../utils/api";

const TABLE_HEAD = [
  "No",
  "Document Number",
  "Document Date",
  "Document Amount",
  "Amount Due",
  "Payment Amount",
  "Action",
];

const payment_type = ["Received", "Made", "Advance Payment"];
const payment_options = ["Cash", "Cheque", "Bank Transfer"];

let client_option = await get_all_client_option();
client_option.shift();
let product_option = await get_all_product_option();
let companyDetails = await get_company_details();
let invoices = await get_all_invoices();
export default function NewPaymentPage() {
  useEffect(() => {
    document.title = "New Payment Document";
  });

  const initialValues = {
    Client: "",
    Document_No: "",
    Pay_Date: "",
    Bank_Charges: "",
    Payment_Type: "",
    Payment_Mode: "",
    Amount_Received: 0,
  };
  const [formData, setFormData] = useState(initialValues);
  const [allClient, setAllClient] = useState([]);

  useEffect(() => {
    getAllClients();
  }, []);

  function getTextForValue(option, value) {
    const clients = option;
    const client = clients.find((client) => client.value === value);
    return client ? client.text : "Unknown";
  }

  const getAllClients = async () => {
    let page = 1;
    let limit = 50;
    let res = await window.api.invoke("get-all-clients-list", {
      page,
      limit,
    });
    setAllClient(res.data);
  };

  function convertDropdownData(data) {
    return data.map((item) => ({
      text: item,
      value: item,
    }));
  }

  const handleFieldChange = (fieldName, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);

  const openInvoicePreviewWindow = () => {
    setIsInvoicePreviewOpen(true);
  };

  const closeInvoicePreviewWindow = () => {
    setIsInvoicePreviewOpen(false);
  };

  const renderInvoicePreview = () => {
    const handleSave = async () => {
      const paymentReceiptData = {
        rowData: filteredArray,
        Client: formData.Client,
        Document_Date: new Date().toISOString().split("T")[0],
        Document_No: formData.Document_No,
        Pay_Date: formData.Pay_Date,
        Bank_Charges: formData.Bank_Charges,
        Payment_Type: formData.Payment_Type,
        Payment_Mode: formData.Payment_Mode,
        Amount_Received: formData.Amount_Received,
      };

      const res = await window.api.invoke(
        "add-new-payment-data",
        paymentReceiptData,
      );
      showmessage(res.message); // Handle the response as needed
    };

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
                  background: "#7D73736C",
                  border: "1px solid",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  position: "absolute",
                }}
                onClick={handleSave}
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
                    d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                  />
                </svg>
                Save
              </button>
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
                tableData={filteredArray}
                details={{
                  Client: formData.Client,
                  Issue_Date: formData.Issue_Date,
                  Document_No: formData.Document_No,
                  Pay_Date: formData.Pay_Date,
                  Bank_Charges: formData.Bank_Charges,
                  Payment_Type: formData.Payment_Type,
                  Payment_Mode: formData.Payment_Mode,
                  Amount_Received: formData.Amount_Received,
                  Type: "PAYMENT NOTE",
                  companyDetails: companyDetails.data[0],
                }}
              />
            </PDFViewer>
          </div>
        </div>
      );
    }
  };

  const generateFieldValue = () => {
    const today = new Date();
    const day = ("0" + today.getDate()).slice(-2); // Get day with leading zero if needed
    const hours = ("0" + today.getHours()).slice(-2); // Get hours with leading zero if needed
    const minutes = ("0" + today.getMinutes()).slice(-2); // Get minutes with leading zero if needed
    const monthAbbreviation = today
      .toLocaleString("default", { month: "short" })
      .toUpperCase(); // Get month abbreviation

    const generatedValue = `PAY${day}${monthAbbreviation}-${hours}${minutes}`;

    handleFieldChange("Document_No", generatedValue);
  };

  useEffect(() => {
    generateFieldValue();
  }, []);

  let filteredArray = invoices
    .flat()
    .filter((x) => x.Client === formData.Client)
    .map((obj) => {
      // Calculate the document amount
      const documentAmount = (
        Number(obj.Total_BeforeTax) +
        Number(obj.Total_Tax) +
        Number(obj.Shipping_Charges)
      ).toFixed(2);

      // Calculate the amount due
      let amountDue = (
        Number(obj.Total_BeforeTax) +
        Number(obj.Total_Tax) +
        Number(obj.Shipping_Charges) -
        obj.Amount_Paid
      ).toFixed(2);

      // Check if amount due is NaN or null
      if (isNaN(amountDue) || amountDue === null) {
        amountDue = "0.00";
      }

      // Check if payment amount is NaN or null
      const paymentAmount =
        isNaN(obj.Amount_Paid) || obj.Amount_Paid === null
          ? "0.00"
          : obj.Amount_Paid;

      return {
        "Document Number": obj.Document_No,
        "Document Date": obj.Issue_Date,
        "Document Amount": documentAmount,
        "Amount Due": amountDue,
        "Payment Amount": paymentAmount,
      };
    });

  let totalAmountPaid = filteredArray.reduce((total, obj) => {
    let paymentAmount = isNaN(obj["Payment Amount"])
      ? 0
      : Number(obj["Payment Amount"]);
    return total + paymentAmount;
  }, 0);

  let combinedBill = filteredArray.reduce((total, item) => {
    // Convert 'Amount Due' to a number and add it to the total
    return total + parseFloat(item["Amount Due"]);
  }, 0);

  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 p-3 mb-3">
        <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Add New Payment</Typography>
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
                handleFieldChange("Client", values);
              }}
            />
          </div>

          <div className="flex mr-12 gap-x-2">
            <Input
              variant="outlined"
              label="Pay Date"
              placeholder="Pay Date"
              type="date"
              onChange={(e) => handleFieldChange("Pay_Date", e.target.value)}
            />
          </div>
          <div className="flex mr-12 gap-x-2">
            <Input
              variant="outlined"
              label="Bank Charges"
              placeholder="Bank Charges"
              onChange={(e) =>
                handleFieldChange("Bank_Charges", e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-between my-2">
          <div className="mr-12">
            <SelectComp
              label="Payment Type"
              options={convertDropdownData(payment_type)}
              isinput={false}
              handle={(values) => {
                handleFieldChange("Payment_Type", values);
              }}
            />
          </div>

          <div className=" mr-12">
            <Input
              variant="outlined"
              label="Amount"
              placeholder="Amount"
              type="number"
              onChange={(e) =>
                handleFieldChange("Amount_Received", e.target.value)
              }
            />
          </div>

          <div className="mr-12">
            <SelectComp
              label="Payment Mode"
              options={convertDropdownData(payment_options)}
              isinput={false}
              handle={(values) => {
                handleFieldChange("Payment_Mode", values);
              }}
            />
          </div>
        </div>
      </div>
      <hr />

      <div className="py-2 self-end" style={{ marginRight: 40 }}>
        <div style={{ textAlign: "left", marginRight: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "250px" }}>Amount Received:</div>
            <div style={{ textAlign: "right" }}>{totalAmountPaid}</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "250px" }}>Amount Pending:</div>
            <div style={{ textAlign: "right" }}>{combinedBill}</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "250px" }}>Amount Used For Payment:</div>
            <div style={{ textAlign: "right" }}>{formData.Amount_Received}</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "250px" }}>Amount in excess:</div>
            <div style={{ textAlign: "right" }}>
              {formData.Amount_Received > combinedBill
                ? formData.Amount_Received - combinedBill
                : 0}
            </div>
          </div>
        </div>
        <Button
          onClick={openInvoicePreviewWindow}
          disabled={
            formData.Amount_Received === "" ||
            formData.Amount_Received === 0 ||
            formData.Client === ""
          }
          style={{ width: "200px", marginTop: 40 }}
        >
          Preview Document{" "}
        </Button>
      </div>
      {renderInvoicePreview()}
    </div>
  );
}
