import {
  Button,
  Select,
  Textarea,
  Typography,
  Option,
  Input,
  Checkbox,
} from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { ProductInvoiceTable } from "../components/ProductInvoiceTable";
import SelectComp from "../components/SelectComp";
import {
  get_all_product_option,
  tax_type,
  uom_type,
  get_all_vendor_option,
  get_company_details,
} from "../../../utils/SelectOptions";
import { api_show_vendor, api_show_product } from "../../../utils/PageApi";
import Invoice from "../components/Invoice";
import { PDFViewer } from "@react-pdf/renderer";
import HomeButton from "../../../assets/Buttons/HomeButton";
import BackButton from "../../../assets/Buttons/BackButton";
import ModuleDropDown from "../../../assets/DropDown/ModuleDropDown";
import { useNavigate } from "react-router-dom";

const TABLE_HEAD = [
  "No",
  "Product Service",
  "HSNSAC",
  "Description",
  "UoM",
  "Qty",
  "Unit Price",
  "Value",
  "Discount",
  "CGST",
  "SGST",
  "IGST",
  "Action",
];

const vendor_option = await get_all_vendor_option();
let product_option = await get_all_product_option();
let companyDetails = await get_company_details();
let tax_option = tax_type();
let uom_option = uom_type();
export default function NewPurchasePage() {
  useEffect(() => {
    document.title = "New Purchase Order";
  });

  const populateDropdown = (data) => {
    return data.map((item) => ({
      text: item,
      value: item,
    }));
  };

  const initialValues = {
    Vendor: "",
    Document_No: "",
    Issue_Date: new Date().toISOString().split("T")[0],
    Project: "",
    Payment_Term: "15 days",
    Discount: "",
    Due_Date: "",
    Place_Of_Supply: "",
    Product: "",
    Description: "",
    UoM: "",
    Qty: "",
    Unit_Price: "",
    Tax: "GST Rate 0%",
    Notes: "",
    Private_Notes: "",
    Shipping_Charges: 0,
    Shipping_Tax: 0,
    Total_BeforeTax: 0,
    Total_Tax: 0,
  };
  const [formData, setFormData] = useState(initialValues);
  const navigate = useNavigate();
  useEffect(() => {
    // Convert the issue date to a Date object
    const issueDate = new Date(formData.Issue_Date);

    // Extract the number of days from the Payment_Term string
    const paymentTermParts = formData.Payment_Term.split(" ");
    const daysToAdd = parseInt(paymentTermParts[0]);

    // Check if daysToAdd is a valid number
    if (isNaN(daysToAdd)) {
      // Handle invalid payment term
      console.error("Invalid Payment_Term:", formData.Payment_Term);
      return;
    }

    // Check if issueDate is a valid date
    if (isNaN(issueDate.getTime())) {
      // Handle invalid issue date
      console.error("Invalid Issue_Date:", formData.Issue_Date);
      return;
    }

    // Calculate the due date by adding days to the issue date
    const dueDate = new Date(
      issueDate.setDate(issueDate.getDate() + daysToAdd),
    );

    // Check if dueDate is a valid date
    if (isNaN(dueDate.getTime())) {
      // Handle invalid due date
      return;
    }

    // Format the due date as YYYY-MM-DD
    const formattedDueDate = dueDate.toISOString().split("T")[0];

    // Update the formData state with the calculated due date
    setFormData((prevFormData) => ({
      ...prevFormData,
      Due_Date: formattedDueDate,
    }));
  }, [formData.Issue_Date, formData.Payment_Term]);

  const [rows, setRows] = useState([]);
  const [discountOnAll, setDiscountOnAll] = useState(false);
  const [discountValue, setDiscountValue] = useState(-1);
  const handleDiscountInputChange = (e) => {
    setDiscountValue(e.target.value);
    updateRowsWithDiscount(e.target.value);
  };
  const [shippingChecked, setShippingChecked] = useState(false);
  const [allClient, setAllClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);

  useEffect(() => {
    getAllClients();
  }, []);

  useEffect(() => {
    setSelectedClient(
      allClient.filter((x) => x.client_name === formData.Vendor),
    );
  }, [formData.Vendor]);

  const getAllClients = async () => {
    let page = 1;
    let limit = 50;
    let res = await window.api.invoke("get-all-clients-list", {
      page,
      limit,
    });
    setAllClient(res.data);
  };

  useEffect(() => {
    if (formData.Vendor.length > 1) {
      handleFieldChange("Place_Of_Supply", selectedClient[0]?.state);
    }
  }, [selectedClient]);

  const updateRowsWithDiscount = (discount) => {
    const updatedRows = rows.map((item) => {
      const discountPercentage = parseFloat(discount) || 0;
      const discountedUnitPrice =
        parseFloat(item.UnitPrice) * (1 - discountPercentage / 100);
      const discountedValue = discountedUnitPrice * parseFloat(item.Qty);
      const cgst = discountedValue * 0.09;
      const sgst = discountedValue * 0.1;
      const igst = discountedValue * 0.11;

      return {
        ...item,
        Discount: discount ? `${discount}%` : 0, // Update Discount field
        Value: discountedValue.toFixed(2),
        CGST: cgst.toFixed(2),
        SGST: sgst.toFixed(2),
        IGST: igst.toFixed(2),
      };
    });

    setRows(updatedRows);
  };
  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };
  function getIntegerFromPercentageString(percentageString) {
    // Using a regular expression to extract the integer before '%'
    const match = percentageString.match(/\d+/);

    // Checking if a match is found
    if (match) {
      // Extracting the matched integer and converting it to a number
      const integer = parseInt(match[0], 10);
      return integer;
    }

    // If no match is found, return NaN or any other default value as needed
    return NaN;
  }

  const rowData = rows.map((item, index) => ({
    Product: item.Product,
    HSNSAC: "HSN-" + item.Product.substring(0, 3),
    Description: item.Description || "Sample Service Description",
    UoM: item.UoM || "Boxes",
    Qty: item.Qty ? item.Qty : "1",
    UnitPrice: item.Unit_Price ? item.Unit_Price : "1.00",
    Value:
      item.Discount === ""
        ? (item.Unit_Price * (item.Qty || 1)).toFixed(2)
        : (
            item.Unit_Price *
            (item.Qty || 1) *
            (1 - parseFloat(item.Discount) / 100)
          ).toFixed(2),
    Discount:
      discountValue !== -1
        ? discountValue + "%"
        : item.Discount
          ? item.Discount + "%"
          : "0%",
    CGST: (
      (((item.Discount === ""
        ? item.Unit_Price * (item.Qty || 1)
        : item.Unit_Price *
          (item.Qty || 1) *
          (1 - parseFloat(item.Discount) / 100)) /
        100) *
        getIntegerFromPercentageString(item.Tax)) /
      2
    ).toFixed(2),
    SGST: (
      (((item.Discount === ""
        ? item.Unit_Price * (item.Qty || 1)
        : item.Unit_Price *
          (item.Qty || 1) *
          (1 - parseFloat(item.Discount) / 100)) /
        100) *
        getIntegerFromPercentageString(item.Tax)) /
      2
    ).toFixed(2),
    IGST:
      companyDetails.data[0].state === formData.Place_Of_Supply
        ? 0
        : (
            ((item.Discount === ""
              ? item.Unit_Price * (item.Qty || 1)
              : item.Unit_Price *
                (item.Qty || 1) *
                (1 - parseFloat(item.Discount) / 100)) /
              100) *
            9
          ).toFixed(2),
    Action: "DELETE",
  }));

  // Calculate total value
  const totalValue = rowData
    .reduce((accumulator, currentItem) => {
      const value = parseFloat(currentItem.Value);
      return accumulator + value;
    }, 0)
    .toFixed(2);

  const totalTax = rowData
    .reduce((accumulator, currentItem) => {
      const cgst = parseFloat(currentItem.CGST);
      const sgst = parseFloat(currentItem.SGST);
      const igst = parseFloat(currentItem.IGST);

      return accumulator + cgst + sgst + igst;
    }, 0)
    .toFixed(2);

  const handleFieldChange = (fieldName, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };
  function getTextForValue(option, value) {
    const clients = option;
    const client = clients.find((client) => client.value === value);
    return client ? client.text : "Unknown";
  }
  const getProductDescription = (productText, data) => {
    const product = data.find((item) => item.text === productText);
    return product ? product.description : null;
  };
  const getProductUOM = (productText, data) => {
    const product = data.find((item) => item.text === productText);
    return product ? product.uom : null;
  };
  const getProductPurchasePrice = (productText, data) => {
    const product = data.find((item) => item.text === productText);
    return product ? product.purchase_price : null;
  };
  const getProductTax = (productText, data) => {
    const product = data.find((item) => item.text === productText);
    return product ? product.tax : null;
  };
  const generateFieldValue = () => {
    const today = new Date();
    const day = ("0" + today.getDate()).slice(-2); // Get day with leading zero if needed
    const hours = ("0" + today.getHours()).slice(-2); // Get hours with leading zero if needed
    const minutes = ("0" + today.getMinutes()).slice(-2); // Get minutes with leading zero if needed
    const monthAbbreviation = today
      .toLocaleString("default", { month: "short" })
      .toUpperCase(); // Get month abbreviation

    const generatedValue = `PUR-${day}${monthAbbreviation}-${hours}${minutes}`;

    handleFieldChange("Document_No", generatedValue);
  };

  useEffect(() => {
    generateFieldValue();
  }, []);
  useEffect(() => {
    if (!shippingChecked) {
      handleFieldChange("Shipping_Charges", 0);
      handleFieldChange("Shipping_Tax", 0);
    }
  }, [shippingChecked]);
  useEffect(() => {
    if (!discountOnAll) {
      setDiscountValue(-1);
      updateRowsWithDiscount(0); // Use false instead of 0
    }
  }, [discountOnAll]);

  useEffect(() => {
    handleFieldChange("Total_BeforeTax", totalValue);
    handleFieldChange("Total_Tax", totalTax);
  }, [totalValue]);

  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);

  const openInvoicePreviewWindow = () => {
    setIsInvoicePreviewOpen(true);
  };

  const closeInvoicePreviewWindow = () => {
    setIsInvoicePreviewOpen(false);
  };

  const renderInvoicePreview = () => {
    const handleSave = async () => {
      const invoiceData = {
        rowData: rowData,
        Vendor: formData.Vendor,
        Document_No: formData.Document_No,
        Issue_Date: formData.Issue_Date,
        Project: formData.Project,
        Payment_Term: formData.Payment_Term,
        Due_Date: formData.Due_Date,
        Place_Of_Supply: formData.Place_Of_Supply,
        Notes: formData.Notes,
        Private_Notes: formData.Private_Notes,
        Shipping_Charges:
          Number(formData.Shipping_Charges) +
          Number((formData.Shipping_Charges / 100) * formData.Shipping_Tax),
        Discount_on_all: formData.Discount_on_all,
        Total_BeforeTax: formData.Total_BeforeTax,
        Total_Tax: formData.Total_Tax,
      };
      const res = await window.api.invoke(
        "add-new-purchase-order",
        invoiceData,
      );
      alert(res.message); // Handle the response as needed
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
              <Invoice
                data={rowData.flat()}
                details={{
                  Client: formData.Vendor,
                  Issue_Date: formData.Issue_Date,
                  Document_No: formData.Document_No,
                  Ship_To: formData.Ship_To,
                  PO_Number: formData.PO_Number,
                  PO_Date: formData.PO_Date,
                  Due_Date: formData.Due_Date,
                  Payment_Term: formData.Payment_Term,
                  Place_Of_Supply: formData.Place_Of_Supply,
                  Notes: formData.Notes,
                  Shipping_Charges:
                    Number(formData.Shipping_Charges) +
                    Number(
                      (formData.Shipping_Charges / 100) * formData.Shipping_Tax,
                    ),
                  Shipping_Tax: formData.Shipping_Tax,
                  Discount_on_all: formData.Discount_on_all,
                  Total_BeforeTax: formData.Total_BeforeTax,
                  Total_Tax: formData.Total_Tax,
                  Type: "PURCHASE ORDER",
                  companyDetails: companyDetails.data[0],
                }}
              />
            </PDFViewer>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col w-full h-full px-1">
      <div className="flex flex-col border border-gray-400 p-1 mb-1">
        <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Add New Purchase Order</Typography>
            <HomeButton />
          </div>
          <hr />
        </div>
        <div className="flex flex-row w-full justify-between my-2">
          <div className=" mr-12">
            <SelectComp
              label="Vendor"
              options={vendor_option}
              isinput={false}
              handle={(values) => {
                if (values === "Add New Vendor") {
                  navigate("/sales/vendors/show");
                } else {
                  handleFieldChange("Vendor", values);
                }
              }}
            />
          </div>
          <div className=" mr-12">
            <Input
              variant="outlined"
              label="Document No"
              placeholder="Document No"
              value={formData.Document_No}
            />
          </div>
          <div className=" mr-12">
            <Input
              variant="outlined"
              label="Issue Date"
              placeholder="Issue Date"
              type="date"
              value={formData.Issue_Date}
              onChange={(e) => handleFieldChange("Issue_Date", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-between my-2">
          <div className=" mr-12">
            <Input
              label="Place Of Supply"
              isinput={false}
              value={formData.Place_Of_Supply}
            />
          </div>
          <div className=" mr-12">
            <Input
              label="Project"
              isinput={false}
              onChange={(e) => handleFieldChange("Project", e.target.value)}
            />
          </div>
          <div className="mr-12">
            <Input
              variant="outlined"
              label="Valid Until"
              placeholder="Valid Until"
              type="date"
              value={formData.Due_Date}
              onChange={(e) => handleFieldChange("Due_Date", e.target.value)}
            />
          </div>
        </div>
      </div>
      <hr />
      <div className="my-2 ">
        <div className="contain-overflow">
          <div className="mr-12">
            <SelectComp
              label="Product"
              options={product_option}
              isinput={false}
              handle={(values) => {
                if (values === "Add New Product") {
                  navigate("/sales/product_service/show");
                } else {
                  handleFieldChange("Product", values);
                  handleFieldChange(
                    "UoM",
                    getProductUOM(
                      getTextForValue(product_option, values),
                      product_option,
                    ),
                  );
                  handleFieldChange(
                    "Unit_Price",
                    getProductPurchasePrice(values, product_option),
                  );
                  handleFieldChange(
                    "Description",
                    getProductDescription(values, product_option),
                  );
                  handleFieldChange(
                    "Tax",
                    getProductTax(values, product_option),
                  );
                }
              }}
            />
          </div>
          <div className="mr-12">
            <Input
              variant="outlined"
              label="UoM"
              placeholder="UoM"
              value={
                formData.UoM !== ""
                  ? getProductUOM(formData.Product, product_option)
                  : ""
              }
              disabled
            />
          </div>
          <div className="mr-12">
            <Input
              variant="outlined"
              label="Qty"
              placeholder="Qty"
              type="number"
              onChange={(e) => handleFieldChange("Qty", e.target.value)}
            />
          </div>
          <div className="mr-12">
            <Input
              variant="outlined"
              label="Purchase Rate"
              placeholder="Purchase Rate"
              value={formData.Unit_Price}
              disabled
            />
          </div>
          <div className="mr-12">
            <Input
              label="Tax"
              placeholder="Tax"
              value={
                formData.Product !== ""
                  ? getProductTax(formData.Product, product_option)
                  : ""
              }
              disabled
            />
          </div>
          <div className="mr-12"></div>

          <div className="mr-12">
            <Button
              onClick={() => setRows((pre) => [...pre, formData])}
              disabled={formData.Vendor === "" || formData.Product === ""}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <hr />
      <div className="flex flex-1 mb-2 h-full">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD}
          TABLE_ROWS={rowData.flat()}
          handleDeleteRow={handleDeleteRow}
        />
      </div>
      <div
        className="flex w-full flex-row"
        style={{ justifyContent: "space-between" }}
      >
        {/* First Column */}
        <div className="mr-10">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div>
                <Checkbox
                  label="Discount on all"
                  checked={discountOnAll}
                  onChange={() => setDiscountOnAll(!discountOnAll)}
                />
                {discountOnAll && (
                  <div className="flex items-center" style={{ maxWidth: 120 }}>
                    <Input
                      type="number"
                      value={discountValue === -1 ? 0 : discountValue}
                      label="Enter discount"
                      onChange={handleDiscountInputChange}
                      placeholder="Enter discount"
                    />
                    %
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center mt-3">
              <div className="mr-7">
                <Checkbox
                  label="Add Shipping & Packaging Cost"
                  onChange={() => setShippingChecked(!shippingChecked)}
                  checked={shippingChecked}
                />
                {shippingChecked && (
                  <div className="flex items-center" style={{ maxWidth: 120 }}>
                    <Input
                      variant="outlined"
                      label="Shipping Charges"
                      type="number"
                      placeholder="Shipping Charges"
                      onChange={(e) =>
                        handleFieldChange("Shipping_Charges", e.target.value)
                      }
                    />
                    <SelectComp
                      label="Shipping Tax"
                      options={tax_option}
                      isinput={false}
                      handle={(values) => {
                        handleFieldChange(
                          "Shipping_Tax",
                          getIntegerFromPercentageString(values),
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Second Column */}
        <div className="mr-10">
          <div className="flex flex-col">
            <div className="mr-5">
              <Textarea
                label="Notes"
                onChange={(e) => handleFieldChange("Notes", e.target.value)}
              />
            </div>
            <div className="mr-5 mt-3">
              <Textarea
                label="Private Notes"
                onChange={(e) =>
                  handleFieldChange("Private_Notes", e.target.value)
                }
              />
            </div>
          </div>
        </div>
        {/* Third Column */}
        <div className="py-2 self-end" style={{ marginRight: 40 }}>
          <div style={{ textAlign: "left", marginRight: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "10px",
              }}
            >
              <div>Total Before Tax:</div>
              <div style={{ textAlign: "right" }}>&#8377;{totalValue}</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "10px",
              }}
            >
              <div>Total Tax</div>
              <div style={{ textAlign: "right" }}>
                &#8377;{totalTax ? totalTax : "0.00"}
              </div>
            </div>
            {formData.Shipping_Charges !== 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "10px",
                }}
              >
                <div>Shipping Charges:</div>
                <div style={{ textAlign: "right" }}>
                  &#8377;{formData.Shipping_Charges}
                </div>
              </div>
            )}
            {formData.Shipping_Charges !== 0 && formData.Shipping_Tax !== 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "10px",
                }}
              >
                <div>Shipping Tax @{formData.Shipping_Tax}%:</div>
                <div style={{ textAlign: "right" }}>
                  &#8377;
                  {(
                    (formData.Shipping_Charges / 100) *
                    formData.Shipping_Tax
                  ).toFixed(2)}
                </div>
              </div>
            )}
            <br />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "10px",
                fontWeight: 600,
              }}
            >
              <div>Total:</div>
              <div style={{ textAlign: "right" }}>
                &#8377;
                {(
                  Number(totalValue) +
                  Number(totalTax) +
                  Number(formData.Shipping_Charges) +
                  Number(
                    (formData.Shipping_Charges / 100) * formData.Shipping_Tax,
                  )
                ).toFixed(2)}
              </div>
            </div>
          </div>
          <Button
            onClick={openInvoicePreviewWindow}
            disabled={rows.length === 0}
            style={{ width: "-webkit-fill-available" }}
          >
            Preview
          </Button>
          {renderInvoicePreview()}
        </div>
      </div>
    </div>
  );
}
