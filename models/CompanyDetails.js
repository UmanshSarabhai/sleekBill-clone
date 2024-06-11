const { EntitySchema, Transaction } = require("typeorm");

const CompanyDetails = new EntitySchema({
  name: "company_details",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    companyName: {
      type: String,
      nullable: false,
    },
    address: {
      type: String,
      nullable: false,
    },
    pincode: {
      type: String,
      nullable: false,
    },
    city: {
      type: String,
      nullable: false,
    },
    state: {
      type: String,
      nullable: false,
    },
    country: {
      type: String,
      nullable: false,
    },
    phone: {
      type: String,
      nullable: false,
    },
    email: {
      type: String,
      nullable: false,
    },
    website: {
      type: String,
      nullable: true,
    },
    PAN: {
      type: String,
      nullable: true,
    },
    GSTNO: {
      type: String,
      nullable: true,
    },
    TIN: {
      type: String,
      nullable: true,
    },
    KEY: {
      type: String,
      nullable: false,
    },
    created_at: {
      type: Date,
      nullable: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});

module.exports = { CompanyDetails };
