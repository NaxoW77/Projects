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
    p1S=parseInt(p1S);
    p2S=parseInt(p2S);
    console.log("res_result→\n↑ El servidor revisó los puntajes y alertó quien ganó a los jugadores.\n")
    
    if(parseInt(p1S) < p2S){
      for(let client of clients) {
        client.send(`res_result|P1`);
      }
    }
    if (p1S > p2S){
      for(let client of clients) {
        client.send(`res_result|P2`);
      }
    }
    if (p1S==p2S){
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
        console.log(msg,"←");
          if (msg.split("|")[0] == "req_con"){
            console.log(`↑ El jugador ${msg.split("|")[1]} pidió conectarse al servidor.\n`);
            const scores = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
            ws.send(`res_ok|${scores.players[msg.split("|")[1].slice(1,2)-1].score}`);
            console.log("res_con→\n↑ El servidor aceptó al jugador a entrar la página.\n")
          }
          if(msg == "req_start"){
            console.log(`↑ Se pidió iniciar el juego a ambos jugadores desde el servidor.\n`);
            var delay = Math.random() * 4000 + 1000;
            for(let client of clients) {
              client.send(`res_start|${delay}`);
            }
            console.log("res_start→\n↑ El servidor aceptó y actualizó la página.\n")
            }
          
            if (msg.split("|")[0] == "req_best"){
              console.log(`↑ El jugador ${msg.split("|")[1]} pidió que le actualizara su mejor puntaje.\n`);
              const scores = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'best.json')));
              if(msg.split("|")[1] == "P1"){
              scores.players[0].score=msg.split("|")[2]
              }else{
                scores.players[1].score=msg.split("|")[2]
              }
              fs.writeFileSync(path.resolve(__dirname, 'best.json'),JSON.stringify(scores));
            }

          if(msg == "req_reset"){
            console.log(`↑ Se le pidió al servidor que reiniciara el juego.\n`);
            for(let client of clients) {
              client.send(`res_reset`);
            }
            console.log("res_reset→\n↑ El servidor aceptó y reinició la página.\n")
            p1S=null;p2S=null;
            }

          if(msg.split("|")[0] == "res_time"){
            console.log(`↑ El jugador ${msg.split("|")[1]} envió su puntaje, en milisegundos: ${msg.split("|")[2]}.\n`);
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