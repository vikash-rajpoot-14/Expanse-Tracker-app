const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
// const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
//.env
dotenv.config({ path: `${__dirname}/config.env` });

//database
const PORT = process.env.PORT || 5000;
//routes
const UserRoutes = require("./routes/user");
const ExpenseRoutes = require("./routes/expense");
const PaymentRoutes = require("./routes/razorpay");

const app = express();

app.use(bodyParser.json());

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/user", UserRoutes);
app.use("/expenses", ExpenseRoutes);
app.use("/payment", PaymentRoutes);
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `frontend/${req.url}`));
});
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `frontend/Login/login.html`));
});

const DB = process.env.DB.replace("<password>", process.env.DB_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("connected to database");
  app.listen(PORT, () => {
    console.log(`litsening on http://localhost:${PORT}`);
  });
});
