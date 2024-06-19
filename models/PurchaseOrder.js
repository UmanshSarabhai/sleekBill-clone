const { EntitySchema } = require("typeorm");

const PurchaseOrder = new EntitySchema({
  name: "purchase_order",
  columns: {
    Document_No: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    rowsData: {
      type: "json",
      nullable: true,
    },
    Vendor: {
      type: String,
      nullable: true,
    },
    Issue_Date: {
      type: "date",
      nullable: true,
    },
    Project: {
      type: String,
      nullable: true,
    },
    Payment_Term: {
      type: String,
      nullable: true,
    },
    Due_Date: {
      type: "date",
      nullable: true,
    },
    Place_Of_Supply: {
      type: String,
      nullable: true,
    },
    Location: {
      type: String,
      nullable: true,
    },
    Notes: {
      type: String,
      nullable: true,
    },
    Private_Notes: {
      type: String,
      nullable: true,
    },
    Shipping_Charges: {
      type: Number,
      nullable: true,
    },
    Discount_on_all: {
      type: Number,
      nullable: true,
    },
    Total_BeforeTax: {
      type: Number,
      nullable: true,
    },
    Total_Tax: {
      type: Number,
      nullable: true,
    },
    Order_Type: {
      type: String,
      nullable: false,
      default:"Purchase Order"
    }
  },
});

module.exports = { PurchaseOrder };
