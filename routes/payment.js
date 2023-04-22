const stripe = require("stripe")(
  "sk_test_51MzMKsEFw6GN8RfkX7ge7qEdCl3jn4F8LCtHfK5caFzTPMu3Yu9JAMI6VKMCg3LD4oueGhVloMsjOoYa3jm1TULr00wWx2qxLA"
);
const express = require("express");
const Orders = require("../models/order");
const Auth = require("../middlewares/auth");

const router = express.Router();

router.post("/:id", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "user")
    return res.status(401).json({ err: "Siz bu usulga kira olmaysiz" });
  let line_items = [];
  try {
    const order = await Orders.findById(req.params.id)
      .populate("author")
      .populate("products.product");
    if (req.user.id != order.author._id)
      return res.status(401).json({ err: "Kirishda xatolik" });
    line_items = order.products.map((e, i) => {
      return {
        price_data: {
          currency: "uzs",
          product_data: {
            name: e.product.title,
            description: e.product.description,
          },
          unit_amount: e.product.price,
        },
        quantity: e.quantity,
      };
    });
  } catch (err) {
    res.json({ err: "Bunday buyurtma topilmadi" });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: "https://shy-pear-crab-kit.cyclic.app/swagger/",
      cancel_url: "https://shy-pear-crab-kit.cyclic.app/swagger/",
    });
    res.json({ url: session.url });
  } catch (err) {
    res.json({ err: "server internal error" });
  }
});

module.exports = router;
