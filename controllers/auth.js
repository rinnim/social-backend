const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const jwt = require("jsonwebtoken");

// Function for registering user
const register = async (req, res) => {
  // destructuring the request body
  const { name, email, password, secret } = req.body;

  // validation of data
  if (!name) return res.json({ error: "Name is required!" });
  if (!password || password.length < 6)
    return res.json({
      error: "Password is required and should be 6 characters long",
    });
  if (!secret) return res.json({ error: "Answer is required!" });

  // check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.json({ error: "Email already exists!" });

  // hash the password
  const hashedPassword = await hashPassword(password);

  // register user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    secret,
  });

  try {
    await user.save();
    console.log("REGISTERED USE => ", user);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.log("REGISTER FAILED => ", err);
    return res.status(400).json({ error: "Error. Try again." });
  }
};

// Function for login user
const login = async (req, res) => {
  // destructuring the request body
  const { email, password } = req.body;

  try {
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "No user found!" });

    // check if password matches
    const match = await comparePassword(password, user.password);
    if (!match) return res.json({ error: "Wrong password!" });

    // generate JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // remove pasword and secret from user
    user.password = undefined;
    user.secret = undefined;

    // return user and token
    return res.json({
      user,
      token,
    });
  } catch (err) {
    console.log("LOGIN FAILED => ", err);
    return res.status(400).json({ error: "Error. Try again." });
  }
};

// Function for current user
const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: "Error. Try again." });
  }
};

// Function for forgot password
const forgotPassword = async (req, res) => {
  // destructuring the request body
  const { email, newPassword, secret } = req.body;

  // validation of data
  if (!email) return res.json({ error: "Email is required!" });
  if (!newPassword || newPassword.length < 6)
    return res.json({
      error: "Password is required and should be 6 characters long!",
    });
  if (!secret) return res.json({ error: "Secret is required!" });

  // check for existing user
  const user = await User.findOne({ email, secret });
  if (!user)
    return res.json({ error: "We can't verify you with those details" });

  try {
    // hash the password
    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    return res.json({
      success: "Congrats! Now you can login with your new password",
    });
  } catch (err) {
    console.log("FORGOT PASSWORD FAILED => ", err);
    return res.json({ error: "Something went wrong, try again later!" });
  }
};

module.exports = {
  register,
  login,
  currentUser,
  forgotPassword,
};
