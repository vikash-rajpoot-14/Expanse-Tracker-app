const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  orderid: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
