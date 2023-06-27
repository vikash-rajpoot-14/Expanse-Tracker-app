const Razorpay = require("razorpay");
const Order = require("./../models/order");
const User = require("./../models/user");
const jwt = require("jsonwebtoken");

const signToken = (id, name, ispremiumuser) => {
  return jwt.sign({ id, name, ispremiumuser }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });
};

exports.purchasepremiumship = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEYID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    rzp.orders.create({ amount: 5000, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      Order.create({
        userId: req.user,
        orderid: order.id,
        status: "PENDING",
      })
        .then((order) => {
          return res
            .status(201)
            .json({ user: req.user, order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    });
  } catch (error) {
    return res.status(500).json({ msg: "something went wrong", error });
  }
};

exports.updatetransactionstatus = async (req, res) => {
  // console.log(req.body);
  const { order_id, payment_id, status } = req.body;
  try {
    const values = await Promise.all([
      Order.findOneAndUpdate(
        { orderid: order_id },
        { status: status, paymentId: payment_id }
      ),
      User.findByIdAndUpdate({ _id: req.user._id }, { ispremiumuser: true }),
    ]);
    // console.log(values[1]._id, values[1].name, values[1].ispremiumuser);
    const token = signToken(
      values[1]._id,
      values[1].name,
      values[1].ispremiumuser
    );
    // console.log("token", token);
    return res.status(202).json({
      status: status,
      message: `TRANSACTION ${status}`,
      token,
    });
  } catch (error) {
    Order.findOneAndUpdate({ orderid: order_id }, { status: "FAIL" });
    return res.status(500).json({
      status: "fail",
      message: `TRANSACTION ${status}`,
      error,
    });
  }
};
