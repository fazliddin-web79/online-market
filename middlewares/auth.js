const jwt = require("jsonwebtoken");

const secretKey = "maxfiyKalit";

class Auth {
  static verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Token xato berildi" });
    }

    try {
      const decoded = jwt.verify(token.split(" ")[1], secretKey);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
  }
}

module.exports = Auth;
