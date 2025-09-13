///////////////////VARIABLES////////////////////

var socket;
const socketURL = 'ws://' + window.location.host + '/server'
socket = new WebSocket(socketURL);
var pingTest = 0;
var loginModalTime = 3000;
var botName = "TINA";
var pageName = `${botName} | ${document.title}`;
document.title = pageName;
document.body.style.animation = "start 0.15s ease-in-out forwards";

var charIdleAnim = "idleAnim 3s linear infinite";
var charShakeAnim = "shakeAnim 1.3s linear infinite";

function charIdle() {
  charImg.setAttribute("src", "../img/Tinaaccion.png");
  setTimeout(function() {
  charImg.style.animation = charIdleAnim;
  charImg.setAttribute("src", "../img/Tinanormal.png");
  }, 1000);
}
function charShake() {
  charImg.style.animation = charShakeAnim;
  charImg.setAttribute("src", "../img/Tinanormal.png");
}

var token = localStorage.getItem("token") ? localStorage.getItem("token") : "";

///////////////////VARIABLES////////////////////


////////////////////SERVER////////////////////

socket.onopen = () => {
  if (document.title == `${botName} | Página principal`) {
    sendReq("con", token);
  } else {
    if (token != "") {
      sendReq("logout", localStorage.getItem("token"));
    }
    localStorage.removeItem("token");
    logName.value = "";
    logPass.value = "";
    sendReq("con");
  }
}

socket.onmessage = e => {
  console.log("← " + e.data)
  var args = "";
  var serverMsg = "";
  var dataMsg = "";
  var dataMsg2 = "";
  try {
    args = JSON.parse(e.data.slice(4));
    serverMsg = "res_" + args[0] || "";
    dataMsg = args[1] || "";
    dataMsg2 = args[2] || "";
  } catch (err) {
    console.error(err);
  };
  if (serverMsg != "res_pong") console.log("← " + e.data)
  serverResponse(serverMsg, dataMsg, dataMsg2);
}

////////////////////SERVER////////////////////



////////////////////FUNCTIONS////////////////////
function redirectTo(url) {
  if (socket.readyState == socket.CLOSED) {
    window.location.reload();
  }
  videoBG.style.animation = "bgOut 0.1s ease-in-out forwards";
  document.body.style.animation = "exit 0.15s ease-in-out forwards";
  setTimeout(() => {
    window.location.href = url;
  }, 150);
}

function sendReq(...args) {
  console.log("→ " + "req_" + JSON.stringify(args))
  if (socket.readyState == socket.CLOSED) {
    window.location.reload();
  }
  socket.send("req_" + JSON.stringify(args));
}
////////////////////FUNCTIONS////////////////////