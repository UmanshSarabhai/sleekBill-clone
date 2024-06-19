const { DataSource } = require("typeorm");
const { CompanyModel } = require("../models/Company");
const { Address } = require("../models/Address");
const { Client } = require("../models/Client");
const { Product } = require("../models/Product");
const { ReportData } = require("../models/ReportData");
const { Category } = require("../models/Category");
const { Tax } = require("../models/Tax");
const { SubCategory } = require("../models/SubCategory");
const { Invoice } = require("../models/Invoice");
const { Quotation } = require("../models/Quotation");
const { CompanyDetails } = require("../models/CompanyDetails");
const { Debit_Notes } = require("../models/DebitNotes");
const { Credit_Notes } = require("../models/CreditNotes");
const { PaymentDetails } = require("../models/PaymentDetails");
const { PurchaseOrder } = require("../models/PurchaseOrder");
const { VendorDetails } = require("../models/VendorDetails");
const { ExpenseDetails } = require("../models/ExpenseDetails");
const { Employee } = require("../models/Employee");
const { EmployeePaymentDetails } = require("../models/EmployeePaymentDetails");
const { Todo } = require("../models/Todo");
const { EmployeeLeaveDetails } = require("../models/EmployeeLeaveDetails");
const {
  EmployeeAttendanceDetails,
} = require("../models/EmployeeAttendanceDetails");
const { ProductQuantities } = require("../models/ProductQuantities");

const DBManager = new DataSource({
  name: "maindb",
  type: "sqlite",
  database: "./db/database.sqlite",
  entities: [
    Address,
    Client,
    Category,
    Tax,
    SubCategory,
    CompanyModel,
    Product,
    ReportData,
    Invoice,
    Quotation,
    CompanyDetails,
    Debit_Notes,
    Credit_Notes,
    PaymentDetails,
    PurchaseOrder,
    VendorDetails,
    ExpenseDetails,
    Employee,
    EmployeePaymentDetails,
    Todo,
    EmployeeLeaveDetails,
    EmployeeAttendanceDetails,
    ProductQuantities,
  ],
  synchronize: true,
});

module.exports = { DBManager };
