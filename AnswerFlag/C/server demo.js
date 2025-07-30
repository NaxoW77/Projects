const express = require('express');
const bodyParser = require('body-parser');
const ws = new require('ws');
const enableWs = require('express-ws')
const app = express();
enableWs(app)
const path = require('path');
const fs = require('fs')

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "ejs"));

app.use(bodyParser.urlencoded({ extended: true }));

var player=2;
app.get('/', (req, res) => {
    player == 1 ? player = 2 : player = 1; 
    console.log(player)
    res.render("redirect",{player:player})
})

app.get('/P1', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/P2', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client.js'))
})

app.get('/css', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'style.css'))
})

///////////////////////////////////////
const clients = new Set();
var players = ["P1|0","P2|0"];
var playerStates = ["P1|0","P2|0"];
var pScores=[0,0]
var win = 0;

app.ws('/server', (ws, req) => {
  clients.add(ws);
  ws.on('message', msg => {
    console.log(msg, "←");
    var clientMsg;
    var dataMsg;
    var data2Msg;
    try {
      clientMsg = msg.split("|")[0];
      dataMsg = msg.split("|")[1];
      data2Msg = msg.split("|")[2];
    }catch(err){};
    if (clientMsg == "req_con") {
      let userID = dataMsg;
      let userToken = data2Msg;

      if(userToken == "0"){
        userToken = createToken();
        ws.send(`res_newtoken|${userToken}`);
      }
      const scores = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
      for(x in scores.players){
        if(scores.players[x].id == userToken){
          players[parseInt(userID.slice(1,2))-1] = `${userID}|${x}`;
          break;
        }
      }
      console.log(players)
        for(let client of clients){
          for(z in players) {
        client.send(`res_init|${players[z].split("|")[0]}|${scores.players[players[z].split("|")[1]].score};${scores.players[players[z].split("|")[1]].cps}`);
        }
        client.send(`res_ping`);
      }
    }

    if (clientMsg == "req_pong") {
      let userID = dataMsg;
      playerStates[parseInt(userID.slice(1,2))-1] = `${userID}|1`
      console.log(playerStates);

      if(playerStates[0].split("|")[1] == 1 && playerStates[1].split("|")[1] == 1){
        sendRes(`gamemode|1.1`);
      }
    }
    if (clientMsg == "req_ready") {
      let userID = dataMsg;
      playerStates[parseInt(userID.slice(1,2))-1] = `${userID}|2`
      console.log(playerStates);
      for(let client of clients){
        for(c in playerStates){
          client.send(`res_ready|${playerStates[c].split("|")[0]}|${playerStates[c].split("|")[1]}`);
        }
        client.send(`res_ready`);
      }

      if(playerStates[0].split("|")[1] == 2 && playerStates[1].split("|")[1] == 2){
        sendRes(`start`);
      }
    }

    if (clientMsg == "req_upd") {
      let offlineUser = dataMsg=="P1" ? "P2" : "P1";
      players[parseInt(offlineUser.slice(1,2))-1] = `${offlineUser}|0`;
    }

    if (clientMsg == "req_click") {
      pScores[parseInt(dataMsg.slice(1))-1]+=1;
      sendRes(`updateScores|${pScores[0]}|${pScores[1]}`);
      checkWin();
    }

    if (clientMsg == "req_actualCPS") {
      sendRes(`updateCPS|${dataMsg}|${data2Msg}`);
    }

    if(clientMsg == "req_best"){
      let newDataScores = data2Msg.split("%");
      let newScore = parseInt(newDataScores[0]);
      let newCPS = parseInt(newDataScores[1]);
      const scores = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
      for(z in scores.players){
        if(scores.players[z].id == dataMsg){
          let oldScore = parseInt(scores.players[z].score);
          let oldCPS = parseInt(scores.players[z].cps);
          if(oldScore < newScore && !isNaN(newScore)) scores.players[z].score = newScore;
          if(oldCPS < newCPS && !isNaN(newCPS)) scores.players[z].cps = newCPS;
          break;
        }
      }
      fs.writeFileSync(path.resolve(__dirname, 'best.json'),JSON.stringify(scores));
    }

    if (msg == "req_reset") {
      sendRes(`reset`);
    }
  })

  ws.on('close', function () {
    clients.delete(ws);
    players = ["P1|0","P2|0"];
    playerStates = ["P1|0","P2|0"];
    pScores=[0,0];
    win=0;
    sendRes(`reset`);
  });
})

function checkWin(){
  if(win==0){
  var recP1Score = pScores[0];
  var recP2Score = pScores[1];
  console.log(recP1Score,recP2Score)
  switch(true){
    case recP1Score >= recP2Score+35:
      sendRes(`result|P1`);
      win=1;
      break;
      case recP2Score >= recP1Score+35:
      sendRes(`result|P2`);
      win=1;
      break;
  }
}
}

function sendRes(msg){
  for(let client of clients){
    client.send(`res_`+msg);
  }
}

function createToken(){
  let newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  console.log("New token: "+newToken);
  let tokens = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
  var any = 0;
  for(z in tokens.players){
    if(tokens.players[z].id == newToken){
      any=1;
      break;
    }
  }
  if(any==0){
    console.log("New token created")
    tokens.players.push({"id":newToken,"score":0,"cps":0});
    fs.writeFileSync(path.resolve(__dirname, 'best.json'), JSON.stringify(tokens));
    return newToken;
  }else{
    console.log("Token already exists")
    return createToken();
  }
}

/////////////////////////////////////
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});