const mongoose = require("mongoose");

const RegisterSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 6,
      max: 50,
      validate: [
        {
          validator: function (username) {
            return username != false;
          },
          message: "Iltimos bu Username kiritish ta'lab qilinadi",
        },

        {
          validator: async function (userName) {
            return userName.length >= 6 && userName.length <= 50;
          },
          message: "Bu username foydalanishga yaroqsiz",
        },
      ],
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 500,
      validate: [
        {
          validator: function (password) {
            return (
              password != false &&
              password.length >= 6 &&
              password.length <= 500
            );
          },
          message: "Parol kiritish ta'lab qilinadi",
        },
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      min: 6,
      max: 50,
      validate: [
        {
          validator: function (email) {
            return email != false && email.length >= 6 && email.length <= 50;
          },
          message: "E-mailni kiritish ta'lab qilinadi",
        },
        {
          validator: async function (email) {
            const count = await mongoose
              .model("users")
              .countDocuments({ email });
            return count === 0;
          },
          message: "Bu emaildan oldin foydalanilgan",
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Register = mongoose.model("registers", RegisterSchema);

module.exports = Register;
