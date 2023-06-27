const express = require("express");
const controller = require("../controller/paymentController");
const authController = require("../controller/authController");
const router = express.Router();

router
  .route("/purchasepremiumship")
  .get(authController.authenticate, controller.purchasepremiumship);
router
  .route("/updatetransactionstatus")
  .post(authController.authenticate, controller.updatetransactionstatus);

module.exports = router;
