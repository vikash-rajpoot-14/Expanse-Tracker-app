const SibApiV3Sdk = require("sib-api-v3-sdk");
const Frequest = require("./../models/forgetpasswordrequest");
const User = require("./../models/user");
const bcrypt = require("bcrypt");

let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications["api-key"];
// console.log(process.env.SIB_API_KEY);
apiKey.apiKey = process.env.SIB_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
  email: "vikashraj1490@gmail.com",
  name: "Vikash Rajpoot",
};

exports.ForgetPassword = async (req, res) => {
  try {
    var { email } = req.body;
    const user = await User.findOne({
      email,
    });
    const frequeset = await Frequest.create({
      userId: user._id,
      isActive: true,
    });
    const uuid = frequeset.id;
    const recievers = [
      {
        email: email,
      },
    ];
    const data = await apiInstance.sendTransacEmail({
      sender,
      to: recievers,
      subject: "email for forget password",
      htmlContent: `<p>this link is valid for single use only !<p><a href={{params.link}}{{params.uuid}} >{{params.link}}{{params.uuid}} !</a>`,
      params: {
        link: "http://localhost:3000/user/forgotpassword/",
        uuid: uuid,
      },
    });
    console.log(
      "API called successfully. Returned data: " + JSON.stringify(data)
    );
    return res.status(200).json({
      status: "success",
      data: "message has been sent",
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      status: "fail",
      data: error,
    });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const uuid = req.params.id;
    const request = await Frequest.findOne({
      id: uuid,
    });
    if (request.isActive) {
      await Frequest.findOneAndUpdate({ id: request.id }, { isActive: false });
      return res.redirect(
        "http://localhost:3000/Forgotpassword/passwordform.html"
      );
    } else {
      throw new Error("cannot use same link twice");
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      data: error.message,
    });
  }
};

exports.setforgotpassword = async (req, res) => {
  try {
    const { password } = req.body;
    const id = req.params.id;
    console.log(id);
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    const user = await User.findByIdAndUpdate(
      { _id: id },
      {
        password: hashed,
      }
    );
    if (user) {
      return res.redirect("http://localhost:3000/Login/login.html");
    }
    return res.status(404).json({
      status: "user not found",
      data: err.message,
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      data: err.message,
    });
  }
};
