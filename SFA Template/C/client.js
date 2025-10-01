let contentDiv = document.getElementById("content");
let sendButton = document.getElementById("sendButton");
let resetButton = document.getElementById("resetButton");
let randButton = document.getElementById("randButton");
let result = document.getElementById("result");
let random = false;

sendButton.addEventListener("click", checkAnswers);
resetButton.addEventListener("click", reset);
randButton.addEventListener("click", randomize);

function htmlFormat(text) {
    let formattedText = text
        .replace(/\n\n(.+)/g, "<span class='final'>$1</span>")

        .replace(/¬¬([^¬]+)¬¬/g, "<span class='quote'>$1</span>")
        .replace(/¬([^¬]+)¬/g, "<span class='center'>$1</span>")

        .replace(/\n \n+/g, "</p><p>")
        .replace(/\n/g, "<br>")

        .replace(/~([^~]+)~/g, "<u>$1</u>")

        .replace(/'/g, "\"")
        .replace(/\\le/g, "&le;")
        .replace(/\\ge/g, "&ge;")

        .replace(/\^(\{[^}]+\}|\w+)/g, (match, p1) => {
            return `<sup>${p1.replace(/[{}]/g, "")}</sup>`;
        })
        .replace(
            /\\frac\{([^}]*)\}\{([^}]*)\}/g,
            "<span style='display:inline-block;text-align:center;'><sup>$1</sup>&frasl;<sub>$2</sub></span>"
        )
        .replace(/\[IMG-(\d+)\]/g, (match, num) => {
            return `<span class="imgDiv"><img src="C/img/${num}.png"></span>`;
        })
        .replace(/correcta es la (\d+)/g, "correcta es la <span class='respId'>$1</span>")

    return formattedText;
}

window.addEventListener("load", init);

function init() {
    let questionList = document.querySelectorAll("div.questionDiv");
    if (questionList.length > 0) {
        questionList.forEach(question => contentDiv.removeChild(question));
    }

    for (let p of preguntas) {
        p.txtPregunta = htmlFormat(p.txtPregunta)
        p.respPregunta = htmlFormat(p.respPregunta)


        let el = document.createElement("div");
        el.classList.add("questionDiv");
        el.innerHTML = `<h3><span class="questionId">${p.idPregunta}</span>. ${p.txtPregunta}</h3>`;
        el.id = "p-" + p.idPregunta;
        for (let o = 0; o < p.respOpciones.length; o++) {
            p.respOpciones[o] = htmlFormat(p.respOpciones[o])
            p.respOpciones[o] = "<span class='hidden'>" + p.respOpciones[o].substring(0, 2) + "</span>"+p.respOpciones[o].substring(2);
            el.innerHTML += `<label><input type="radio" name="${p.idPregunta}" value="${parseInt(o) + 1}">${p.respOpciones[o]}<br></label>`;
        }
        el.innerHTML += `<div class="respDiv hidden"><h1>Explicación:</h1> <p>${p.respPregunta}</p></div>`;
        contentDiv.appendChild(el);
    }

    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("click", function (e) {
            document.querySelector(".evaluation").classList.remove("hidden");
            let currentQuestion = e.target.parentElement.parentElement;
            let nextQuestion = currentQuestion.nextElementSibling;
            if (nextQuestion && config.autoScroll) {
                nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    if (config.titulo && config.titulo.trim() !== "") {
        document.querySelector(".title").innerText = config.titulo;
    }

    if (config.colorFondo && config.colorFondo.trim() !== "") {
        document.title = config.titulo;
        document.body.style.backgroundColor = config.colorFondo;
    }

    if(config.random) {
        randomize();
    }

    if(!config.botonRandom){
        randButton.parentElement.classList.add("hidden");
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomize() {
    random = !random;
    if (random) {
        randButton.classList.add("rand");
        randButton.textContent = "Modo: Aleatorio";
    } else {
        randButton.classList.remove("rand");
        randButton.textContent = "Modo: Normal";
        window.location.reload();
    }
    let questionList = document.querySelectorAll("div.questionDiv");
    questionList.forEach(question => contentDiv.removeChild(question));
    questionList = Array.from(questionList);
    questionList = shuffle(questionList);
    questionList.forEach((q, i) => {
        q.querySelector(".questionId").innerText = (i + 1);
        let options = Array.from(q.querySelectorAll("label"));
        options = shuffle(options);
        options.forEach((opt, o) => {
            q.appendChild(opt);
        });
        contentDiv.appendChild(q);
    });
}

function checkAnswers() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll(".hidden").forEach(el => {if(!config.mostrarRespuesta && el.classList.contains("respDiv")){return} else el.classList.remove("hidden")});
    sendButton.classList.add("hidden");
    result.innerText = "";
    document.querySelectorAll("input").forEach(input => input.disabled = true);
    document.querySelectorAll("label").forEach(label => label.classList.add("disabled"));

    let score = 0;
    let correctAnswers = [];
    let incorrectAnswers = [];
    let unanswered = [];

    for (let p of preguntas) {
        let preguntaDiv = document.getElementById("p-" + p.idPregunta);
        let selected = document.querySelector(`input[name="${p.idPregunta}"]:checked`);
        document.querySelector(`input[name="${p.idPregunta}"][value="${p.idRespPregunta}"]`).parentElement.classList.add("correct");
        if (selected != null) {
            if (selected.value == p.idRespPregunta) {
                score++;
                preguntaDiv.classList.add("correct");
                correctAnswers.push(p);
            } else {
                preguntaDiv.classList.add("incorrect");
                selected.parentElement.classList.add("incorrect");
                incorrectAnswers.push(p);
            }
        } else {
            preguntaDiv.classList.add("unanswered");
            unanswered.push(p);
        }
    }

    result.innerText = `Preguntas respondidas: ${score}/${preguntas.length} \n\nRespuestas correctas: ${correctAnswers.length} \nRespuestas incorrectas: ${incorrectAnswers.length} \nSin responder: ${unanswered.length}\n\nNota: ${(score * 100 / preguntas.length).toFixed(2)}/100.00`;
}

function reset() {
    window.scrollTo({ top: 0 });
    window.location.reload();
}
