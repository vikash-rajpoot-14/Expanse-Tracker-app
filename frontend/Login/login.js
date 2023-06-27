const error = document.getElementById("error");

async function showHandler(e) {
  e.preventDefault();
  try {
    const obj = {
      email: e.target.email.value,
      password: e.target.password.value,
    };
    const user = await axios.post("http://localhost:3000/user/login", obj);
    if (user.status === 200) {
      error.innerHTML = "login successful";
      localStorage.setItem("token", JSON.stringify(user.data.token));
      window.location.href = "http://localhost:3000/expense/index.html";
    }
  } catch (e) {
    // console.log(e);
    if (e.response !== undefined) {
      error.innerHTML = "Email does not exist";
    }
    error.innerHTML = e.response.data.msg;
  }
}
