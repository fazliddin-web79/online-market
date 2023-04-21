const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      default: "Izoh yo'q",
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "uploads/book.jpg",
    },
    orginalName: {
      type: String,
      default: "Kitob.jpg",
    },
    createdUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      validate: {
        validator: function (title) {
          return title != false;
        },
        massage: "Iltimos bu Kitob nomini kiritish ta'lab qilinadi",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("product", ProductSchema);
module.exports = Product;
