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

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "Main.html"));

    /*
    const soup={soup : "A B C D E$F G H I J$K L M N O$P Q R S T$U V W X Y"}
    fs.writeFileSync(path.resolve(__dirname, 'Current.json'),JSON.stringify(soup));
    const test = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'Current.json')));
    console.log(test.soup)
    */
  })

app.get('/new', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'P2.html'))
})

///////////////////////////////////////
const clients = new Set();
var p1S,p2S=null;

  app.ws('/server', (ws, req) => {
    clients.add(ws);
    ws.on('message', msg => {
        if(msg == "req_con"){
            var soupRw = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'Current.json')));
            console.log(soup)
            var soup = "";
            for(var i in soupRw.soup){
                soup+=`${soupRw.soup[i]}$`;
            }
            soup=soup.substring(0,soup.length-1);
            console.log(soup)
            ws.send(`res_con|${soup}`)
        }
          console.log(msg)
            
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