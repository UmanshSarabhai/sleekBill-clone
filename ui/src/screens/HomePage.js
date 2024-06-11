import React, { useEffect } from "react";
import { useState } from "react";
import User from "../assets/images/User.png";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  List,
  ListItem,
  Input,
  Textarea,
  Button,
} from "@material-tailwind/react";
import {
  get_invoice_count,
  get_todo_data,
  get_company_details,
  get_all_invoices,
  get_all_purchase_orders,
} from "../utils/SelectOptions";
import { Link, useNavigate, Navigate } from "react-router-dom";
import adjustQuantities from "./Sales/Inventory/InventoryLogic";

let invoices = await get_all_invoices();
let purchaseOrders = await get_all_purchase_orders();

const adjustedData = adjustQuantities(purchaseOrders.flat(), invoices.flat());

const current_stock = adjustedData.map((x) => {
  return {
    Product: x.Product,
    Quantity: x.Quantity,
  };
});


const Icon = ({ id, open }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="white"
    className={`${
      id === open ? "rotate-180" : ""
    } h-5 w-5 transition-transform`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const MyAccordion = ({ title, options, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <div className="px-5">
      <Accordion open={open === 1} icon={<Icon id={1} open={open} />}>
        <AccordionHeader
          onClick={() => handleOpen(1)}
          style={{ color: "white" }}
        >
          {title}
        </AccordionHeader>
        <AccordionBody>{options}</AccordionBody>
      </Accordion>
    </div>
  );
};

function ShortCutCard({ title, to, color, icon }) {
  const renderTitle = () => {
    if (!title) return null;

    const firstChar = title.charAt(0);
    const restChars = title.slice(1);

    return (
      <h1
        className="text-sm font-bold text-black"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <span className="text-4xl">{firstChar}</span>
        {restChars}
        {icon && <span className="ml-2">{icon}</span>}
      </h1>
    );
  };

  return (
    <Link to={to} className="hoverShortCutCard">
      <div
        className="flex flex-col customCard rounded border-2 border-primary p-6 bg-gray-100 text-xs font-medium uppercase leading-normal text-primary transition duration-150 ease-in-out hover:border-primary-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-primary-600 focus:border-primary-600 focus:text-primary-600 focus:outline-none focus:ring-0 active:border-primary-700 active:text-primary-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
        style={{
          minWidth: "400px",
          maxWidth: "400px",
          alignItems: "center",
          maxHeight: "80px",
          justifyContent: "center",
          background: color,
          marginBottom: 30,
          boxShadow:
            "rgba(0, 0, 0, 0.1) 3px 2px 5px 3px, rgba(0, 0, 0, 0.08) 2px 0px 3px", // Adding shadow
        }}
      >
        <div>{renderTitle()}</div>
      </div>
    </Link>
  );
}

function ListItemsHeading({ title, to }) {
  const renderTitle = () => {
    if (!title) return null;
    return (
      <h1
        className="font-bold text-white"
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: "large",
        }}
      >
        {title}
      </h1>
    );
  };

  return (
    <Link to={to}>
      <div
        style={{
          justifyContent: "center",
          background: "transparent",
          border: "none",
        }}
      >
        <div className="hover-menu-list">{renderTitle()}</div>
      </div>
    </Link>
  );
}

function ListItemsOptions({ title, to }) {
  const renderTitle = () => {
    if (!title) return null;
    return (
      <h1
        className="font-bold text-white"
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: "small",
        }}
      >
        {title}
      </h1>
    );
  };

  return (
    <Link to={to}>
      <div
        style={{
          justifyContent: "center",
          background: "transparent",
          border: "none",
        }}
      >
        <div className="hover-menu-list">{renderTitle()}</div>
      </div>
    </Link>
  );
}

function GenericCard({ title, value, backgroundColor, shadowColor }) {
  return (
    <div
      className="cursor-pointer flex items-center justify-center uppercase bg-white px-4 py-2 active:translate-x-0.5 active:translate-y-0.5 hover:shadow-[0.5rem_0.5rem_#23d2d8b0,-0.5rem_-0.5rem_#003899c9] hover:scale-105 transition-transform w-200 h-150 border border-gray-300 rounded-md shadow-[0.5rem_0.5rem_#23d2d8b0,-0.5rem_-0.5rem_#003899c9]"
      style={{
        width: 250,
        height: 150,
        backgroundColor: backgroundColor,
        boxShadow: `0 4px 8px ${shadowColor}`,
      }}
    >
      <div className="text-center">
        <span className="font-bold text-black text-2xl">{value}</span>
        <br />
        <span className="text-lg text-gray-600">{title}</span>
      </div>
    </div>
  );
}

const invoiceCount = await get_invoice_count();
const todo = await get_todo_data();
const todoData = todo?.data[0]?.todo;
const KEY = "HSNAMU-4444-KAHTRAS-8888";
let companyDetails = await get_company_details();
let keyToCompare = companyDetails.data[0]?.KEY;

export default function HomePage() {
  useEffect(() => {
    document.title = "Billing System";
  });

  useEffect(() => {
    const updateProductQuantity = async () => {
      const res = await window.api.invoke(
        "update-product-quantity",
        current_stock,
      );
    };
    updateProductQuantity();
  }, [current_stock]);
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        navigate("/sales/invoice/new");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        navigate("/sales/ledger/show");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "r") {
        navigate("/sales/invoice/show");
      }
      if (event.altKey && event.key.toLowerCase() === "p") {
        navigate("/sales/purchase/show");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "p") {
        navigate("/sales/payment/show");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "i") {
        navigate("/sales/inventory/show");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "e") {
        navigate("/mgmt/employee/show");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        navigate("/sales/invoice/show");
      }
      if (event.altKey && event.key.toLowerCase() === "e") {
        navigate("/sales/expense/show");
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const [text, setText] = useState("");

  const handleSave = async () => {
    const res = await window.api.invoke("save-todo", text);
    alert(res.message);
  };

  return (
    <>
      {keyToCompare !== KEY ? (
        <>
          <Navigate to="/settings/company/new" />
        </>
      ) : (
        <div
          className="flex justify-evenly w-full h-full"
          style={{ background: "rgb(96 125 139 / 0.1)" }}
        >
          <div
            className={"h-screen sticky top-0 overflow-y-auto"}
            style={{
              background: "rgb(15 14 42 / 90%)",
              minWidth: "20%",
              maxWidth: "20%",
            }}
          >
            <div className="flex gap-x-4 items-center p-5">
              <img src={User} className={`cursor-pointer duration-500`} />
              <h1
                className={`text-white origin-left font-medium text-xl duration-200 scale-0`}
              >
                Billing System
              </h1>
            </div>
            <>
              <List className="text-xs text-white font-normal flex justify-center">
                <ListItemsHeading
                  title={
                    <>
                      <svg
                        className="w-[30px] h-[30px] text-white dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ marginRight: "2px" }}
                      >
                        <path
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                        />
                      </svg>
                      Home
                    </>
                  }
                  to="/"
                />

                <ListItemsHeading
                  title={
                    <>
                      <svg
                        className="w-[30px] h-[30px] text-white dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ marginRight: "2px" }}
                      >
                        <path
                          stroke="white"
                          strokeWidth="1.5"
                          d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      Client
                    </>
                  }
                  to="/sales/client/show"
                />
                <ListItemsHeading
                  title={
                    <>
                      <svg
                        className="w-[30px] h-[30px] text-white dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ marginRight: "2px" }}
                      >
                        <path
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M14 17h6m-3 3v-6M4.857 4h4.286c.473 0 .857.384.857.857v4.286a.857.857 0 0 1-.857.857H4.857A.857.857 0 0 1 4 9.143V4.857C4 4.384 4.384 4 4.857 4Zm10 0h4.286c.473 0 .857.384.857.857v4.286a.857.857 0 0 1-.857.857h-4.286A.857.857 0 0 1 14 9.143V4.857c0-.473.384-.857.857-.857Zm-10 10h4.286c.473 0 .857.384.857.857v4.286a.857.857 0 0 1-.857.857H4.857A.857.857 0 0 1 4 19.143v-4.286c0-.473.384-.857.857-.857Z"
                        />
                      </svg>
                      Product
                    </>
                  }
                  to="/sales/product_service/show"
                />
              </List>

              <MyAccordion
                title={
                  <div
                    style={{
                      fontSize: "large",
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    <svg
                      className="w-[30px] h-[30px] text-white dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      style={{ marginRight: "2px" }}
                    >
                      <path
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
                      />
                    </svg>{" "}
                    Sales
                  </div>
                }
                options={
                  <>
                    {[
                      { title: "New Invoice", route: "/sales/invoice/new" },
                      {
                        title: "New Quotations",
                        route: "/sales/quotation/new",
                      },
                      { title: "New Credit Notes", route: "/sales/credit/new" },
                      { title: "New Debit Notes", route: "/sales/debit/new" },
                    ].map((option, idx) => (
                      <ListItemsOptions
                        key={idx}
                        title={option.title}
                        to={option.route}
                      />
                    ))}
                  </>
                }
                defaultOpen={1}
              />
              <MyAccordion
                title={
                  <div
                    style={{
                      fontSize: "large",
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    <svg
                      className="w-[30px] h-[30px] text-white dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      style={{ marginRight: "2px" }}
                    >
                      <path
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"
                      />
                    </svg>
                    Purchase
                  </div>
                }
                options={
                  <>
                    <ListItemsOptions
                      title="New Purchase Orders"
                      to="/sales/purchase/new"
                    />
                    <ListItemsOptions
                      title="Expenses"
                      to="/sales/expense/show"
                    />
                  </>
                }
              />
              <MyAccordion
                title={
                  <div
                    style={{
                      fontSize: "large",
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    <svg
                      className="w-[30px] h-[30px] text-white dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      style={{ marginRight: "2px" }}
                    >
                      <path
                        stroke="white"
                        strokeLinecap="square"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    Settings
                  </div>
                }
                options={
                  <ListItemsOptions
                    title="Company Details"
                    to="/settings/company/new"
                  />
                }
              />
            </>
          </div>

          <div className="flex flex-col items-center p-4 h-screen w-full m-4">
            {/* ---------------------New Code---------------------- */}
            <div className="mainCointainer">
              <div className="firstContainer">
                <div className="firstIndicators">
                  <GenericCard
                    title="Today's Sale"
                    value="&#8377;10,000"
                    backgroundColor="#FFFFFF"
                    shadowColor="#23d2d8b0"
                  />
                  <GenericCard
                    title="Total Orders"
                    value={invoiceCount}
                    backgroundColor="#FFFFFF"
                    shadowColor="#003899c9"
                  />
                  <GenericCard
                    title="Pending Orders"
                    value="5"
                    backgroundColor="#FFFFFF"
                    shadowColor="#23d2d8b0"
                  />
                </div>
                <div className="gradientButtons">
                  <div
                    className="column"
                    style={{ background: "white", padding: 20 }}
                  >
                    {/* Content of the first column */}
                    <div className="flex flex-col">
                      <ShortCutCard
                        title="SALES"
                        to="/sales/invoice/new"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            className="w-[30px] h-[30px] text-white dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            style={{ marginRight: "2px" }}
                          >
                            <path
                              stroke="black"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
                            />
                          </svg>
                        }
                      />
                      <ShortCutCard
                        title="LEDGER"
                        to="/sales/ledger/show"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="black"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M8 6h8M6 10h12M8 14h8M6 18h12"
                            />
                          </svg>
                        }
                      />
                      <ShortCutCard
                        title="REPORTS"
                        to="/sales/invoice/show"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="black"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-3 5h3m-6 0h.01M12 16h3m-6 0h.01M10 3v4h4V3h-4Z"
                            />
                          </svg>
                        }
                      />

                      <ShortCutCard
                        title={"PAYMENT"}
                        to="/sales/payment/new"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            style={{ marginRight: 2 }}
                          >
                            <path
                              stroke="black"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M5 12h14m-7 7V5"
                            />
                          </svg>
                        }
                      />
                    </div>
                  </div>

                  <div
                    className="column"
                    style={{ background: "white", padding: 20 }}
                  >
                    {/* Content of the second column */}
                    <div className="flex flex-col">
                      <ShortCutCard
                        title="PURCHASE"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="black"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M5 11.917 9.724 16.5 19 7.5"
                              a
                            />
                          </svg>
                        }
                        to="/sales/purchase/new"
                        // color="#EBF1FA"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                      />

                      <ShortCutCard
                        title="INVENTORY"
                        to="/sales/inventory/show"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="black"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"
                            />
                          </svg>
                        }
                      />

                      <ShortCutCard
                        title="EMPLOYEE MANAGEMENT"
                        to="/mgmt/employee/show"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="black"
                              stroke-linecap="square"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        }
                      />
                      <ShortCutCard
                        title="EXPENSES"
                        to="/sales/expense/show"
                        color="linear-gradient(90deg, rgba(218,218,218,1) 0%, rgba(190,208,236,1) 50%, rgba(100,111,169,0.7932422969187676) 100%)"
                        icon={
                          <svg
                            class="w-[30px] h-[30px] text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            style={{ marginRight: 2 }}
                          >
                            <path
                              stroke="black"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                              d="M5 12h14m-7 7V5"
                            />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="secondContainer">
                <div className="firstIndicators">
                  <GenericCard
                    title="Sales Done"
                    value="14"
                    backgroundColor="#FFFFFF"
                    shadowColor="#003899c9"
                  />
                </div>
                <div className="helpSection">
                  <div
                    className="column"
                    style={{ background: "white", padding: 20 }}
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                          }}
                        >
                          <Textarea
                            label="Todo"
                            defaultValue={todoData ? todoData : ""}
                            onChange={(e) => setText(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            color="blue"
                            className="rounded-full"
                            ripple={true}
                            size="sm"
                            onClick={handleSave}
                          >
                            Save
                          </Button>
                        </div>
                        <div
                          style={{
                            height: 1,
                            background: "lightgray",
                            marginTop: 52,
                          }}
                        ></div>

                        <List className="text-black font-normal flex">
                          <ListItem
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "large",
                              width: "85%",
                            }}
                          >
                            <svg
                              class="w-[30px] h-[30px] text-gray-800 dark:text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="black"
                                stroke-linecap="round"
                                stroke-width="1.5"
                                d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                              />
                            </svg>
                            Help
                          </ListItem>
                          <ListItem
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "large",
                              width: "85%",
                            }}
                          >
                            <svg
                              class="w-[30px] h-[30px] text-gray-800 dark:text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="black"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"
                              />
                            </svg>
                            Learn Shortcut
                          </ListItem>
                          <ListItem
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "large",
                              width: "85%",
                            }}
                          >
                            <svg
                              class="w-[30px] h-[30px] text-gray-800 dark:text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="black"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M14 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 11-6-2V9l6-2v10Z"
                              />
                            </svg>
                            Video Tutorial
                          </ListItem>
                          <ListItem
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "large",
                              width: "90%",
                            }}
                          >
                            <svg
                              class="w-[30px] h-[30px] text-gray-800 dark:text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="black"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M14.079 6.839a3 3 0 0 0-4.255.1M13 20h1.083A3.916 3.916 0 0 0 18 16.083V9A6 6 0 1 0 6 9v7m7 4v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Zm-7-4v-6H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1Zm12-6h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v-6Z"
                              />
                            </svg>
                            Customer Support
                          </ListItem>
                        </List>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
