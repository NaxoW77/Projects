var mainIntro = document.querySelector(".main-intro-container");
var mainChat = document.querySelector(".main-chat-container");
var chatInput = document.getElementById("chatInput");
var chatMessages = document.querySelector(".main-chat-messages");
var chatButton = document.getElementById("chatButton");
var ttsButton = document.getElementById("ttsButton");
var charImg = document.getElementById("charImg");

var userName = "";
var ttsEnabled = false;

/////////////////////////////////////////////////////



///////////////////REQUESTS/////////////////////

function serverResponse(serverMsg, dataMsg, dataMsg2) {
  if (serverMsg == "res_drop") {
    logOut();
  }

  if (serverMsg == "res_con") {
    setInterval(ping, 5000);
    charIdle();

    if (dataMsg) {
      userName = dataMsg2;
      document.getElementById("username").innerHTML = `${userName}`;
    } else {
      logOut();
    }
  }

  if (serverMsg == "res_pong") {
    if (dataMsg == "ok") {
      pingTest = 0;
      return;
    } else {
      window.location.reload();
    }
  }

  if (serverMsg == "res_history") {
    loadChat(dataMsg2);
  }

  if (serverMsg == "res_storeMessage") {
    storeMessage(dataMsg, dataMsg2);
  }

  if (serverMsg == "res_storeMessageTemp") {
    storeTempMessage(dataMsg, dataMsg2);
  }

  if (serverMsg == "res_execAction") {
    switch (dataMsg) {
      case "SYSTEM_CLOSE_CHAT":
        setTimeout(function () {
          chatInput.disabled = true;
          chatButton.disabled = true;
          setTimeout(closeChat(), 1000);
        }, 1500);
        break;
      case "SYSTEM_RESET":
        setTimeout(function () {
          chatInput.disabled = true;
          chatButton.disabled = true;
          setTimeout(window.location.reload(), 1000);
        }, 1500);
        break;

      case "SYSTEM_ERASEHISTORY":
        chatInput.value = "";
        chatInput.blur();
        chatInput.disabled = true;
        chatButton.disabled = true;
        setTimeout(function () {
          closeChat();
          openChat();
        }, 1500);
        break;
      case "SYSTEM_LOGOUT":
        setTimeout(function () {
          chatInput.disabled = true;
          chatButton.disabled = true;
          setTimeout(logOut(), 1000);
        }, 1500);
        break;
    }
  }

  if (serverMsg == "res_reset") {
    window.location.reload();
  }
}

///////////////////REQUESTS/////////////////////


///////////////////CHAT FUNCTIONS/////////////////////

function openChat() {
  mainIntro.style.animation = "";
  mainIntro.style.animation = "hide 0.3s ease-in-out forwards";
  sendReq("history", token);
  chatInput.focus();
  if (chatMessages.innerHTML == "") {
    storeMessage("", "Hola. ¿En que puedo ayudarte?", 0);
  }

  setTimeout(function () {
    mainIntro.style.animation = "";
    mainChat.style.animation = "show 0.3s ease-in-out forwards";
    mainIntro.style.display = "none";
    mainChat.style.display = "flex";
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 300)
}

function loadChat(data) {
  ttsEnabled = false;
  ttsButton.style.border = "2px solid black";
  if (data.content == null) {
    return;
  }
  if (data.content.length == 0) {
    return;
  }

  var messages = data.content;

  chatMessages.innerHTML = "";
  for (let message of messages) {
    storeMessage(message.msgUser, message.msgBot, 1);
  }
}

function closeChat() {
  ttsEnabled = false;
  ttsButton.style.border = "2px solid black";
  mainChat.style.animation = "";
  mainChat.style.animation = "hide 0.3s ease-in-out forwards";
  chatInput.value = "";
  chatInput.disabled = true;
  chatButton.disabled = true;
  charIdle();
  chatMessages.innerHTML = "";

  setTimeout(function () {
    mainChat.style.animation = "";
    mainIntro.style.animation = "show 0.3s ease-in-out forwards";
    mainIntro.style.display = "flex";
    mainChat.style.display = "none";
  }, 300)
}

function toggleTTS() {
  if (ttsEnabled) {
    ttsEnabled = false
    ttsButton.style.border = "2px solid black";
  } else {
    ttsEnabled = true;
    ttsButton.style.border = "2px solid lime";
  }
}

function ttsRead(message) {
  const voice = 2;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = window.speechSynthesis.getVoices()[voice];
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

///////////////////CHAT FUNCTIONS/////////////////////


///////////////////MESSAGE FUNCTIONS/////////////////////

function sendMessage() {
  var msgInput = chatInput.value.trim();
  if (msgInput == "") {
    return;
  }
  chatInput.value = "";
  chatInput.disabled = true;
  chatButton.disabled = true;
  storeTempMessage(msgInput);
  sendReq("sendMessage", msgInput, token);
}

var defaultTempMsg = "Pensando...";
var tempTime = null;
var tempMsgTime = 500;

function storeTempMessage(userMsg, botMsg) {
  let ttm = tempMsgTime;
  var tempMsgs = document.querySelectorAll(".main-chat-message.temp");
  for (let msg of tempMsgs) {
    msg.remove();
  }
  if (botMsg == null) {
    botMsg = defaultTempMsg;
  } else {
    ttm = 0
  }
  createMessage("user", userMsg, "temp");
  tempTime = setTimeout(function () {
    createMessage("bot", botMsg, "temp");
    charShake();
    if (botMsg != defaultTempMsg) {
      charIdle();
      chatInput.disabled = false;
      chatInput.focus();
      chatButton.disabled = false;
    }
  }, ttm)
}



function storeMessage(userMsg, botMsg, time) {
  clearTimeout(tempTime);
  var tempMsgs = document.querySelectorAll(".main-chat-message.temp");
  for (let msg of tempMsgs) {
    msg.remove();
  }

  if (!time) {
    time = Math.floor(Math.random() * 1000) + 500
  }

  createMessage("user", userMsg);
  createMessage("bot", botMsg);
  if (ttsEnabled) {
    ttsRead(botMsg);
  }

  charIdle();
  chatInput.disabled = false;
  chatInput.focus();
  chatButton.disabled = false;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createMessage(owner, message, temp) {
  if (message == "") {
    return;
  }
  var newMessage = document.createElement("div");

  var fixedMessage = escapeHTML(message).replace(/\n/g, "<br>");
  //var fixedMessage=message.replace(/\n/g, "<br>"); //Caos total

  newMessage.classList.add("main-chat-message", `${owner}`);
  temp == "temp" ? newMessage.classList.add("temp") : "";
  newMessage.innerHTML = `<h1>${owner == "user" ? userName : botName}</h1><div><p>${fixedMessage}</p></div>`;
  owner == "bot" ? newMessage.opacity = 0 : "";
  chatMessages.appendChild(newMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(function () {
    newMessage.opacity = 1;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 250);
}

///////////////////MESSAGE FUNCTIONS/////////////////////

function logOut() {
  redirectTo("/login");
}

function checkToken() {
  sendReq("checkToken", token);
}

function clickSend(ev) {
  if (ev.key == "Enter" && !ev.shiftKey) {
    if (chatInput.value.trim() !== "") {
      sendMessage();
    }
  }
}

function clearHistory() {
  sendReq("clearHistory", token);
  window.location.reload();
}

function ping() {
  if (pingTest == 1) {
    window.location.reload();
    return;
  } else {
    pingTest = 1;
    sendReq("ping", token);
  }
}

function sendReq(...args) {
  if (args[0] != "ping") console.log("→ " + "req_" + JSON.stringify(args));
  if (socket.readyState == socket.CLOSED) {
    window.location.reload();
  }
  socket.send("req_" + JSON.stringify(args));
}