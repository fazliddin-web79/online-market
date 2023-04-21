const path = require("path");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      console.log("Rams formati faqat jpg va png bo'lishi mumkin");
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 4,
  },
});

module.exports = upload;
