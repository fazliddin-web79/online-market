const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = express.Router();
//Database Connection
const Users = require("../models/user");
const logger = require("../winston");

const secretKey = "maxfiyKalit";

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error, value } = schema.validate({ email, password });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const user = await Users.findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ message: "Bunday foydalanuvchi topilmadi" });

    if (!(await bcrypt.compare(value.password, user.password)))
      return res.status(400).json({ message: "Password noto'g'ri kiritildi" });

    const token = jwt.sign({ id: user._id, rol: user.rol }, secretKey, {
      expiresIn: "5h",
    });

    res.status(200).json({
      data: {
        token: token,
        user: { username: user.username, email: user.email },
        rol: user.rol,
      },
    });
  } catch (err) {
    // logger.error(err.message, err);
    // res.status(500).send("Internal server error");
    res.status(401).json({ message: err.message });
  }
});

module.exports = router;
