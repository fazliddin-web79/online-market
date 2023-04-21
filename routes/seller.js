const express = require("express");
const Users = require("../models/user");
const Auth = require("../middlewares/auth");

const router = express.Router();

//create seller for adding their own product
router.post("/:id", Auth.verifyToken, async (req, res) => {
  const id = req.params.id;
  if (req.user.rol !== "admin")
    return res
      .status(401)
      .json({ error: "Siz sotuvchi qo'shish huquqiga ega emassiz" });
  const user = await Users.findById(id);
  if (!user || user.rol != "user") {
    return res.status(401).json("Foydalanuvchini kiritishda hatolik");
  }
  try {
    await Users.findByIdAndUpdate(id, { rol: "seller" });
    res.status(200).json({ message: "Sotuvchi muvaffaqiyatli yaratildi" });
  } catch (err) {
    res.status(400).json({ error: "Bunday foydalanuvchi topilmadi" });
  }
});

module.exports = router;
