const express = require("express");
const controller = require("../controller/expenseController");
const authController = require("./../controller/authController");
const router = express.Router();

router
  .route("/add-expense")
  .post(authController.authenticate, controller.PostExpense);
router.route("/").get(authController.authenticate, controller.getExpenses);
router
  .route("/paginate")
  .get(authController.authenticate, controller.getPageExpenses);
router
  .route("/delete-expenses/:id")
  .delete(authController.authenticate, controller.deleteExpenses);
router
  .route("/allExpenses")
  .get(authController.authenticate, controller.allExpenses);

router
  .route("/download")
  .get(authController.authenticate, controller.FileDownload);

router
  .route("/downloadtable")
  .get(authController.authenticate, controller.DownloadTable);

module.exports = router;
