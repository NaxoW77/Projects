var playerID = window.location.href.slice(this.length - 2);
var sections = document.querySelectorAll("section");
var section = 0;
var questionNum=0;
var questionAnswer=0;

var questions=[
  "¿Cómo se llamó a la primer computadora?|ENTAC.,Macintosh.,ENIAC.,BRILLIAC.|3",

  '¿Qué significan las siglas "WWW"?|Wireless World Web.,Wide Area Network., Web Wide Wave., World Wide Web.|4',

  "Pregunta compleja: Cuando hablamos del desarrollo del Internet, esta fue una versión que contaba ya con la integración de La Nube en la Web.|Web 1.0.,Web 2.0.,Web 3.0.,Web 4.0.|3",


  "¿Qué utilidades importantes nos ha brindado la robótica?...|La Inteligencia Artificial.,Las cadenas de producción.,Las máquinas expendedoras.,Los escáneres de metal.|2",

  "Este factor lo debemos tener en cuenta siempre que aumentemos la escala de la industria tecnológica. |La capacidad de entendimiento de las personas.,Combinar nuevas tecnologías con las otras previas.,El daño que se le está haciendo al medio ambiente.,La escala de las ciudades.|3",

  "Pregunta compleja: ¿Por qué la modificación genética posee una barrera ética?|Porque es crimen contra la humanidad.,Porque implica afectar los derechos sociales.,Porque no tenemos la tecnología necesaria.,Porque implica utilizar seres vivos.|4",


  "A diferencia del sistema binario, con los bits, la computación cuántica utiliza un nuevo tipo de bit...|Los Qubits.,Los Bibits.,Los Quantumbits.,Los Multibits|1",

  "La seguridad es un factor que a futuro puede integrar nuevas tecnologías como... |El escaneo de retina.,El escaneo de huellas dactilares,Las contraseñas más complicadas.,Los escáneres de metal.|1",

  "Pregunta compleja: Los qubits poseen... |Más de dos estados.,Dos estados.,Dos estados a la vez.,Cuatro estados a la vez.|4",
]

window.addEventListener('load', prepare, false);

function prepare() {
  if(!playerID.startsWith("P")) {
    changeSection(1);
    document.querySelectorAll(".hidden").forEach(function(elm){
      elm.classList.remove("hidden");
      elm.style.display = "";
    });
    document.title += " - " + "ADMIN";
  }else{
    changeSection(1);
    document.title += " - " + playerID;
  }
  
  document.getElementById("q1").addEventListener("click", function(){sendAnswer(this)}, false);
  document.getElementById("q1").addEventListener("contextmenu", function(ev){markAnswer(this,ev)}, false);
  document.getElementById("q2").addEventListener("click", function(){sendAnswer(this)}, false);
  document.getElementById("q2").addEventListener("contextmenu", function(ev){markAnswer(this,ev)}, false);
  document.getElementById("q3").addEventListener("click", function(){sendAnswer(this)}, false);
  document.getElementById("q3").addEventListener("contextmenu", function(ev){markAnswer(this,ev)}, false);
  document.getElementById("q4").addEventListener("click", function(){sendAnswer(this)}, false);
  document.getElementById("q4").addEventListener("contextmenu", function(ev){markAnswer(this,ev)}, false);


}

function changeSection(newSection) {
  section=newSection;
  for (var x = 0 ; x < sections.length;x++) {
    if(!sections[x].classList.contains("disabled"))
    sections[x].classList.add("disabled");
  }
  sections[Math.floor(newSection-1)].classList.remove("disabled");
}

function loadScores(scores){
  scores = scores.split(",");
  console.log(scores)

  for(var x = 0; x<4;x++){
    let player = scores[x].split("=")[0];
    let score = scores[x].split("=")[1];

    for(var y = 0; y<4;y++){
    if(document.querySelector(`#fr${y+1}`).classList.contains(`tm${player.slice(player.length-1,player.length)}`)){
    document.querySelector(`#fr${y+1} p`).textContent=`(${score} Puntos)`;
    }
    }
  }

}

function loadQuestion(questionID){
  if(questionNum==9){
    document.querySelector("#nextButton").style.display="none";
    changeSection(4);
    document.body.style.animation = "bgNormal 10s linear infinite";
    document.body.style.backgroundImage = 'url("img/bg2.png")'
  }
  switch(questionNum){
    case 2: case 5: case 8:
    document.body.style.animation = "bgHard 10s linear infinite";
    break;

    case 9:
      break

    default:
    document.body.style.animation = "bgAlt 10s linear infinite";
  }
  d=0;
  for(var x = 0; x<4;x++){
    try{
    document.querySelector(`#q${x+1}`).style.filter="";
    document.querySelector(`#q${x+1}`).style.transform="";
    }catch(e){}
  }
  let questionData=questions[questionID].split("|");
  let questionTxt = questionData[0]
  document.querySelector("#qq").textContent=questionTxt;
  let questionOptions = questionData[1].split(",");
  for(var x = 0;x<questionOptions.length;x++){
    document.querySelector(`#q${x+1} h1`).textContent=questionOptions[x];
  }
  questionAnswer = questionData[2];
  questionNum++;
}

var d=0;
function sendAnswer(elm){
  if(d==0){
    d=1;
  elm.style.transform="scale(0.9)"
  let score=0;
  if(elm.id.slice(1,2)==questionAnswer){
    score=1;
  }else{
    score=-1;
  }
  markAnswer(elm,null)
  sendReq(`setScore|${playerID}|${score}`)
}
}

function markAnswer(elm,ev){
  try{ev.preventDefault()}catch(err){};
  for(var x = 0; x<4;x++){
    document.querySelector(`#q${x+1}`).style.filter="saturate(0%)";
}
elm.style.filter="";
}

function changeMode(){
  sendReq("changeMode");
  sendReq("sendScores");
}

var c=0;
function next(){
  if(c==0){
    c=1;
    for(var x = 0; x<4;x++){
      let e = document.querySelector(`#fr${x+1}`);
      let f = document.querySelector(`#fl${x+1} > h1`).textContent;
      e.classList.add(`tm${f.slice(f.length-1,f.length)}`)
      e.querySelector("h1").innerHTML = e.querySelector("h1").innerHTML.replace("$", `Equipo ${f.slice(f.length-1,f.length)}`)
    }
  }
  switch(true){
    case (section==3):
      loadQuestion(questionNum)
      changeSection(2);
      break;
    case (section==1) : case (section == 2):
      changeSection(3);
      document.body.style.animation = "bgNormal 10s linear infinite";
      break;
  }
}

function selectFlag(item){
  if(item.classList.contains("selected")){
    let txt = item.querySelector("h1").textContent;
    if("P"+txt.slice(txt.length-1,txt.length) == playerID){

    }else{
      return;
    }
  }
  sendReq(`flag|${playerID}|${item.id}`);
}

function updateWait(waitList){
  waitList=waitList.split(",");
  for(var x = 0; x<4;x++){
    let usr = waitList[x].split("=")[0];
    let flg = waitList[x].split("=")[1];

    if(flg != 0){
      let it = document.querySelector(`#${flg}`);
      it.classList.add("selected");
      it.querySelector("h1").textContent = `Equipo ${usr.slice(1,2)}`
    }
  }
}

var socket;
const socketURL = 'ws://' + window.location.host + '/server'
socket = new WebSocket(socketURL);
socket.onopen = () => {
  socket.send(`req_con|${playerID}`)
}

socket.onmessage = e => {
  var serverMsg;
  var dataMsg;
  var data2Msg;
  try {
    serverMsg = e.data.split("|")[0];
    dataMsg = e.data.split("|")[1];
    data2Msg = e.data.split("|")[2];
  } catch (err) { };
  console.log(e.data+" ←")


  if (serverMsg == "res_changeMode") {
    next();
  }

  if(serverMsg == "res_updateScores"){
    loadScores(dataMsg);
  }

  if(serverMsg == "res_updateWait"){
    updateWait(dataMsg);
  }

  if (serverMsg == "res_ping") {
    sendReq(`pong|${playerID}`)
  }

  if (serverMsg == "res_reset") {
    window.location.reload();
  }
}

function sendReq(msg) {
  console.log("→ "+ "req_" + msg)
  socket.send("req_" + msg)
}