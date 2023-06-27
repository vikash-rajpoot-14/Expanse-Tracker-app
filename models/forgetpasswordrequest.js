const uuid = require("uuid");
const mongoose = require("mongoose");

const frequestSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuid.v4,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Frequest = mongoose.model("Frequest", frequestSchema);

module.exports = Frequest;
