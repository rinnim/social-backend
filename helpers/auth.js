const bycrypt = require("bcrypt");

// Function to hash password
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bycrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bycrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

// Function to compare password
const comparePassword = (password, hashed) => {
  return bycrypt.compare(password, hashed);
};

// Exporting functions
module.exports = {
  hashPassword,
  comparePassword,
};
