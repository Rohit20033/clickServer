const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String },
  image: { type: String },
  email: { type: String },
  gender: { type: String },
  password: { type: String },
  dob: { type: String },
  number: { type: Number },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };
