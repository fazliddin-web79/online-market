const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Register = require("../models/register");

const saltRounds = 10;

const router = express.Router();

router.post("/", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yakubjonov78@gmail.com", // replace with your email address
      pass: "ufvcgxmyzkquymsy", // replace with your password
    },
  });

  // define email options

  const passwordHash = await bcrypt.hash(value.password, saltRounds);
  try {
    const user = await Register.create({
      username: value.username,
      password: passwordHash,
      email: value.email,
    });

    let mailOptions = {
      from: "yakubjonov78@gmail.com", // replace with your email address
      to: value.email, // replace with the user's email address
      subject: "Verification for Online Market to LOG IN",
      text: "Siz ro'yhatdan o'tishni tasdiqlashingiz lozim",
      html: `<p> Ushbu <a href="https://shy-pear-crab-kit.cyclic.app/api/verify/${user._id}">Havolaga </a> o'ting</p>`,
    };

    // send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });
    res.status(201).json({
      message: "Siz email yozishmalaringizga o'tib kirishni tasdiqlang",
    });
  } catch (err) {
    // logger.error(err.message, err);
    // res.status(500).send("Internal server error");
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
