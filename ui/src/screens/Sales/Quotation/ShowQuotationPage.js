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
import { ProductInvoiceTable } from "../components/ProductInvoiceTable";
import SelectComp from "../components/SelectComp";
import { api_new_quotation } from "../../../utils/PageApi";
import {
  get_all_client_option,
  get_all_quotation,
  get_company_details,
} from "../../../utils/SelectOptions";
import { saveAs } from "file-saver";
import Invoice from "../components/Invoice";
import { PDFViewer } from "@react-pdf/renderer";
import HomeButton from "../../../assets/Buttons/HomeButton";
import ReportsDropDown from "../../../assets/DropDown/ReportDropDown";
import { useNavigate } from "react-router-dom";

const TABLE_HEAD = [
  "No",
  "Client Name",
  "Quotation No",
  "Issue Date",
  "Valid Until",
  "Amount",
  "Tax",
  "Shipping",
  "Total",
  "Private Notes",
  "Invoiced",
  "Type",
  "Action",
];

const select_option = [];
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

let invoices = await get_all_quotation();
let companyDetails = await get_company_details();
let client_option = await get_all_client_option();

export default function ShowQuotationPage() {
  useEffect(() => {
    document.title = "Show Quotation";
  });

  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    Quotation_No: "",
    Transaction_type: "",
    Amount_Paid: "",
    Date_of_payment: "",
  });
  const [filterValues, setFilterValues] = useState({
    Client: "",
    Status: "",
    Issue_From: "",
    Issue_To: "",
    Quotation_No: "",
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
  const handleInputChange = (fieldName, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };
  const handleFilterChange = (fieldName, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleQuotationChange = async (rowData) => {
    const res = await window.api.invoke(
      "create-invoice-from-quotation",
      rowData.Quotation_No,
    );
  };

  let filteredArray = invoices.flat().map((obj) => {
    const dueDate = new Date(obj.Due_Date);
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours to 0 for accurate comparison
    const colorStyle = dueDate < today ? { color: "red" } : {};
    return {
      "Client Name": obj.Client,
      "Quotation No": obj.Quotation_No,
      "Issue Date": obj.Issue_Date,
      "Valid Until": obj.Due_Date,
      Amount: obj.Total_BeforeTax,
      Tax: obj.Total_Tax,
      "Shipping Cost": obj.Shipping_Charges,
      Total: (
        Number(obj.Total_BeforeTax) +
        Number(obj.Total_Tax) +
        Number(obj.Shipping_Charges)
      ).toFixed(2),
      "Private Notes": obj.Private_Notes,
      Invoiced: obj.Invoiced === "1" ? "Yes" : "No",

      Type: "Quotation",
      ActionButton: (
        <>
          {" "}
          <Tooltip content="Convert Quotation to Invoice">
            <Button
              size="xs"
              className="py-1 px-2"
              style={{ background: "none" }}
              onClick={() => handleQuotationChange(obj)}
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
                  d="M7 11c.889-.086 1.416-.543 2.156-1.057a22.323 22.323 0 0 0 3.958-5.084 1.6 1.6 0 0 1 .582-.628 1.549 1.549 0 0 1 1.466-.087c.205.095.388.233.537.406a1.64 1.64 0 0 1 .384 1.279l-1.388 4.114M7 11H4v6.5A1.5 1.5 0 0 0 5.5 19v0A1.5 1.5 0 0 0 7 17.5V11Zm6.5-1h4.915c.286 0 .372.014.626.15.254.135.472.332.637.572a1.874 1.874 0 0 1 .215 1.673l-2.098 6.4C17.538 19.52 17.368 20 16.12 20c-2.303 0-4.79-.943-6.67-1.475"
                />
              </svg>
            </Button>
          </Tooltip>
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
              onClick={() => handleDeleteQuotation(obj)}
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
          } else if (field === "Quotation_No") {
            return object[field].includes(filterValues[field]);
          } else {
            return object[field] === filterValues[field];
          }
        });
      })
      .map((obj) => {
        return {
          "Client Name": obj.Client,
          "Quotation No": obj.Quotation_No,
          "Issue Date": obj.Issue_Date,
          "Valid Until": obj.Due_Date,
          Amount: obj.Total_BeforeTax,
          Tax: obj.Total_Tax,
          "Shipping Cost": obj.Shipping_Charges,
          Total: (
            Number(obj.Total_BeforeTax) +
            Number(obj.Total_Tax) +
            Number(obj.Shipping_Charges)
          ).toFixed(2),
          "Private Notes": obj.Private_Notes,
          Invoiced: obj.Invoiced === "1" ? "Yes" : "No",
          Type: "Quotation",
          ActionButton: (
            <>
              <Tooltip content="Convert Quotation to Invoice">
                <Button
                  size="xs"
                  className="py-1 px-2"
                  style={{ background: "none" }}
                  onClick={() => handleQuotationChange(obj)}
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
                      d="M7 11c.889-.086 1.416-.543 2.156-1.057a22.323 22.323 0 0 0 3.958-5.084 1.6 1.6 0 0 1 .582-.628 1.549 1.549 0 0 1 1.466-.087c.205.095.388.233.537.406a1.64 1.64 0 0 1 .384 1.279l-1.388 4.114M7 11H4v6.5A1.5 1.5 0 0 0 5.5 19v0A1.5 1.5 0 0 0 7 17.5V11Zm6.5-1h4.915c.286 0 .372.014.626.15.254.135.472.332.637.572a1.874 1.874 0 0 1 .215 1.673l-2.098 6.4C17.538 19.52 17.368 20 16.12 20c-2.303 0-4.79-.943-6.67-1.475"
                    />
                  </svg>
                </Button>
              </Tooltip>
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
                  onClick={() => handleDeleteQuotation(obj)}
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
  function getDocumentNoAtIndex(index) {
    if (index >= 0 && index < filteredArray.flat().length) {
      return filteredArray.flat()[index]["Quotation No"];
    } else {
      return "Invalid index";
    }
  }
  const handleDeleteQuotation = async (obj) => {
    const res = await window.api.invoke(
      "delete-quotation-by-quotation-no",
      obj.Quotation_No,
    );
  };
  const AmountPaidHandler = async (e, doc_no) => {
    handleInputChange("Amount_Paid", e.target.value);
    handleInputChange("Quotation_No", doc_no);
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
        "export-quotation-to-excel",
        nonEmptyFields.length === 0
          ? removeStatusField(filteredArray)
          : removeStatusField(filterData),
      );
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "export_quotations.xlsx");
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
                  Quotation_No: selectedRow.Quotation_No,
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
                  Type: "QUOTATION",
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
            <Typography variant="h6">Search Quotation</Typography>
            <HomeButton />
            <ReportsDropDown />
          </div>
          <hr />
        </div>
        <div
          className="flex flex-row w-full my-2"
          style={{ justifyContent: "center" }}
        >
          <div className="mr-12">
            <SelectComp
              label="Client"
              options={client_option}
              isinput={false}
              handle={(values) => {
                if ((values = "Add New Client")) {
                  navigate("/sales/client/show");
                } else {
                  handleFilterChange("Client", values);
                }
              }}
            />
          </div>
          <div className=" mr-12">
            <Input
              variant="outlined"
              label="Quotation Number"
              placeholder="Quotation Number"
              onChange={(e) =>
                handleFilterChange("Quotation_No", e.target.value)
              }
            />
          </div>

          <div className="flex mr-12 gap-x-2">
            <Input
              variant="outlined"
              label="Issue From"
              placeholder="Issue From"
              type="date"
              onChange={(e) => handleFilterChange("Issue_From", e.target.value)}
            />

            <Input
              variant="outlined"
              label="Issue To "
              placeholder="Issue To"
              type="date"
              onChange={(e) => handleFilterChange("Issue_To", e.target.value)}
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "orangered",
        }}
      >
        *Quotation in red have expired or will expire today.
      </div>
      <div className="flex my-2 flex-row-reverse">
        <div className="mx-3">
          <Button onClick={exportInvoicesToExcel}>Export</Button>
        </div>
        <div className="mx-3">
          <Button onClick={() => navigate("/sales/quotation/new")}>
            New Quotation
          </Button>
        </div>
      </div>

      <div className="flex flex-1 mb-2">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD}
          TABLE_ROWS={nonEmptyFields.length === 0 ? filteredArray : filterData}
        />
      </div>
      {renderInvoicePreview()}
    </div>
  );
}
