var logName = document.getElementById("logName");
var logLastName = document.getElementById("logLastName");
var logbDate = document.getElementById("logbDate");
var logTelf = document.getElementById("logTelf");
var logEmail = document.getElementById("logEmail");
var logPass = document.getElementById("logPass");
var statusMsg = document.getElementById("statusMsg");
var subBtn = document.getElementById("subBtn");
var swBtn = document.getElementById("swBtn");


var inputs = document.getElementsByTagName("input");
inputs[0].focus();
for (let element of inputs) {
  element.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      subBtn.click();
    }
  }, false);
}

function checkLogin() {
  if (logName.value == "" || logPass.value == "") {
    showError("Por favor, completa todos los campos.");
  } else {
    var userInfo = {
      name: logName.value,
      pass: logPass.value
    };
    sendReq("login", userInfo)
  }
}

function checkRegister() {
  for (let element of inputs) {
    if (element.value == "") {
      showError("Por favor, completa todos los campos.");
      return;
    }
  }
  if (logName.value.length < 2) {
    showError("El nombre debe tener al menos 2 caracteres.", [logName]);
    return;
  }
  if (logLastName.value.length < 2) {
    showError("El apellido debe tener al menos 2 caracteres.", [logLastName]);
    return;
  }

  if (logEmail.value.split("@").length < 2) {
    showError("El correo debe ser válido.", [logEmail]);
    return;
  } else if (logEmail.value.split("@").map(x => x.length).includes(0)) {
    showError("El correo debe ser valido.", [logEmail]);
    return;
  }

  if (logPass.value.length < 8) {
    showError("La contraseña debe tener al menos 8 caracteres.", [logPass]);
    return;
  }


  var userInfo = {
    name: logName.value,
    lastName: logLastName.value,
    bDate: logbDate.value,
    email: logEmail.value,
    pass: logPass.value
  };
  sendReq("register", userInfo)
  return;
}

var showAnimTime = 0.3;
var animTime = 2.5;
var animJump = 0.5;
var hideAnimTime = showAnimTime+animTime;

var errorAnim =
`show ${showAnimTime}s ease-in-out forwards,` +
`errorAnim ${animJump}s infinite linear alternate ${showAnimTime}s,` +
`hide ${showAnimTime}s ease-in-out forwards ${hideAnimTime}s`;
function showError(msg, elements) {
  if (!elements) {
    for (let el of inputs) {
      el.style.animation="";
      el.style.animation = errorAnim;
    }
  } else if (elements.length > 0) {
    for (let el of elements) {
      el.style.animation="";
      el.style.animation = errorAnim;
    }
  }
  for (let el of inputs) {
    el.disabled = true;
  }
  subBtn.disabled = true;
  swBtn.disabled = true;
  statusMsg.style.animation="";
  statusMsg.style.animation = errorAnim;
  statusMsg.querySelector("h2").textContent = msg;
  setTimeout(function () {
    subBtn.disabled = false;
    swBtn.disabled = false;
    for (let el of inputs) {
      el.style.animation = "";
      el.disabled = false;
    }
    statusMsg.querySelector("h2").textContent = "";
    statusMsg.style.animation = "";
  }, loginModalTime);
}

var successAnim =
`show ${showAnimTime}s ease-in-out forwards,` +
`successAnim ${animJump}s infinite linear alternate ${showAnimTime}s,` +
`hide ${showAnimTime}s ease-in-out forwards ${hideAnimTime}s`;
function showSuccess(msg) {
  subBtn.disabled = true;
  swBtn.disabled = true;
  for (let element of inputs) {
    element.disabled = true;
    element.value = "";
  }
  statusMsg.style.animation = successAnim
  statusMsg.querySelector("h2").textContent = msg;
  setTimeout(function () {
    subBtn.disabled = false;
    swBtn.disabled = false;
    logName.disabled = false;
    logPass.disabled = false;
    statusMsg.querySelector("h2").textContent = "";
  }, loginModalTime);
}



function serverResponse(serverMsg, dataMsg, dataMsg2) {
  if (serverMsg == "res_login") {
    if (dataMsg == "ok") {
      localStorage.setItem("token", dataMsg2);
      showSuccess("Sesión iniciada correctamente. Redirigiendo...");
      setTimeout(function () {
        redirectTo("/main");
      }, loginModalTime);
    } else if (dataMsg == "error") {
      showError(`${dataMsg2}`, []);
    }
  }

  if (serverMsg == "res_register") {
    if (dataMsg == "ok") {
      showSuccess("Usuario creado correctamente. Redirigiendo...");
      setTimeout(function () {
        redirectTo("/login");
      }, loginModalTime);
    } else if (dataMsg == "error") {
      showError(`${dataMsg2}`, []);
    }
  }

}