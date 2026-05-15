const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

// middleware for verifying tokens

module.exports = (req, res, next) => {
  // if (req.method === 'OPTIONS') {
  //     return next();
  // }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      userId: decodedToken.userId,
      userRole: decodedToken.userRole,
    }; //adds a userData property to the req object, that contains the userId.
    next(); // let proceed to next middleware if token is verified.
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
