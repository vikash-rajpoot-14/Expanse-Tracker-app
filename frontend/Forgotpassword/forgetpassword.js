const token = localStorage.getItem("token");

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

async function showForgot(e) {
  try {
    e.preventDefault();
    const obj = {
      email: e.target.email.value,
    };
    const user = await axios.post(
      "http://localhost:3000/user/forgotpassword",
      obj
    );
    e.target.email.value = "";
    if (user.status == 200) {
      document.getElementById("error").innerHTML =
        "check your mail for reset password link";
      setTimeout(() => {
        document.getElementById("error").innerHTML = "";
        e.target.email.value = "";
      }, 2000);
    }
  } catch (error) {
    document.getElementById("error").innerHTML = "enter valid email address";
    setTimeout(() => {
      document.getElementById("error").innerHTML = "";
      e.target.email.value = "";
    }, 1000);
  }
}

async function showPassword(e) {
  e.preventDefault();
  try {
    const decode = parseJwt(token);
    // console.log(decode);
    const id = decode.id;
    console.log("objectid", id);
    password = e.target.password.value;
    cpassword = e.target.cpassword.value;
    console.log(id);
    if (cpassword === password) {
      const obj = {
        password,
      };
      const user = await axios.post(
        `http://localhost:3000/user/setforgotpassword/${id}`,
        obj
      );
      if (user) {
        console.log(user);
        e.target.password.value = "**************";
        e.target.cpassword.value = "*************";
        document.getElementById("error").innerHTML =
          "Your password has been updated successfully !";
        setTimeout(() => {
          // window.location.href = "http://localhost:3000/Login/login.html";
        }, 1000);
      }
    } else {
      document.getElementById("error").innerHTML =
        "Password and confirm password should be same !";
      setTimeout(() => {
        document.getElementById("error").innerHTML = "";
        e.target.password.value = "";
        e.target.cpassword.value = "";
      }, 2000);
    }
  } catch (error) {
    document.getElementById("error").innerHTML = "enter valid email address";
    setTimeout(() => {
      document.getElementById("error").innerHTML = "";
      e.target.email.value = "";
    }, 1000);
  }
}
