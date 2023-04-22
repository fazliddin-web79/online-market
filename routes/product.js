const express = require("express");
const Product = require("../models/product");
const Auth = require("../middlewares/auth");
const uploadMiddleware = require("../middlewares/upload");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const Users = require("../models/user");

const router = express.Router();

// my added products

router.get("/my-add-products", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "seller") {
    return res.status(401).json({ err: "Siz mahsulot yaratmaysiz" });
  }
  try {
    const products = await Product.find({ createdUser: req.user.id });
    res.status(200).json({ products: products });
  } catch (err) {
    res.status(400).json({ err: "Xatolik yuz berdi tekshiring" });
  }
});

router.get("/all", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const totalItems = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);

  try {
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({ products, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Server xatoligi" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    res.status(200).json({ data: product });
  } catch (err) {
    res.status(500).json({ message: "Server xatoligi" });
  }
});

//create new product controller
router.post(
  "/",
  Auth.verifyToken,
  uploadMiddleware.array("image"),
  async (req, res) => {
    const { title, description, price, category } = req.body;
    let image = "";
    let orginalName = "";
    if (req.user.rol != "seller") {
      return res.status(401).json("Siz maxsulot qoshish huquqiga ega emassiz");
    }

    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().min(0).required(),
      category: Joi.string().required(),
    });

    if (req.files) {
      let path = "";
      req.files.forEach(function (files, index, array) {
        path = path + files.path + ",";
        orginalName = orginalName + files.originalname;
      });
      image = path.substring(0, path.lastIndexOf(","));
    }
    try {
      const { value, error } = schema.validate({
        title,
        description,
        price,
        category,
      });
      if (error) {
        return res.status(400).send(error.details[0].message);
      }
      const product = await Product.create({
        ...value,
        image,
        createdUser: req.user.id,
        orginalName,
      });
      const user = await Users.findById(req.user.id);
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "yakubjonov78@gmail.com", // replace with your email address
          pass: "ufvcgxmyzkquymsy", // replace with your password
        },
      });
      let mailOptions = {
        from: "yakubjonov78@gmail.com", // replace with your email address
        to: user.email, // replace with the user's email address
        subject: "Yangi maxsulot qo'shildi",
        text: "Siz yangi mahsulot qo'shdingiz",
        attachments: [
          {
            filename: product.orginalName,
            path: product.image,
            cid: "unique@image.cid", // use unique cid value to reference the image in the HTML body
          },
        ],
        html: `
        <h2>Usernaminiz: ${user.username}</h2>
        <h3>Maxsulot nomi: ${product.title}</h3>
        <h4>Maxsulot narxi: ${product.price}</h4>
        <p>${product.description}</p>`,
      };

      // send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        }
      });
      res.status(201).json({
        product,
        message:
          "Siz email yozishmalaringizni tekshiring biz bildirishnoma jo'natdik",
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

//delete own product by seller

router.delete("/delete/:id", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "seller") {
    return res
      .status(401)
      .json({ err: "Siz bu buyruqni amalga oshira olmaysiz" });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (product.createdUser != req.user.id)
      return res.status(401).json({
        err: "Har bir sotuvchi o'zi yaratgan maxsulotni ochirishi mumkin",
      });
    await Product.findByIdAndDelete(req.params.id);
    const user = await Users.findById(req.user.id);
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yakubjonov78@gmail.com", // replace with your email address
        pass: "ufvcgxmyzkquymsy", // replace with your password
      },
    });
    let mailOptions = {
      from: "yakubjonov78@gmail.com", // replace with your email address
      to: user.email, // replace with the user's email address
      subject: "O'chirish",
      text: "Maxsulot o'chirildi",
    };

    // send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });
    res.status(200).json({ message: "Maxsulot O'chirildi" });
  } catch (err) {
    return res.status(500).json({ err: "server internal error" });
  }
});

//update own product data by seller
router.put("/update/:id", Auth.verifyToken, async (req, res) => {
  const { title, description, price, category } = req.body;
  if (req.user.rol != "seller") {
    return res
      .status(401)
      .json({ err: "Siz bu buyruqni amalgaoshira olmaysiz" });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (product.createdUser != req.user.id)
      return res.status(401).json({
        err: "Har bir sotuvchi o'zi yaratgan maxsulotni o'zgartirishi mumkin",
      });
    const newProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        category,
      },
      { new: true }
    );
    const user = await Users.findById(req.user.id);
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yakubjonov78@gmail.com", // replace with your email address
        pass: "ufvcgxmyzkquymsy", // replace with your password
      },
    });
    let mailOptions = {
      from: "yakubjonov78@gmail.com", // replace with your email address
      to: user.email, // replace with the user's email address
      subject: "Maxsulot yangilanganlik bildirishnomasi",
      text: "Maxsulot o'zgartirildi",
    };

    // send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });
    res.status(200).json({ product: newProduct });
  } catch (err) {
    return res.status(500).json({ err: "server internal error" });
  }
});

module.exports = router;
