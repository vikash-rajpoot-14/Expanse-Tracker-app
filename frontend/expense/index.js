const ul = document.getElementById("list");
const error = document.getElementById("error");
const leaderboard = document.getElementById("leaderboard");
const listboard = document.getElementById("listboard");
const leaderbtn = document.getElementById("leader-btn");
const download = document.getElementById("download");
const fileItems = document.getElementById("file-items");
const pagination = document.getElementById("pagination");
const rowperPage = document.getElementById("pages");
leaderboard.style.display = "none";
fileItems.style.display = "none";
listboard.style.display = "none";
leaderbtn.style.display = "none";
download.style.display = "none";
let token = localStorage.getItem("token");
let decode = parseJwt(token);
// let page = 1;
rowperPage.value = localStorage.getItem("rowperPage");

showdata();
// console.log(month());
download.addEventListener("click", async function downloadFile(e) {
  try {
    let token = localStorage.getItem("token");
    const response = await axios({
      method: "get",
      url: "http://localhost:3000/expenses/download",
      headers: {
        authorization: "Bearer " + `${token}`,
      },
    });
    // console.log(response);
    if (response.status === 201) {
      //the bcakend is essentially sending a download link
      //  which if we open in browser, the file would download
      var a = document.createElement("a");
      a.href = response.data.fileUrl;
      a.download = "myexpense.csv";
      a.click();
    } else {
      throw new Error(response.data.message);
    }

    // const url = window.URL.createObjectURL(new Blob([response.data]));
    // const link = document.createElement("a");
    // link.href = url;
    // link.setAttribute("download", "data.csv");
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // window.URL.revokeObjectURL(url);
    showdata();
  } catch (error) {
    console.error(error);
  }
});

rowperPage.onchange = () => {
  localStorage.setItem("rowperPage", rowperPage.value);
  showdata();
};

function month(d) {
  const now = new Date(d);
  const monthName = now.toLocaleString("default", { month: "long" }); // Get the month name using toLocaleString()
  return monthName;
}

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

async function showHandler(e) {
  e.preventDefault();
  const obj = {
    expense: e.target.expense.value,
    description: e.target.description.value,
    category: e.target.category.value,
  };
  const expense = await axios.post(
    "http://localhost:3000/expenses/add-expense",
    obj,
    {
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  // console.log("object", expense);
  if (expense.status === 204) {
    error.innerHTML = "Enter all fields";
    setTimeout(() => {
      error.innerHTML = "";
    }, 1000);
  }
  (e.target.expense.value = ""),
    (e.target.description.value = ""),
    (e.target.category.value = "");
  showdata();
}

async function showdata() {
  // localStorage.setItem("rowperpage", rowperPage.value);
  let token = localStorage.getItem("token");
  const decode = parseJwt(token);
  if (decode.ispremiumuser) {
    buttonChange();
  }
  const page = 1;
  const limit = localStorage.getItem("rowperPage");
  const expenses = await axios.get(
    `http://localhost:3000/expenses/paginate?page=${page}&limit=${limit}`,
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  const { data, ...pageData } = expenses.data;
  listExpenses(data);
  showPagination(pageData);
}

async function deleteData(id) {
  await axios.delete(`http://localhost:3000/expenses/delete-expenses/${id}`, {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + `${token}`,
    },
  });
  showdata();
}

document.getElementById("rzp-button1").onclick = async function (e) {
  const response = await axios.get(
    "http://localhost:3000/payment/purchasepremiumship",
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  var options = {
    key: response.data.key_id, // Enter the Key ID generated from the Dashboard
    order_id: response.data.order.orderid, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    theme: {
      color: "#3399cc",
    },
    handler: async function (response) {
      const updatedData = await axios.post(
        "http://localhost:3000/payment/updatetransactionstatus",
        {
          status: "SUCCESS",
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
        },
        {
          headers: {
            "Content-type": "application/json",
            authorization: "Bearer " + `${token}`,
          },
        }
      );
      localStorage.setItem("token", JSON.stringify(updatedData.data.token));
      alert("you are a premium user now");
      buttonChange();
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", async function (response) {
    await axios.post(
      "http://localhost:3000/payment/updatetransactionstatus",
      {
        status: "FAILED",
        order_id: response.error.metadata.order_id,
        payment_id: response.error.metadata.payment_id,
      },
      {
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + `${token}`,
        },
      }
    );
    alert(response.error.reason);
  });
  e.preventDefault();
};

leaderbtn.onclick = function leader() {
  leaderboard.style.display = "block";
  fileItems.style.display = "block";
  listboard.style.display = "block";
  download.style.display = "block";
  leaderboardTableData();
};

async function buttonChange() {
  const premiumButton = document.getElementById("rzp-button1");
  premiumButton.innerHTML = "you are a premium user now";
  premiumButton.setAttribute("disabled", "");
  leaderbtn.style.display = "block";
  download.style.display = "block";
  leaderboardTableData();
}

async function leaderboardData() {
  const response = await axios.get(
    "http://localhost:3000/expenses/allExpenses",
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + `${token}`,
      },
    }
  );
  console.log(response);
  // console.log(response.data.data);
  let arr = response.data.data;
  // for (let i = 0; i < arr.length; i++) {
  //   arr[i].expenses = arr[i].expenses.reduce((a, b) => a + b.expense * 1, 0);
  // }
  // arr.sort((a, b) => b.expenses - a.expenses);
  let listData = "";
  if (arr.length < 1) {
    listboard.innerHTML = listData;
  } else {
    arr.map((expense) => {
      listData += '<li class="list-item">';
      listData += `Name :-${expense.name}   Totalexpenses :-${
        expense.totalExpense * 1
      }  `;
      listData += "</li>";
      listboard.innerHTML = listData;
    });
  }
}

async function leaderboardTableData() {
  const response = await axios.get("http://localhost:3000/expenses", {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + `${token}`,
    },
  });
  let expenses = response.data.data;
  let monthArr = [...expenses];
  // console.log(monthArr);
  let dataarr = [];
  for (let i = 0; i < 12; i++) {
    dataarr[i] = monthArr.filter(
      (item) => item.createdAt.slice(1, 10).split("-")[1] * 1 === i + 1
    );
  }
  // console.log(dataarr);
  let arr = [...expenses];

  const now = new Date(arr[0].createdAt);
  const year = now.getFullYear();
  const monthnumber = now.getMonth();
  let cmonth = String(monthnumber + 1);
  cmonth = "0" + cmonth;
  // const month = arr[0].createdAt.slice(0, 10).split("-")[1];
  arr = arr.filter(
    (expense) => expense.createdAt.slice(0, 10).split("-")[1] === cmonth
  );
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSaving = 0;
  let listData = "";
  listData += `<h2>${month(arr[0].createdAt)} ${year}</h2>`;
  listData += "<table>";
  listData +=
    "<tr><th>Date</th><th>Description</th><th>Category</th><th>Income</th><th>Expenses</th></tr>";
  if (arr.length < 1) {
    listData += "</table>";
    listboard.innerHTML = listData;
  } else {
    arr.map((expense) => {
      listData += '<tr class="table-item">';
      if (expense.category === "salary") {
        totalIncome += expense.expense * 1;
        listData += `<th>${expense.createdAt.slice(0, 10)}</th><th>${
          expense.description
        }</th><th>${expense.category}</th><th>${
          expense.expense
        }.00</th><th>00.00</th> `;
      } else {
        totalExpense += expense.expense * 1;
        listData += `<th>${expense.createdAt.slice(0, 10)}</th><th>${
          expense.description
        }</th><th>${expense.category}</th><th>00.00</th><th>${
          expense.expense
        }.00</th> `;
      }
      listData += "</tr>";
    });
    totalSaving = totalIncome - totalExpense;
    listData += `<tr><th></th><th></th><th></th><th>${totalIncome}.00</th><th>${totalExpense}.00</th></tr>`;
    listData += `<tr><th></th><th></th><th></th><th style= "color : green ; width:80px">$ ${totalIncome}.00</th><th style= "color : red ; width:60px">$ ${totalExpense}</th></tr>`;
    listData += `<table style = "width: 80%;"><tr><th style= "color : blue; text-align: right; ">Total Saving :- $ ${totalSaving}.00</th></tr></table>`;
    listData += "</table>";
    // mothly table
    let finalyearlyincome = 0;
    let finalyearlyExpense = 0;
    listData += "<h3>Yearly Report</h3>";
    listData += "<table>";
    listData +=
      "<tr><th>Month</th><th>Income</th><th>Expense</th><th>Saving</th></tr>";
    dataarr.map((item) => {
      let totalMonthlySaving = 0;
      if (item.length > 0) {
        let totalMothlyExpense = 0;
        let totalMothlyIncome = 0;
        item.forEach((cv) => {
          if (cv.category === "salary") {
            totalMothlyIncome += cv.expense * 1;
          } else {
            totalMothlyExpense += cv.expense * 1;
          }
        });
        finalyearlyincome += totalMothlyIncome;
        finalyearlyExpense += totalMothlyExpense;
        totalMonthlySaving = totalMothlyIncome - totalMothlyExpense;
        listData += `<tr><th>${month(
          item[0].createdAt
        )}</th><th> ${totalMothlyIncome}.00</th><th>${totalMothlyExpense}.00</th><th> ${totalMonthlySaving}.00</th></tr>`;
      } else {
        listData += "";
      }
    });

    listData += `<tr><th></th><th style= "color : green">$ ${finalyearlyincome}.00</th><th style= "color : red">$ ${finalyearlyExpense}.00</th><th style= "color : blue">$ ${
      finalyearlyincome - finalyearlyExpense
    }.00</th></tr>`;
    listData += "</table>";
    // notes table
    listData += `<h3>Notes Report ${year}</h3>`;
    listData += "<table>";
    listData += "<tr><th>Date</th><th>Notes</th></tr>";
    listData += "<tr><th>02-04-2023</th><th>have to go to doctor</th></tr>";
    listData += "<tr><th>06-04-2023</th><th>meet at sharpner </th></tr>";
    listData += "</table>";
    listboard.innerHTML = listData;
  }

  const downloadtable = await axios({
    method: "get",
    url: "http://localhost:3000/expenses/downloadtable",
    headers: {
      authorization: "Bearer " + `${token}`,
    },
  });
  console.log("downloadtable", downloadtable);
  //download table
  let list = "";
  list += `<h3>Download Files</h3>`;
  list += "<table >";
  list += `<tr><th>Date</th><th>FileUrl</th></tr>`;
  if (downloadtable.data.data.length < 1) {
    list += "</table>";
  } else {
    downloadtable.data.data.map((item) => {
      list += `<tr><th>${item.createdAt.slice(0, 10)}</th><th>${
        item.fileUrl
      }</th>`;
    });
    list += "</table>";
  }
  fileItems.innerHTML = list;
  // showdata();
}

function getExpenses(page) {
  const token = localStorage.getItem("token");
  const limit = localStorage.getItem("rowperPage");
  axios
    .get(
      `http://localhost:3000/expenses/paginate?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + `${token}`,
        },
      }
    )
    .then((res) => {
      const { data, ...pageData } = res.data;
      listExpenses(data);
      showPagination(pageData);
    });
}

function listExpenses(data) {
  let listData = "";
  if (data.length < 1) {
    ul.innerHTML = listData;
  } else {
    data.map((expense) => {
      listData += '<li class="list">';
      listData += ` ${expense.expense} ${expense.description} ${expense.category}   `;
      listData +=
        "<button class='btn-delete' onclick='deleteData(`" +
        expense._id +
        "`)'>delete</button> ";
      listData += "</li>";
    });
    ul.innerHTML = listData;
  }
}

function showPagination({
  CURRENT_PAGE,
  HAS_NEXT_PAGE,
  HAS_PREVIOUS_PAGE,
  LAST_PAGE,
  NEXT_PAGE,
  PREVIOU_PAGE,
}) {
  pagination.innerHTML = "";
  if (HAS_PREVIOUS_PAGE) {
    const btn2 = document.createElement("button");
    btn2.innerHTML = PREVIOU_PAGE;
    btn2.addEventListener("click", () => getExpenses(PREVIOU_PAGE));
    pagination.appendChild(btn2);
  }
  const btn3 = document.createElement("button");
  btn3.innerHTML = CURRENT_PAGE;
  btn3.addEventListener("click", () => getExpenses(CURRENT_PAGE));
  pagination.appendChild(btn3);

  if (HAS_NEXT_PAGE) {
    const btn1 = document.createElement("button");
    btn1.innerHTML = NEXT_PAGE;
    btn1.addEventListener("click", () => getExpenses(NEXT_PAGE));
    pagination.appendChild(btn1);
  }
}
