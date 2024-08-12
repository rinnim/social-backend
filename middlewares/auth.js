const { expressjwt } = require("express-jwt");

// function to decode token and attach user to request
const requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "user",
});

module.exports = { requireSignin };
