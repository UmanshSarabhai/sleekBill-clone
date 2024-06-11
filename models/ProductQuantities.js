const { EntitySchema } = require("typeorm");

const ProductQuantities = new EntitySchema({
  name: "product_quantities",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    Product: {
      type: String,
      nullable: false,
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
