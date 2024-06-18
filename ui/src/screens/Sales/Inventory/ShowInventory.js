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
import {
  get_all_product_option,
  get_all_purchase_orders,
  get_all_invoices,
} from "../../../utils/SelectOptions";
import { saveAs } from "file-saver";
import HomeButton from "../../../assets/Buttons/HomeButton";
import adjustQuantities from "./InventoryLogic";

const TABLE_HEAD = [
  "No",
  "Type",
  "Document No",
  "Issue Date",
  "Sold QTY",
  "Purchase QTY",
];

const TABLE_HEAD_MAIN = [
  "No",
  "Product",
  "Description",
  "Type",
  "Price",
  "Quantity",
  "Action",
];
let product_option = await get_all_product_option();
let invoices = await get_all_invoices();
let purchaseOrders = await get_all_purchase_orders();

const getUomOptions = (data) => {
  let types = data.map((x) => x.uom).filter((y) => y !== undefined);
  let uniqueTypes = Array.from(new Set(types));
  return uniqueTypes;
};

function convertDropdownData(data) {
  return data.map((item) => ({
    text: item,
    value: item,
  }));
}

const adjustedData = adjustQuantities(purchaseOrders.flat(), invoices.flat());

//console.log(adjustedData);

export default function Inventory() {
  useEffect(() => {
    document.title = "Inventory";
  });

  const combinedArray = [...invoices.flat(), ...purchaseOrders.flat()];

  function getProductQtyByDocument(data, product) {
    const result = [];

    data.forEach((item) => {
      const documentNo = item.Document_No;
      const issueDate = item.Issue_Date;

      let soldQty = 0;
      let purchaseQty = 0;

      if (documentNo.startsWith("PUR")) {
        const purchaseData = item.rowsData.find(
          (row) => row.Product === product,
        );
        if (purchaseData) {
          purchaseQty += parseInt(purchaseData.Qty);
        }
      } else {
        const soldData = item.rowData.find((row) => row.Product === product);
        if (soldData) {
          soldQty += parseInt(soldData.Qty);
        }
      }

      if (soldQty !== 0 || purchaseQty !== 0) {
        result.push({
          Type: documentNo.startsWith("PUR") ? "Purchase" : "Sold",
          "Document No": documentNo,
          "Issue Date": issueDate,
          "Sold QTY": soldQty,
          "Purchase QTY": purchaseQty,
        });
      }
    });

    return result;
  }

  const [filterValues, setFilterValues] = useState({
    Product: "",
    Type: "",
  });
  const [filterData, setFilterData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const openModal = (data) => {
    setSelectedProduct(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const productQtyByDocument = getProductQtyByDocument(
    combinedArray,
    selectedProduct.Product,
  );
  const nonEmptyValues = () => {
    return Object.keys(filterValues).filter((key) => filterValues[key] !== "");
  };
  let nonEmptyFields = nonEmptyValues();
  function getTextForValue(option, value) {
    const clients = option;
    const client = clients.find((client) => client.value === value);
    return client ? client.text : "Unknown";
  }
  const unfilteredData = adjustedData.map((obj) => {
    return {
      Product: obj.Product,
      Description: obj.Description,
      Type: obj.Type,
      Price: obj.Price,
      Quantity: obj.Quantity,
      ActionButton: (
        <>
          <Tooltip content="View">
            <Button
              size="xs"
              className="py-1 px-2"
              style={{ background: "none" }}
              onClick={() => openModal(obj)}
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
                  stroke-width="2"
                  d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                />
                <path
                  stroke="currentColor"
                  stroke-width="2"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
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
    let filteredData = adjustedData
      .flat()
      .filter((object) => {
        return nonEmptyFields.every((field) => {
          if (field !== "Product") {
            return object[field]?.includes(filterValues[field]);
          } else {
            return object[field] === filterValues[field];
          }
        });
      })
      .map((obj) => {
        return {
          Product: obj.Product,
          Description: obj.Description,
          Type: obj.Type,
          Price: obj.Price,
          Quantity: obj.Quantity,
          ActionButton: (
            <>
              <Tooltip content="View">
                <Button
                  size="xs"
                  className="py-1 px-2"
                  style={{ background: "none" }}
                  onClick={() => openModal(obj)}
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
                      stroke-width="2"
                      d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                    />
                    <path
                      stroke="currentColor"
                      stroke-width="2"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
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

  const handleFilterChange = (fieldName, value) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  function removeStatusField(objectsArray) {
    // Iterate through each object in the array
    return objectsArray.map((obj) => {
      // Destructure the object to remove the "Status" field
      const { ActionButton, ...rest } = obj;
      // Return the object without the "Status" field
      return rest;
    });
  }

  const exportInventory = async () => {
    try {
      const response = await window.api.invoke(
        "export-inventory-report-to-excel",
        nonEmptyFields.length === 0
          ? removeStatusField(unfilteredData)
          : removeStatusField(filterData),
      );
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `inventory_report_${new Date()}.xlsx`);
      } else {
        //console.error("Error:", response?.error);
      }
      //console.log("Export response:", response);
    } catch (error) {
      //console.error("Export error:", error);
    }
  };

  const resetFilterValues = () => {
    window.location.reload();
  };
  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 p-3 mb-3">
        <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Search Inventory</Typography>
            <HomeButton />
          </div>
          <hr />
        </div>
        <div className="flex flex-row w-full justify-between my-2">
          <div className="flex mr-12 gap-x-2">
            <SelectComp
              label="Product"
              options={product_option}
              isinput={false}
              handle={(values) => {
                handleFilterChange("Product", values);
              }}
            />
          </div>
          <div className="flex mr-12 gap-x-2">
            <SelectComp
              variant="outlined"
              label="Type"
              placeholder="Type"
              options={convertDropdownData(getUomOptions(product_option))}
              isinput={false}
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
          <Button onClick={() => exportInventory()}>Export</Button>
        </div>
      </div>

      <div className="flex flex-1 mb-2">
        <ProductInvoiceTable
          TABLE_HEAD={TABLE_HEAD_MAIN}
          TABLE_ROWS={nonEmptyFields.length === 0 ? unfilteredData : filterData}
        />
      </div>
      <>
        <Dialog size="md" open={isModalOpen} handleOpen={openModal}>
          <DialogHeader toggler={closeModal}>
            Product Stock Details
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-1 mb-2">
              <ProductInvoiceTable
                TABLE_HEAD={TABLE_HEAD}
                TABLE_ROWS={productQtyByDocument}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <button onClick={closeModal}>Close</button>
          </DialogFooter>
        </Dialog>
      </>
    </div>
  );
}
