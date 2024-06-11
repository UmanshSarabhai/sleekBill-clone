const { EntitySchema } = require("typeorm");

const Product = new EntitySchema({
  name: "product",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    p_type: {
      type: String,
      nullable: true,
      default: "product",
    },
    uom: {
      type: String,
      default: "box",
      nullable: false,
    },
    product_name: {
      type: String,
      nullable: false,
    },
    purchase_price: {
      type: Number,
      nullable: true,
      default: 0,
    },
    amount: {
      type: Number,
      nullable: true,
      default: 0.0,
    },
    COGS: {
      type: Number,
      nullable: true,
      default: 0.0,
    },
    gross_margin: {
      type: Number,
      nullable: true,
      default: 0.0,
    },
    gross_margin_rate: {
      type: Number,
      nullable: true,
      default: 0.0,
    },
    keyword: {
      type: String,
      nullable: true,
    },
    category: {
      type: String,
      nullable: true,
    },
    sub_category: {
      type: String,
      nullable: true,
    },
    opening_balance: {
      type: Number,
      nullable: true,
      default: 0,
    },
    opening_rate: {
      type: Number,
      nullable: true,
      default: 0,
    },
    opening_value: {
      type: Number,
      nullable: true,
      default: 0,
    },
    storage_location: {
      type: String,
      nullable: true,
    },
    sub_location: {
      type: String,
      nullable: true,
    },
    unit_price: {
      type: Number,
      nullable: false,
      default: 0,
    },
    tax: {
      type: Number,
      nullable: false,
    },
    quantity_sold: {
      type: Number,
      nullable: true,
      default: 0.0,
    },
    description: {
      type: String,
      nullable: false,
    },
    created_at: {
      type: Date,
      nullable: true,
    },
  },
});

module.exports = { Product };
