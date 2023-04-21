const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const stripe = require("stripe")(
  "sk_test_51MzMKsEFw6GN8RfkX7ge7qEdCl3jn4F8LCtHfK5caFzTPMu3Yu9JAMI6VKMCg3LD4oueGhVloMsjOoYa3jm1TULr00wWx2qxLA"
);

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDocument = require("./swagger.json");

const app = express();

const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const productRouter = require("./routes/product");
const sellersRouter = require("./routes/seller");
const adminsRouter = require("./routes/admin");
const ordersRouter = require("./routes/order");
const verifyRouter = require("./routes/verify");
const paymentRouter = require("./routes/payment");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static("upload"));

//swagger documentation for our server API
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => res.json({ message: "Welcome to my API" }));

app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.use("/api/products", productRouter);
app.use("/api/sellers", sellersRouter);
app.use("/api/admin", adminsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/payment", paymentRouter);

const port = process.env.PORT || 8080;

app.post("/webhook", async (req, res) => {
  const payload = req.body;
  const eventType = payload.type;
  const eventObject = payload.data.object;

  if (eventType === "charge.succeeded") {
    const charge = await stripe.charges.retrieve(eventObject.id);
    if (charge.status === "succeeded") {
      // Charge was successful
      console.log("Charge succeeded:", charge.id);
    } else {
      // Charge was not successful
      console.log("Charge failed:", charge.id);
    }
  }

  // Return a 200 response to acknowledge receipt of the webhook
  res.json({ received: true });
});

mongoose
  .connect("mongodb://localhost:27017/online-market", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
