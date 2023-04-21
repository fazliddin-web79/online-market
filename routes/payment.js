const stripe = require("stripe")(
  "sk_test_51MzMKsEFw6GN8RfkX7ge7qEdCl3jn4F8LCtHfK5caFzTPMu3Yu9JAMI6VKMCg3LD4oueGhVloMsjOoYa3jm1TULr00wWx2qxLA"
);
const express = require("express");
const Orders = require("../models/order");

const router = express.Router();

router.post("/:id", async (req, res) => {
  let line_items = [];
  try {
    const order = await Orders.findById(req.params.id)
      .populate("author")
      .populate("products.product");

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
    res.json({ err: "Bunday buyutrtma topilmadi" });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: "http://localhost:8080/api/payment/webhook",
      cancel_url: "https://example.com/cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    res.json({ err: "gvdsvydsgb" });
  }
});

// router.post("/webhook", async (req, res) => {
//   let data;
//   try {
//     data = req.body;
//   } catch (err) {
//     console.log(`Error parsing webhook JSON: ${err}`);
//     return res.sendStatus(400);
//   }

//   if (data.type === "charge.succeeded") {
//     console.log(data);
//     const chargeId = data.data.object.id;
//     const charge = await stripe.charges.retrieve(chargeId);
//     const amount = charge.amount / 100; // Stripe amounts are in cents, so divide by 100 to get the dollar amount
//     const currency = charge.currency;
//     const customerId = charge.customer;
//     const productId = charge.metadata.product_id;

//     // Do something with the payment information, such as update your application's records and fulfill the user's order
//   }

//   res.sendStatus(200);
// });

module.exports = router;
