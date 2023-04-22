const express = require("express");
const Auth = require("../middlewares/auth");
const Product = require("../models/product");
const Orders = require("../models/order");

const router = express.Router();

router.post("/:id", Auth.verifyToken, async (req, res) => {
  const { quantity } = req.body;
  const id = req.user.id;
  if (req.user.rol != "user") {
    return res.status(401).json("Siz buyurtma bera olmaysiz");
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(400).json({ error: "Bunday mahsulot topilmadi" });
  }

  const order = await Orders.findOne({
    author: id,
    status: "pending",
  });
  if (!order) {
    if (quantity == 0)
      return res
        .status(400)
        .json({ err: "Maxsulot soni bo'sh bo'lmasligi kerak" });
    try {
      const orders = await Orders.create({
        author: id,
        products: [{ product: req.params.id, quantity: quantity || 1 }],
        status: "pending",
      })
        .populate("author")
        .populate("products.product");
      res.status(200).json(orders);
    } catch (error) {}
  } else {
    const addedOrder = await Orders.findOne({
      author: id,
      "products.product": req.params.id,
    });
    if (quantity == 0) {
      let arr = addedOrder.products
        .map((e, i) => {
          return e.product && e.product != req.params.id ? e : "";
        })
        .filter((e) => e);

      const newOrder = await Orders.findOneAndUpdate(
        {
          author: id,
          status: "pending",
        },
        {
          products: arr,
        },
        { new: true }
      );
      if (!newOrder.products.length)
        await Orders.findByIdAndDelete(newOrder._id);

      return res
        .status(200)
        .json(
          newOrder.products.length
            ? { order: newOrder }
            : { message: "Order tizimdan o'chirildi" }
        );
    }

    if (addedOrder && addedOrder.products.length) {
      const productList = addedOrder.products;
      let index = 0;
      productList.map((e, i) => {
        if (e.product == req.params.id) index = i;
      });
      let path = "products." + index + ".quantity";
      const updateOrder = await Orders.findOneAndUpdate(
        {
          author: id,
          "products.product": req.params.id,
        },
        {
          $set: {
            [path]: quantity,
          },
        },
        {
          new: true,
        }
      )
        .populate("author")
        .populate("products.product");
      res.status(200).json({ order: updateOrder });
    } else {
      const pushedProduct = await Orders.findOneAndUpdate(
        {
          author: id,
          status: "pending",
        },
        {
          $push: {
            products: { product: req.params.id, quantity },
          },
        },
        {
          new: true,
        }
      )
        .populate("author")
        .populate("products.product");

      res.status(200).json({ product: pushedProduct });
    }
  }
});
router.get("/my-basket", Auth.verifyToken, async (req, res) => {
  const id = req.user.id;
  if (req.user.rol != "user") {
    return res.status(401).json("Siz buyurtma bera olmaysiz");
  }

  try {
    const order = await Orders.findOne({ author: id, status: "pending" })
      .populate("products.product")
      .populate("author", "username email rol");
    res.status(200).json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server hatoligi" });
  }
});

router.delete("/:id", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "user") {
    return res.status(401).json("Siz buyurtmani o'chira olmaysiz");
  }

  try {
    await Orders.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Buyurtma o'chirildi" });
  } catch (err) {
    res.status(500).json({ err: "Server internal error" });
  }
});

module.exports = router;
