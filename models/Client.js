const { EntitySchema, OneToMany } = require("typeorm");

const Client = new EntitySchema({
  name: "clients",
  columns: {
    id: {
      type: Number,
      generated: true,
      primary: true,
    },
    client_name: {
      type: String,
      nullable: false,
    },
    contact_name: {
      type: String,
      nullable: true,
    },
    phone: {
      type: String,
      nullable: false,
      unique: true,
    },
    email: {
      type: String,
      nullable: true,
      unique: true,
    },
    gstin: {
      type: String,
      nullable: true,
      unique: true,
    },
    tin: {
      type: String,
      nullable: true,
      unique: true,
    },
    pan: {
      type: String,
      nullable: true,
      unique: true,
    },
    vat: {
      type: String,
      nullable: true,
      unique: true,
    },
    private_client_detail: {
      type: String,
      nullable: true,
    },
    other_client_detail: {
      type: String,
      nullable: true,
    },
    vendor: {
      type: Boolean,
      default: false,
    },
    sez: {
      type: Boolean,
      default: false,
    },
    billing_address: {
      type: Number,
      nullable: false,
    },
    shiping_address: {
      type: Number,
      nullable: true,
    },
    created_at: {
      type: Date,
      nullable: true,
    },
  },
  relations: {
    billing_address: {
      type: "one-to-one",
      target: "address",
    },
    shiping_address: {
      type: "one-to-one",
      target: "address",
      nullable: true,
    },
  },
});

module.exports = { Client };
