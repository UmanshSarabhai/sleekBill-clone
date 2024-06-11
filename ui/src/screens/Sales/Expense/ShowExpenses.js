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
  get_all_expenses,
  get_all_employee,
} from "../../../utils/SelectOptions";
import { saveAs } from "file-saver";
import HomeButton from "../../../assets/Buttons/HomeButton";

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
  "Person Name",
  "Expense Type",
  "Amount",
  "Date",
  "Notes",
  "Action",
];

const initialValue = {
  Person_name: "",
  Expense_type: "",
  Amount: "",
  Date: "",
  Notes: "",
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

const allExpenses = await get_all_expenses();
const handleDeleteExpense = async (obj) => {
  const res = await window.api.invoke("delete-expense-by-id", obj.id);
  alert(res.message);
};

const EXPENSES_ROWS = allExpenses.flat().map((x) => {
  return {
    "Person Name": x.Person_name,
    "Expense Type": x.Expense_type,
    Amount: x.Amount,
    Date: x.Date ? convertDateToString(x.Date) : "",
    Notes: x.Notes,
    Action: (
      <Tooltip content="Delete">
        <Button
          color="white"
          size="xs" // Adjusted button size to xs
          onClick={() => handleDeleteExpense(x)}
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
    ),
  };
});

const allEmployees = await get_all_employee();
console.log(allEmployees.flat());

export default function ShowExpenses() {
  useEffect(() => {
    document.title = "Show Expense";
  });

  const person_option = allEmployees.flat().map((x) => x.Employee_name);
  const [filterValues, setFilterValues] = useState({
    Person: "",
    Type: "",
    Issue_From: "",
    Issue_To: "",
  });
  const [fields, setFields] = useState(initialValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredData, setFilterData] = useState("");
  const [renderCustomExpense, setRenderCustomExpense] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setRenderCustomExpense(false);
    const res = await window.api.invoke("add-new-expense", fields);
    alert(res.message);
  };

  const nonEmptyValues = () => {
    return Object.keys(filterValues).filter((key) => filterValues[key] !== "");
  };
  let nonEmptyFields = nonEmptyValues();

  useEffect(() => {
    let nonEmptyFields = nonEmptyValues();
    let filter = allExpenses
      .flat()
      .filter((object) => {
        return nonEmptyFields.every((field) => {
          if (field === "Issue_From" || field === "Issue_To") {
            // Check if Issue Date lies in the range between Issue_From and Issue_To
            const fromDate = new Date(filterValues.Issue_From);
            const toDate = new Date(filterValues.Issue_To);
            const issueDate = new Date(convertDateToString(object.Date));
            return issueDate >= fromDate && issueDate <= toDate;
          } else if (field === "Person") {
            return object["Person_name"] === filterValues[field];
          } else if (field === "Type" && filterValues[field] === "Other") {
            return (
              object["Expense_type"] !== "Food" &&
              object["Expense_type"] !== "Fuel" &&
              object["Expense_type"] !== "Transportation" &&
              object["Expense_type"] !== "Office Expense"
            );
          } else {
            return object["Expense_type"] === filterValues[field];
          }
        });
      })
      .map((obj) => {
        return {
          "Person Name": obj.Person_name,
          "Expense Type": obj.Expense_type,
          Amount: obj.Amount,
          Date: obj.Date ? convertDateToString(obj.Date) : "",
          Notes: obj.Notes,
          Action: (
            <Tooltip content="Delete">
              <Button
                color="white"
                size="xs" // Adjusted button size to xs
                onClick={() => handleDeleteExpense(obj)}
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
          ),
        };
      });
    setFilterData(filter);
  }, [filterValues]);

  function getTextForValue(option, value) {
    const clients = option;
    const client = clients.find((client) => client.value === value);
    return client ? client.text : "Unknown";
  }

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
  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 p-3 mb-3">
        <div className="my-2 flex-1">
          <div className="flex items-center">
            <Typography variant="h6">Search Expense</Typography>
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
          <div className=" mr-12">
            <div className="flex mr-12 gap-x-2">
              <Input
                variant="outlined"
                label="Issue From"
                placeholder="Issue From"
                type="date"
                onChange={(e) =>
                  handleFilterChange("Issue_From", e.target.value)
                }
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
          <div className="flex mr-12 gap-x-2">
            <SelectComp
              variant="outlined"
              label="Type"
              placeholder="Type"
              options={generateDropDownList(expense_options)}
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
          <Button>Export</Button>
        </div>
        <div className="mx-3">
          <Button onClick={openModal}>Add New Expense</Button>
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
        <Dialog size="l" open={isModalOpen} handleOpen={openModal}>
          <DialogHeader toggler={closeModal}>
            Add New Expense Details
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <SelectComp
                  variant="outlined"
                  label="Employee Name"
                  placeholder="Employee Name"
                  options={generateDropDownList(person_option)}
                  isInput={false}
                  handle={(values) => {
                    handleFieldChange("Person_name", values);
                  }}
                />
              </div>
              {renderCustomExpense ? (
                <div>
                  <label style={{ color: "black", marginLeft: 5 }}>
                    Please Input Custom Expense:
                  </label>
                  <Input
                    variant="outlined"
                    label="Expense Type"
                    onChange={(e) =>
                      handleFieldChange("Expense_type", e.target.value)
                    }
                    placeholder="Expense Type"
                  />
                </div>
              ) : (
                <div>
                  <SelectComp
                    variant="outlined"
                    options={generateDropDownList(expense_options)}
                    label="Expense Type"
                    placeholder="Expense Type"
                    handle={(values) => {
                      if (values === "Other") {
                        setRenderCustomExpense(true);
                      } else {
                        handleFieldChange("Expense_type", values);
                      }
                    }}
                  />
                </div>
              )}
              {/* Amount */}
              <div>
                <Input
                  variant="outlined"
                  label="Amount"
                  type="number"
                  onChange={(e) => handleFieldChange("Amount", e.target.value)}
                  placeholder="Amount"
                />
              </div>
              {/* Address */}
              <div>
                <Input
                  variant="outlined"
                  label="Date"
                  type="date"
                  onChange={(e) => handleFieldChange("Date", e.target.value)}
                  placeholder="Date"
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
              disabled={
                fields.Person_name === "" ||
                fields.Amount === "" ||
                fields.Expense_type === "" ||
                fields.Date === ""
              }
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    </div>
  );
}
