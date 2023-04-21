const express = require("express");
const path = require("path");

const Register = require("../models/register");
const Users = require("../models/user");

const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  let user = {};
  try {
    user = await Register.findById(id);
  } catch (err) {
    res
      .status(404)
      .json(
        err._message
          ? { err: "Iltimos kirishni tekshiring" }
          : { err: "Bu sahifa topilmadi" }
      );
  }

  if (!user)
    return res.status(403).json({ error: "Bunday foydalanuvchi topilmadi" });

  try {
    await Users.create({
      password: user.password,
      username: user.username,
      email: user.email,
    });

    res
      .status(200)
      .sendFile(path.join(__dirname, "../", "public", "verify.html"));
  } catch (err) {
    res.status(500).json({ error: "Server internal error" });
  }
});

module.exports = router;
