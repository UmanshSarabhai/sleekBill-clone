const { EntitySchema } = require("typeorm");

const ProductQuantities = new EntitySchema({
  name: "product_quantities",
  columns: {
    Product: {
      type: String,
      nullable: false,
      primary: true,
    },
    Quantity: {
      type: Number,
      nullable: false,
    },
    created_at: {
      type: Date,
      nullable: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});

module.exports = { ProductQuantities };
