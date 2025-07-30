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
app.use('/img', express.static(path.join(__dirname, 'img')));

var player = 1;
app.get('/', (req, res) => {
  res.render("redirect", { player: player })
  player++;
})

app.get('/P1', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/P2', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/P3', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/P4', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/sv', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'player.html'))
})

app.get('/js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client.js'))
})

app.get('/css', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'style.css'))
})

app.get('/otf', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'DFRuLeiStd-W7.otf'))
})

///////////////////////////////////////
const clients = new Set();
var players = ["P1=0", "P2=0", "P3=0", "P4=0"];
var playerScores = ["P1=0", "P2=0", "P3=0", "P4=0"];

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
    } catch (err) { };
    if (clientMsg == "req_con") {
      let userID = dataMsg;
    }

    if (clientMsg == "req_flag") {
      let userIndex = dataMsg.slice(1, 2) - 1
      let userFlag = data2Msg;
      let check = 0;

      for (var x in players) {
        if (players[x].split("=")[1] == userFlag && players[x].split("=")[0] != dataMsg) check = 1;
      }

      if (check == 0) {
        if (players[userIndex].split("=")[1] == 0) players[userIndex] = `${dataMsg}=${userFlag}`;
        sendRes(`updateWait|${players.toString()}`);
      }

    }

    if (clientMsg == "req_ready") {
      let userID = dataMsg;
      playerStates[parseInt(userID.slice(1, 2)) - 1] = `${userID}|2`
      console.log(playerStates);
      for (let client of clients) {
        for (c in playerStates) {
          client.send(`res_ready|${playerStates[c].split("|")[0]}|${playerStates[c].split("|")[1]}`);
        }
        client.send(`res_ready`);
      }

      if (playerStates[0].split("|")[1] == 2 && playerStates[1].split("|")[1] == 2) {
        sendRes(`start`);
      }
    }

    if (clientMsg == "req_changeMode") {
      sendRes("changeMode")
    }

    if (clientMsg == "req_sendScores") {
      sendRes("updateScores|" + playerScores.toString())
    }

    if (clientMsg == "req_setScore") {
      var user = dataMsg;
      var newScore = data2Msg;
      console.log("asdadad")

      playerScores[user.slice(1, 2) - 1] = `${user}=${parseInt(playerScores[user.slice(1, 2) - 1].split("=")[1]) + parseInt(newScore)}`;
    }

    if (clientMsg == "req_reset") {
      sendRes(`reset`);
    }
  })

  var a = 0;
  ws.on('close', function () {
    clients.delete(ws);
    if (a == 0) {
      sendRes(`reset`);
      a = 1
      setTimeout(function () {
        a = 0;
      }, 1000)
    }

  });
})


function sendRes(msg) {
  console.log("→ " + "res_" + msg)
  for (let client of clients) {
    client.send(`res_` + msg);
  }
}

/////////////////////////////////////
const port = 8001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});