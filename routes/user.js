const express = require("express");
const Auth = require("../middlewares/auth");
const Users = require("../models/user");
const router = express.Router();
const bcrypt = require("bcrypt");
const Register = require("../models/register");

router.get("/all", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "admin")
    return res
      .status(401)
      .json({ err: "Siz bu o'zgartirishni amalgan oshira olmaysiz" });
  try {
    const users = await Users.find({ rol: "user" });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ err: "server internal error" });
  }
});

router.get("/:id", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "admin")
    return res
      .status(401)
      .json({ err: "Siz bu o'zgartirishni amalgan oshira olmaysiz" });
  try {
    const user = await Users.findById(req.params.id);
    return res.status(200).json({ user: user });
  } catch (err) {
    return res.status(500).json({ err: "server internal error" });
  }
});

//update user info
router.put("/update", Auth.verifyToken, async (req, res) => {
  const saltRounds = 10;
  const { username, newPassword, oldPassword } = req.body;
  if (req.user.rol != "user")
    return res
      .status(401)
      .json({ err: "Siz bu o'zgartirishni amalgan oshira olmaysiz" });
  const user = await Users.findById(req.user.id);
  if (newPassword && oldPassword) {
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    const oldPasswordHash = await bcrypt.hash(oldPassword, saltRounds);
    try {
      if (user.password == oldPasswordHash) {
        const updateUser = await Users.findByIdAndUpdate(
          req.user.id,
          {
            password: newPasswordHash,
            username,
          },
          {
            new: true,
          }
        );

        res.status(200).json({
          user: { username: updateUser.username, email: updateUser.email },
        });
      } else {
        res.status(400).json({ err: "Eski parol notog'ri kiritildi" });
      }
    } catch (err) {
      res.status(500).json({ err: "server internal error" });
    }
  } else if (username) {
    const updateUser = await Users.findByIdAndUpdate(
      req.user.id,
      {
        username,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      user: { username: updateUser.username, email: updateUser.email },
    });
  } else {
    res.status(400).json({ err: "Kirishda xatolik" });
  }
});
router.delete("/delete", Auth.verifyToken, async (req, res) => {
  if (req.user.rol != "user")
    return res
      .status(401)
      .json({ err: "Siz bu o'zgartirishni amalgan oshira olmaysiz" });
  try {
    const user = await Users.findById(req.user.id);
    await Users.findByIdAndDelete(req.user.id);
    await Register.findOneAndDelete({ email: user.email });
    res.status(200).json({ message: "Foydalanuchi o'xhirildi" });
  } catch (err) {
    res.status(500).json({ err: "server internal error" });
  }
});

module.exports = router;
