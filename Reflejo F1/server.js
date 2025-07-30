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

var player = 0;
app.get('/', (req, res) => {
      player++;
      if(player>=3){player=1;}
      res.render("index",{player:player})
  })

app.get('/P1', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'P1.html'))
})

app.get('/P2', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'P2.html'))
})

function checkScores(p1S,p2S){
  if(p1S != null && p2S != null){
    if(parseFloat(p1S).toFixed(2) <parseFloat(p2S).toFixed(2)){
      for(let client of clients) {
        client.send(`res_result|P1`);
      }
    }else if (parseFloat(p1S).toFixed(2)>parseFloat(p2S).toFixed(2)){
      for(let client of clients) {
        client.send(`res_result|P2`);
      }
    }else if (parseFloat(p1S).toFixed(2)==parseFloat(p2S).toFixed(2)){
      for(let client of clients) {
        client.send(`res_result|TIE`);
      }
    }
  }
}

///////////////////////////////////////
const clients = new Set();
var p1S,p2S=null;

  app.ws('/server', (ws, req) => {
    clients.add(ws);
    ws.on('message', msg => {
          if (msg.split("|")[0] == "req_con"){
            const scores = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
            ws.send(`res_ok|${scores.players[msg.split("|")[1].slice(1,2)-1].score}`);
          }
          if(msg == "req_start"){
            var delay = Math.random() * 4000 + 1000;
            for(let client of clients) {
              client.send(`res_start|${delay}`);
            }
            }
          
            if (msg.split("|")[0] == "req_best"){
              const scores = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
              if(msg.split("|")[1] == "P1"){
              scores.players[0].score=msg.split("|")[2]
              }else{
                scores.players[1].score=msg.split("|")[2]
              }
              fs.writeFileSync(path.resolve(__dirname, 'best.json'),JSON.stringify(scores));
            }

          if(msg == "req_reset"){
            for(let client of clients) {
              client.send(`res_reset`);
            }
            p1S=null;p2S=null;
            }

          if(msg.split("|")[0] == "res_time"){
            
            switch(msg.split("|")[1]){
              case "P1":
                p1S=msg.split("|")[2]
                break;
              case "P2":
                p2S=msg.split("|")[2]
            }
            checkScores(p1S,p2S);
          }
    })

  ws.on('close', function() {
    clients.delete(ws);
  });
})

  


/////////////////////////////////////
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//Y añadir una request del best score guardado en un JSON