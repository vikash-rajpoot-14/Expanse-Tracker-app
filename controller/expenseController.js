const Expense = require("./../models/expense");
const User = require("./../models/user");
const Download = require("./../models/downloadfile");

const AWS = require("aws-sdk");

function UploadToS3(data, file) {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

    let s3bucket = new AWS.S3({
      accessKeyId: AWS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY,
    });

    var params = {
      Bucket: BUCKET_NAME,
      Key: file,
      Body: data,
      ACL: "public-read",
    };
    // console.log("params", params);
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, (err, data) => {
        if (err) {
          console.log("Something went wrong", err);
          reject(err);
        } else {
          // console.log("success", data);
          resolve(data.Location);
        }
      });
    });
  } catch (err) {
    res.status(500).json({
      error: err,
      fileUrl: "",
    });
  }
}

exports.FileDownload = async (req, res) => {
  try {
    const expense = await Expense.find({ userId: req.user._id });
    // console.log("expense", expense);
    const StringifyExpense = JSON.stringify(expense);
    const userId = req.user._id;
    const filename = `Expense-${userId}-${new Date()}.txt`;
    const fileUrl = await UploadToS3(StringifyExpense, filename);
    await Download.create({
      userId: req.user,
      fileUrl: fileUrl,
    });
    res.status(201).json({
      success: true,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

exports.PostExpense = async (req, res) => {
  try {
    if (
      req.body.expense.length < 1 ||
      req.body.expense === undefined ||
      req.body.description.length < 1 ||
      req.body.description === undefined ||
      req.body.category.length < 1 ||
      req.body.category === undefined
    ) {
      return res.status(204).json({
        status: "fail",
        msg: "Enter all fields",
      });
    }
    const expense = await Expense.create({
      expense: req.body.expense,
      description: req.body.description,
      category: req.body.category,
      userId: req.user._id,
    });
    let totalExpense = Number(req.user.totalExpense) + Number(expense.expense);
    await User.findByIdAndUpdate(
      {
        _id: req.user._id,
      },
      {
        totalExpense: totalExpense,
      }
    );
    return res.status(201).json({
      status: "success",
      data: expense,
    });
  } catch (err) {
    return res.status(500).json({
      status: "success",
      data: err.message,
    });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    // console.log(req.user);
    const expenses = await Expense.find({ userId: req.user._id });
    // console.log("expsens", expenses);
    return res.status(200).json({
      status: "success",
      data: expenses,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      data: err.message,
    });
  }
};

exports.deleteExpenses = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete({
      _id: req.params.id,
    });
    // console.log("object", expense);
    let totalExpense = Number(req.user.totalExpense) - Number(expense.expense);
    await User.findByIdAndUpdate(
      {
        _id: req.user._id,
      },
      {
        totalExpense: totalExpense,
      }
    );
    return res.status(202).json({
      status: "success",
      data: "deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "success",
      msg: error.message,
    });
  }
};

exports.allExpenses = async (req, res) => {
  try {
    const expenses = await User.find({ _id: req.user._id })
      .select("_id name totalExpense")
      .sort({ totalExpense: "asc", test: -1 });

    return res.status(200).json({
      status: "success",
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message,
    });
  }
};

exports.DownloadTable = async (req, res) => {
  try {
    const response = await Download.find({ userId: req.user._id });
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error,
    });
  }
};

exports.getPageExpenses = (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 1;
  const ITEM_PER_PAGE = limit;
  let totalCounts;
  Expense.count({ userId: req.user._id })
    .then((total) => {
      totalCounts = total;
      const offset = (page - 1) * ITEM_PER_PAGE;
      const limit = ITEM_PER_PAGE;
      return Expense.find({
        userId: req.user._id,
      })
        .skip(offset)
        .limit(limit);
    })
    .then((expense) => {
      return res.status(200).json({
        CURRENT_PAGE: page,
        HAS_NEXT_PAGE: ITEM_PER_PAGE * page < totalCounts,
        NEXT_PAGE: page + 1,
        HAS_PREVIOUS_PAGE: page > 1,
        PREVIOU_PAGE: page - 1,
        LAST_PAGE: Math.ceil(totalCounts / ITEM_PER_PAGE),
        data: expense,
      });
    })
    .catch((err) => {
      return res.status(200).json({
        status: "fail",
        error: err,
      });
    });
};
