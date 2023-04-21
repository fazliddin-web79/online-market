const mongoose = require("mongoose");

const OrdersSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  status: {
    type: String,
    enum: ["pending", "payed", "delivered"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Orders = mongoose.model("orders", OrdersSchema);

module.exports = Orders;
