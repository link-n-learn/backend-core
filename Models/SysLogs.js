const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  log: { type: String, required: true },
});

module.exports = mongoose.model("Log", LogSchema);
