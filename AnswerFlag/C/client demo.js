
var p1BestScoreText = document.querySelector("#p1BestScore");
var p2BestScoreText = document.querySelector("#p2BestScore");
var p1BestCPSText = document.querySelector("#p1BestCPS");
var p2BestCPSText = document.querySelector("#p2BestCPS");
var p1Ready = document.querySelector("#p1Ready");
var p2Ready = document.querySelector("#p2Ready");
var p1Status = document.querySelector("#p1Status");
var p2Status = document.querySelector("#p2Status");
var p1ScoreBar = document.querySelector(".p1Score");
var p2ScoreBar = document.querySelector(".p2Score");
var p1ScoreVal = document.querySelector(".p1ScoreVal");
var p2ScoreVal = document.querySelector(".p2ScoreVal");
var separator = document.querySelector(".separator");
var p1ScoreText = document.querySelector(".p1ScoreText div");
var p2ScoreText = document.querySelector(".p2ScoreText div");
var p1waitBoxText = document.querySelector(".waitBoxText.p1");
var p2waitBoxText = document.querySelector(".waitBoxText.p2");
var p1CPSText = document.querySelector(".p1CPSText");
var p2CPSText = document.querySelector(".p2CPSText");
var p1CPSVal = document.querySelector(".p1CPSText div");
var p2CPSVal = document.querySelector(".p2CPSText div");
var statusMsg = document.querySelector("#statusMsg");
var statusMsg2 = document.querySelector("#statusMsg2");
var barHandler = document.querySelector(".bar-handler");
var keybdHandler = document.querySelector(".keybd-handler");
var keybd = document.querySelector(".keybd");
var p1Box = document.querySelector(".p1Box");
var p2Box = document.querySelector(".p2Box");
var scoresHandler = document.querySelector(".scores-handler");
var p1Text = document.querySelector(".p1Text");
var p2Text = document.querySelector(".p2Text");

var playerID = window.location.href.slice(this.length-2);
var userToken;

var barPos = 0;
var p1BestScore = 0;
var p2BestScore = 0;
var p1Score = 0;
var p2Score = 0;
var p1MaxCPS = 0;
var p2MaxCPS = 0;
var p1BestCPS = 0;
var p2BestCPS = 0;
var p1CPS = 0;
var p2CPS = 0;
var difr = 0;
var p1Difr = 50;
var p2Difr = 50;



window.addEventListener('load', prepare, false);

function prepare() {
    userToken = playerID//localStorage.getItem("userToken");
    userToken == null ? userToken="0" : userToken;

    playerID == "P1" ? (p1Text.textContent+=" (You)",p1waitBoxText.textContent+=" (You)") : (p2Text.textContent+=" (You)",p2waitBoxText.textContent+=" (You)");
    document.title+=" | Player " + playerID.slice(1,2);

    changeMode(1);
    window.addEventListener("keydown", function (ev) {
      if (ev.key == " ") {
        p1ClickDown(ev)
      }
    });
    window.addEventListener("keyup", function (ev) {
      if (ev.key == " ") {
        p1ClickUp(ev)
      }
    });
  }

  function updateBestScores(player, bestScore, bestCPS) {
    if(player == "P1"){
      if(bestScore != "Waiting..."){
        p1BestScore=bestScore;
        p1BestCPS = bestCPS;
        p1BestScoreText.classList.add("online");
        p1BestCPSText.classList.add("online");
        p1Status.classList.add("online");
        p1Status.textContent="Online";
      }
      p1BestScoreText.querySelector("label").textContent=bestScore;
      p1BestCPSText.querySelector("label").textContent=bestCPS;
    }else{
      if(bestScore != "Waiting..."){
        p2BestScore=bestScore;
        p2BestCPS = bestCPS;
        p2BestScoreText.classList.add("online");
        p2BestCPSText.classList.add("online");
        p2Status.classList.add("online");
        p2Status.textContent="Online";
      }
      p2BestScoreText.querySelector("label").textContent=bestScore;
      p2BestCPSText.querySelector("label").textContent=bestCPS;
    }
  }

  var gamemode = 1;
  var game = 1;

  var rooms = [document.querySelector(".waitRoom"), document.querySelector(".playRoom")];

  function changeMode(mode) {
    gamemode = mode;
    for (var x in rooms) {
      rooms[x].style.display = "none";
    }
    switch (true) {
      case (gamemode>=1 && gamemode<2):
        rooms[0].style.display = "";
        break
      case (gamemode>=2):
        rooms[1].style.display = "";
        break
    }
    updateAll();
  }

  function updateAll(){
    switch(gamemode){
      case 1.1:
        p1Ready.classList.add("online");
        p1Ready.textContent="[Ready?]";
        p2Ready.classList.add("online");
        p2Ready.textContent="[Ready?]";
        statusMsg.textContent="Press [Space] to begin."
        spawnAnim(statusMsg,0.2);
    }
  }

  var p1ScoreStep = 0;
  var p2ScoreStep = 0;
  function updateBar() {
    p1ScoreText.innerHTML = p1Score + " Clicks";
    p2ScoreText.innerHTML = p2Score + " Clicks";

    if(playerID == "P1"){
    if(p2Score>p2ScoreStep){
      p2ScoreText.style.animation = "click 0.1s linear"
      setTimeout(function(){
        p2ScoreText.style.animation="";
      },100)
    }
  }else{
    if(p1Score>p1ScoreStep){
      p1ScoreText.style.animation = "click 0.1s linear"
      setTimeout(function(){
        p1ScoreText.style.animation="";
      },100)
    }
  }
  p1ScoreStep=p1Score;
  p2ScoreStep=p2Score;

    difr = (p1Score - p2Score) * 14.2;
    console.log(difr)
    p1Difr = Math.round((difr+500)/10);
    p2Difr = Math.round(0-(difr-500)/10);

    p1ScoreVal.innerHTML = p1Difr + "%";
    p2ScoreVal.innerHTML = p2Difr + "%";
    p1ScoreVal.style.animation = "click 0.1s linear";
    p2ScoreVal.style.animation = "click 0.1s linear";
    setTimeout(function(){
      p1ScoreVal.style.animation="";
      p2ScoreVal.style.animation="";
    }
    ,100)
    difr < -320 ? p1ScoreVal.style.transform=`scaleX(${p1Difr*4.5}%)` : p1ScoreVal.style.transform="scaleX(100%)";
    difr > 320 ? p2ScoreVal.style.transform=`scaleX(${p2Difr*4.5}%)` : p2ScoreVal.style.transform="scaleX(100%)";

    separator.style.left = difr + "px"
    separator.style.right = (0 - difr) + "px";

    p2ScoreBar.style.width = (500 - difr) + "px";
    p1ScoreBar.style.width = (1000 - parseInt(p2ScoreBar.style.width)) + "px";
  }

  function startAnim(){
    statusMsg.textContent="Ready?";
    spawnAnim(statusMsg,1.5);
    setTimeout(function(){
      var itIntv = setInterval(function(){
        it != 0 ? (statusMsg.textContent=it, spawnAnim(statusMsg,0.2), it--) : 
        (changeMode(2.1),CPSCount(),statusMsg.textContent="Go!",spawnAnim(statusMsg,0.2),clearInterval(itIntv))
      },1000);
    },1500);
    let it = 3;
  }

  function winAnim(winner){
    changeMode(3.0);
    keybdHandler.style.opacity = "0";
    p1CPSVal.textContent=p1MaxCPS+" MAX CPS";
    p2CPSVal.textContent=p2MaxCPS+" MAX CPS";
    clearInterval(cpsTimer);

    playerID=="P1" ? sendReq(`best|${userToken}|${p1Score}%${p1MaxCPS}`) : sendReq(`best|${userToken}|${p2Score}%${p2MaxCPS}`);

    if(winner == playerID){
      statusMsg.textContent=`YOU WIN!`;
      statusMsg.style.color = "rgb(0, 185, 0)";
      spawnAnim(statusMsg,0.5);
      playerID=="P1" ? p2Box.style.filter = "grayscale(75%)" : p1Box.style.filter = "grayscale(75%)";
    }else{
      statusMsg.textContent=`YOU LOSE!`;
      statusMsg.style.color = "rgb(180, 0, 0)";
      spawnAnim(statusMsg,0.5);
      playerID=="P1" ? p1Box.style.filter = "grayscale(75%)" : p2Box.style.filter = "grayscale(75%)";
    }
    setTimeout(function(){
      changeMode(3.1);
      statusMsg2.style.display = "block";
      statusMsg2.textContent="Press [Space] to play again.";
      spawnAnim(statusMsg2,0.7);
    },2500)
  }

  var cpsTimer;
  function CPSCount(){
    cpsTimer = setInterval(function(){
      playerID=="P1" ? sendReq(`actualCPS|${playerID}|${p1CPS}`) : sendReq(`actualCPS|${playerID}|${p2CPS}`);
      p1CPS = 0;
      p2CPS = 0;
    },1000);
  }

  function spawnAnim(element, time){
    element.style.animation = "spawn "+time+"s ease-out";
    setTimeout(function(){
      element.style.animation = "none";
    },time*1000);
  }

  var cooldown = false;
  function p1ClickDown(ev) {
    switch (gamemode) {
      case 1.1:
        sendReq(`ready|${playerID}`);
      break;

      case 2.1:
        if(cooldown==false){
        keybd.classList.add("pressed");
        if(playerID == "P1") {
          p1CPS++;
          p1ScoreText.style.animation = "click 0.1s linear"
        }else{
          p2CPS++
          p2ScoreText.style.animation = "click 0.1s linear";
        }
        sendReq(`click|${playerID}`);
        }
        cooldown = true;
        break;

      case 3.1:
        window.location.reload();
        break;
    }
  }

  function p1ClickUp(ev) {
    switch (gamemode) {
      case 2.1:
        cooldown = false;
        keybd.classList.remove("pressed");
        p1ScoreText.style.animation = "";
        p2ScoreText.style.animation = "";
        break;
    }
  }



  var socket;
  const socketURL = 'ws://' + window.location.host + '/server'
  socket = new WebSocket(socketURL);
  socket.onopen = () => {
    socket.send(`req_con|${playerID}|${userToken}`)
  }

  socket.onmessage = e => {
    var serverMsg;
    var dataMsg;
    var data2Msg;
    try{
      serverMsg = e.data.split("|")[0];
      dataMsg = e.data.split("|")[1];
      data2Msg = e.data.split("|")[2];
    }catch(err){};
    console.log(e.data)
    if(serverMsg == "res_newtoken"){
      userToken = dataMsg;
      localStorage.setItem("userToken", userToken);
    }

    if(serverMsg == "res_init"){
      updateBestScores(dataMsg, data2Msg.split(";")[0], data2Msg.split(";")[1]);
      sendReq(`upd|${playerID}`)
    }

    if(serverMsg == "res_gamemode"){
      changeMode(parseFloat(dataMsg));
      console.log(parseFloat(dataMsg))
    }

    if(serverMsg == "res_ping"){
      sendReq(`pong|${playerID}`)
    }

    if(serverMsg == "res_ready"){
      if(dataMsg == "P1"){
        data2Msg == 2 ? (p1Ready.classList.add("ready"),p1Ready.style.animation = "click 0.1s linear",p1Ready.textContent="[Ready]") : "";
      }else{
        data2Msg == 2 ? (p2Ready.classList.add("ready"),p2Ready.style.animation = "click 0.1s linear",p2Ready.textContent="[Ready]") : "";
      }
      setTimeout(function(){
        p1Ready.animation = "none";
        p2Ready.animation = "none";
      }
      ,100)
    }

    if(serverMsg == "res_reset"){
      window.location.reload();
    }

    if(serverMsg == "res_start"){
      changeMode(2);
      startAnim();
    }

    if(serverMsg == "res_updateScores"){
      p1Score=dataMsg;
      p2Score=data2Msg;
      updateBar();
    }
    if(serverMsg == "res_updateCPS"){
      let cpsVal = parseInt(data2Msg);
      if(dataMsg == "P1") {
        p1CPSVal.textContent = data2Msg+" CPS"
        if(cpsVal>p1MaxCPS) p1MaxCPS = cpsVal;
      }else{
        p2CPSVal.textContent = data2Msg+" CPS";
        if(cpsVal>p2MaxCPS) p2MaxCPS = cpsVal;
      }
    }

    if(serverMsg == "res_result"){
      winAnim(dataMsg);
    }
  }

function sendReq(msg){
  socket.send("req_"+msg)
}