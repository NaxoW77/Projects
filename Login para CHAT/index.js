const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const fs = require('fs')

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages/index.html'))
})

app.get('/login/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/login.html'))
})

var able = 0;
app.get('/main/', (req, res) => {
  if(able==1){
  res.sendFile(path.resolve(__dirname, 'pages/main.html'))
  able=0;
  }else{
    res.sendFile(path.resolve(__dirname, 'pages/index.html'))
  }
})

app.get('/register/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages/register.html'))
})

app.post('/register/', (req, res) => {
  var content = req.body
  var lVal = regIn(content)
  if(lVal == 0){
    res.send("ok");
  }else{
    console.log(lVal)
    res.send(lVal)
  }

  console.log(content)
});

app.post('/login/', (req, res) => {
  var content = req.body
  var lVal = logIn(content)
  if(lVal == 0){
    able=1;
    res.send("/main");
  }else{
    console.log(lVal)
    res.send(lVal)
  }

  console.log(content)
});

function logIn(logUser){
  var data = JSON.parse(fs.readFileSync('data/users.json'));
  if(logUser.user == "" || logUser.pass == ""){
    return "Error: Espacios en blanco.";
  }else{
  for(var x=0; x<data.users.length;x++){
    if(data.users[x].name == logUser.user){
      if(data.users[x].pass == logUser.pass){
        return 0;
      }else{
        return "Error: Contraseña incorrecta.";
      }
    }
  }
  return "Error: El usuario no existe";
}
}

function regIn(regUser){
  var data = JSON.parse(fs.readFileSync('data/users.json'));
  if(regUser.user=="CLEAR"){
    clearUsers();
    return 0;
  }
  if(regUser.user == "" || regUser.pass == ""){
    return "Error: Espacios en blanco.";
  }else{
  for(var x=0; x<data.users.length;x++){
    if(data.users[x].name == regUser.user){
      return "Error: El usuario ya existe.";
    }
  }
  var newUser = {
    name:regUser.user,
    pass:regUser.pass
  }
  data.users.push(newUser)
  fs.writeFileSync("data/users.json",JSON.stringify(data))
  return 0;
}
}

function clearUsers(){
  var data = JSON.parse(fs.readFileSync('data/users.json'));
  data.users.splice(0,data.users.length)
  fs.writeFileSync("data/users.json",JSON.stringify(data))
}

const port = 8080;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});