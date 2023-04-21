const express = require("express");
const Users = require("../models/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const Auth = require("../middlewares/auth");

const saltRounds = 10;

const router = express.Router();

router.post("/", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "admin") {
    return res
      .status(401)
      .json({ error: "Siz bunday o'zgarishni amalga oshira olmaysiz" });
  }
  const schema = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const passwordHash = await bcrypt.hash(value.password, saltRounds);
  try {
    const user = await Users.create({
      username: value.username,
      password: passwordHash,
      email: value.email,
      rol: "admin",
    });
    const { username, email } = user;
    res.status(201).json({ data: { username, email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
