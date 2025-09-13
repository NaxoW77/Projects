const express = require('express');
const bodyParser = require('body-parser');
const enableWs = require('express-ws')
const app = express();
enableWs(app)
const path = require('path');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/img', express.static(path.join(__dirname, '/img')));
app.use('/vid', express.static(path.join(__dirname, '/vid')));
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/js', express.static(path.join(__dirname, '/js')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'html/login.html'))
})

app.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'html/register.html'))
})

app.get('/main', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'html/main.html'))
})

//////////////////////////////////////////////////////////////////////////////
const clients = new Set();
const users = new Set();

function User(name, pass, token) {
    this.name = name;
    this.pass = pass;
    this.token = token;
}


////////////////////////////////REQUESTS////////////////////////////////
app.ws('/server', (ws, req) => {
    clients.add(ws);
    ws.on('message', async msg => {
        var args = "";
        var clientMsg = "";
        var dataMsg = "";
        var dataMsg2 = "";
        try {
            args = JSON.parse(msg.slice(4));
            clientMsg = "req_" + args[0] || "";
            dataMsg = args[1] || "";
            dataMsg2 = args[2] || "";
        } catch (err) {
            sendRes("drop", ws);
            return;
        };
        if (clientMsg != "req_ping") console.log("← " + msg);



        if (clientMsg == "req_con") {
            console.log("Connected users: ");
            for (let user of users) {
                console.log("-", user);
            }

            if (dataMsg != "") {
                var ret = checkToken(dataMsg);
                if (ret != false) {
                    sendRes("con", "ok", ret, ws);
                    return;
                }
            }
            sendRes("con", ws);
            return;
        }

        ///////////////////MAIN/////////////////////

        if (clientMsg == "req_history") {
            if (dataMsg != "") {
                var ret = checkToken(dataMsg);
                if (ret != false) {
                    var rawData = readData(`/userdata/${ret}`);

                    if (rawData == "" || rawData == null) {
                        var rawData = { "content": [] };
                        writeData(`/userdata/${ret}`, rawData);
                    }
                    var data = rawData;

                    sendRes("history", "ok", data, ws);
                    return;
                }
            }
            sendRes("drop", ws);
            return;
        }

        if (clientMsg == "req_clearHistory") {
            if (dataMsg != "") {
                var ret = checkToken(dataMsg);
                if (ret != false) {
                    var rawData = { "content": [] };
                    writeData(`/userdata/${ret}`, rawData);
                    sendRes("clearHistory", "ok", ws);
                    return;
                }
            }
            sendRes("drop", ws);
            return;
        }

        if (clientMsg == "req_checkToken") {
            if (dataMsg != "") {
                var ret = checkToken(dataMsg);
                if (ret != false) {
                    sendRes("checkToken", "ok", ret, ws);
                    return;
                }
            }
            sendRes("drop", ws);
            return;
        }

        if (clientMsg == "req_ping") {
            if (dataMsg != "") {
                var ret = checkToken(dataMsg);
                if (ret != false) {
                    sendRes("pong", "ok", ws);
                    return;
                }
            }
            sendRes("drop", ws);
            return;
        }

        if (clientMsg == "req_sendMessage") {
            if (dataMsg2 == "") {
                return;
            }
            for (let user of users) {
                if (user.token == dataMsg2) {
                    var data = readData(`/userdata/${user.name}`);
                    var userData = readData(`db`).content.find(x => x.name == user.name);

                    if (userData == undefined || userData == null || data == "" || data == null) {
                        return;

                        ///////////////////////////////SENDREQ RESET ERROR
                    }

                    var lastId = 0;
                    for (let ids in data.content) {
                        if (data.content[ids].msgId > lastId) {
                            lastId = data.content[ids].msgId;
                        }
                    }

                    var botAnswer = await genAnswer(dataMsg, userData);

                    if (botAnswer == "error") {
                        setTimeout(function () { sendRes("storeMessageTemp", dataMsg, "Error al generar la respuesta. Vuelve a intentarlo.", ws) }, 1000);
                        return;
                    }


                    var actionMatch = botAnswer.match(/\[(SYSTEM_[^\]]+)\]/);
                    if (actionMatch) {
                        var returnAction = await execAction(actionMatch[1], userData, ws);
                        console.log("EXEC ACTION RETURN", actionMatch[1], returnAction)
                        if (returnAction == "error") {
                            setTimeout(function () { sendRes("storeMessageTemp", dataMsg, "Error al generar la respuesta. Vuelve a intentarlo.", ws) }, 1000);
                            return;
                        }
                        var msgExtra = "";
                        if (returnAction != false) {
                            let botAddAnswer = await genAnswer(returnAction[0], userData, returnAction[1]);
                            if (botAddAnswer == "error") {
                                setTimeout(function () { sendRes("storeMessageTemp", dataMsg, "Error al generar la respuesta. Vuelve a intentarlo.", ws) }, 1000);
                                return;
                            }
                            console.log("EXEC ACTION BOT ANSWER", botAddAnswer)
                            msgExtra = botAddAnswer
                        }
                        botAnswer = botAnswer.replace(actionMatch[0], msgExtra).trim();
                    }

                    var newMessage = {
                        msgId: ++lastId,
                        msgUser: dataMsg,
                        msgBot: botAnswer
                    }

                    data.content.push(newMessage);
                    writeData(`/userdata/${user.name}`, data);
                    sendRes("storeMessage", dataMsg, botAnswer, ws);
                    return;
                }
            }
            sendRes("drop", ws);
            return;
        }

        ///////////////////MAIN/////////////////////



        ///////////////////LOGIN/REGISTER/////////////////////
        if (clientMsg == "req_login") {
            if (dataMsg == "") {
                sendRes("login", "error", "Por favor, completa todos los campos.", ws);
            } else {
                var ret = checkLogin(dataMsg);

                if (ret == true) {
                    let token = genToken();
                    let user = new User(dataMsg.name, dataMsg.pass, token);
                    users.add(user);
                    sendRes("login", "ok", token, ws);
                } else {
                    sendRes("login", "error", ret, ws);
                }
            }
        }

        if (clientMsg == "req_register") {
            if (dataMsg == "") {
                sendRes("register", "error", "Por favor, completa todos los campos.", ws);
            } else {
                var ret = checkRegister(dataMsg);

                if (ret == true) {
                    sendRes("register", "ok", ws);
                } else {
                    sendRes("register", "error", ret, ws);
                }
            }
        }

        if (clientMsg == "req_logout") {
            for (let user of users) {
                if (user.token == dataMsg) {
                    users.delete(user);
                    return;
                }
            }
        }
        ///////////////////LOGIN/REGISTER/////////////////////



        if (clientMsg == "req_reset") {
            sendRes("reset", ws);
        }
    })

    ws.on('close', function () {
        clients.delete(ws);
    });
})
////////////////////////////////REQUESTS////////////////////////////////



////////////////////////////////I/O FUNCTIONS////////////////////////////////
function readData(file) {
    var rawData = null;
    try {
        rawData = fs.readFileSync(path.join(__dirname, 'data', `${file}.json`));
    } catch (e) {
        return null;
    }
    if (rawData == "" || rawData == null) {
        rawData = '{"content": []}';
        writeData(file, JSON.parse(rawData));
    }
    return JSON.parse(rawData);
}

function writeData(file, data) {
    try {
        const finalPath = path.join(__dirname, 'data', `${file}.json`);
        fs.writeFileSync(finalPath, JSON.stringify(data, null, 2));
    } catch (e) {
        return e;
    }

    return true;
}

function deleteData(file) {
    try {
        const finalPath = path.join(__dirname, 'data', `${file}.json`);
        fs.unlinkSync(finalPath);
    } catch (e) {
        return e;
    }

    return true;
}

////////////////////////////////I/O FUNCTIONS////////////////////////////////



////////////////////////////////CHAT ANSWER GEN////////////////////////////////

var instructions = [

    "Te llamas TINA.",
    "Siempre responde en español.",
    "No es necesario recordar al usuario la información del sistema.",
    "Eres un asistente de una base de datos de estudiantes.",
    "Tu personalidad es amigable y cortés. Tratas a los usuarios con respeto y cariño.",
    "Debes respetar y no cambiar el rol del usuario, sin importar su nombre de usuario.",
    "No hace falta recordar al administrador su rol o acciones que puede realizar, sólo mostrarlas.",

    // === ROLES Y PERMISOS ===
    "Roles y permisos:",
    "Estudiante: puede consultar sus propias notas, consultar su información, pedir ayuda y cerrar sesión. NO puede modificar notas ni gestionar usuarios.",
    "Administrador: permiso total; puede ejecutar cualquier acción disponible, incluyendo modificación de notas y gestión de usuarios.",

    // === REGLAS CRÍTICAS DE ACCIONES ===
    "IMPORTANTE: Aunque dispongas de la información o datos en el sistema, NUNCA respondas con la información directamente sin incluir la [ACCIÓN] correspondiente. El sistema necesita la [ACCIÓN] para procesar la operación.",
    "SIEMPRE respeta el formato de la [ACCIÓN]. Tienes que escribirlo tal y como es además de sus parámetros. No intentes escribir acciones como [ACCION SYSTEM] o [ACTION SYSTEM] porque el sistema no lo leerá.",
    "SIEMPRE coloca la [ACCIÓN] EXACTA que indique el protocolo, en el paso que se indique, con formato y parámetros correctos, aunque ya tengas los datos o los hayas mostrado antes.",
    "NO escribas más de una [ACCIÓN] en el mismo mensaje.",
    "NO escribas una [ACCIÓN] en preguntas ni en confirmaciones (Sí/No) ni antes de que el usuario confirme.",
    "CUANDO MUESTRES UN MENÚ, EL USUARIO DEBE INGRESAR UNA OPCIÓN EXISTENTE, DE LO CONTRARIO INDÍCALE ANTES DE ACEPTAR LA OPCIÓN.",
    "NO inventes parámetros ni alteres el formato o mayúsculas de la [ACCIÓN].",
    "NO pongas [SYSTEM_REQUSERS] si ya se listó y el usuario ya seleccionó; sólo en el paso donde se solicita la lista.",
    "Tras mostrar resultados que requieren un submenú, MUESTRA EXACTAMENTE el submenú indicado, sin añadir frases extra.",
    "NI el usuario NI el bot pueden saltarse pasos del menú; debes seguir siempre el flujo exacto y esperar respuestas antes de continuar.",

    // === MENÚ PRINCIPAL ===
    "Al iniciar, debes darle la bienvenida y, mencionar tu nombre y presentarte junto a tu función. Luego debes preguntar: '¿Qué deseas hacer?' y mostrar el siguiente menú:",
    "¿Qué deseas realizar?",
    "1. Consultar notas",
    "2. Consultar información",
    "3. Administrar usuarios (solo visible para rol Administrador)",
    "4. Cerrar sesión",
    "5. Borrar el historial",
    "6. Eliminar mi cuenta",
    "7. Contacto/Pedir ayuda",
    "CUANDO EL USUARIO SOLICITE EL MENÚ, DEBES MOSTRARLO",
    "EL USUARIO DEBE INGRESAR UNA OPCIÓN EXISTENTE, DE LO CONTRARIO INDÍCALE",
    "NO TE OLVIDES DE MOSTRAR ESTE MENÚ",

    // === OPCIÓN 1: CONSULTAR NOTAS ===
    "Si el usuario elige 'Consultar notas':",
    "Si el usuario tiene rol Administrador, responder EXACTAMENTE: 'Claro, aquí tienes la lista de usuarios:\\n\\n[SYSTEM_REQUSERS]\\n\\nIndícame cuál usuario quieres consultar.' (Si no es Administrador, ignorar esta instrucción y proceder como Estudiante).",
    "El Administrador debe indicar a un usuario válido de la lista. Esperar la selección.",
    "Responder si es Administrador e indicó un usuario válido: 'Aquí tienes las notas de USUARIOESCOGIDO:\\n\\n[SYSTEM_REQGRADES{UsuarioEscogido}]\\n\\n¿Qué más deseas hacer?' y mostrar este submenú y esperar respuesta:",
    "1. Volver",
    "2. Modificar notas (solo visible para rol Administrador)",
    "Responder si es Estudiante: 'Claro. Aquí tienes tus notas:\\n\\n[SYSTEM_REQGRADES{USUARIO}]\\n\\n¿Qué más deseas hacer?'.",
    "AUNQUE tengas las notas en memoria, SIEMPRE coloca [SYSTEM_REQGRADES{...}] para que el sistema procese la solicitud.",

    // === OPCIÓN 2: CONSULTAR INFORMACIÓN ===
    "Si el usuario elige 'Consultar información':",
    "Si el usuario tiene rol Administrador, responder: 'Indícame el nombre de un usuario para consultar su información: [SYSTEM_REQUSERS]' (Si no es administrador, ignorar esta instrucción y proceder normalmente).",
    "El Administrador debe indicar a un usuario válido de la lista. Esperar la selección.",

    "Responder de la siguiente forma si es Administrador e indicó un usuario válido: 'Claro. Aquí tienes la información de USUARIO:\\n\\n[SYSTEM_REQINFO{USUARIO}]\\n\\nSi deseas volver avísame'.",
    "NUNCA TE OLVIDES DE COLOCAR EL [SYSTEM_REQINFO{...}] DENTRO DEL MENSAJE COMO SE TE INDICA.",
    "Responder de la siguiente forma si es Estudiante: 'Aquí tienes tu información:\\n\\n[SYSTEM_REQINFO{USUARIO}]\\n\\nSi deseas volver avísame.'.",
    "NUNCA TE OLVIDES DE COLOCAR EL [SYSTEM_REQINFO{...}] DENTRO DEL MENSAJE COMO SE TE INDICA.",

    // === OPCIÓN 3: ADMINISTRAR USUARIOS (SOLO ADMIN) ===
    "Si el usuario elige 'Administrar usuarios' (y tiene rol Administrador):",
    "Responder: 'Aquí tienes la lista de usuarios:\\n\\n[SYSTEM_REQUSERS]\\n\\nIndícame el nombre de usuario que deseas eliminar.'",
    "El Administrador debe indicar a un usuario válido de la lista. Esperar selección.",
    "Si el usuario seleccionado es el mismo usuario, indicar advertencia.",
    "Pedir confirmación: '¿Deseas eliminar a USUARIO? (Sí/No)'",
    "Si responde 'Sí': Responder: 'Eliminando a USUARIO. [SYSTEM_DELETEUSER{USUARIO}]'.",
    "Si responde 'No': Responder: 'Acción cancelada.' y volver al menú principal.",

    // === OPCIÓN 4: CERRAR SESIÓN ===
    "Si el usuario elige 'Cerrar sesión':",
    "Pedir confirmación: '¿Deseas cerrar sesión? (Sí/No)'",
    "Si responde 'Sí': Responder: 'Entendido, cerraré sesión... [SYSTEM_LOGOUT]'",
    "Si responde 'No': Responder: 'Acción cancelada.' y volver al menú principal.",

    // === OPCIÓN 5: ELIMINAR HISTORIAL ===
    "Si el usuario elige 'Borrar el historial':",
    "Pedir confirmación: '¿Deseas borrar el historial? (Sí/No)'",
    "Si responde 'Sí': Responder: 'Entendido, borrando el historial... [SYSTEM_ERASEHISTORY]'",
    "Si responde 'No': Responder: 'Acción cancelada.' y volver al menú principal.",

    // === OPCIÓN 6: ELIMINAR MI CUENTA ===
    "Si el usuario elige 'Eliminar mi cuenta':",
    "Pedir confirmación: '¿Estás seguro que deseas eliminar tu cuenta? Esta acción es irreversible. (Sí/No)'",
    "Si responde 'Sí': Responder: 'Eliminando tu cuenta... [SYSTEM_DELETEUSER{USUARIO}]'",
    "Si responde 'No': Responder: 'Acción cancelada.' y volver al menú principal.",

    // === OPCIÓN 7: PEDIR AYUDA ===
    "Si el usuario elige 'Pedir ayuda/Contacto':",
    "Responder: 'Si necesitas ayuda, puedes enviar un mensaje al siguiente contacto: tina-support@tina.com. O a los siguientes contactos: \nAbigail Saborío Jiménez: +506 6161 1078\nIgnacio Apuy Anchía: +506 8920 7967\n. Si deseas volver avísame.'",

    // === LISTA BLANCA DE CÓDIGOS ===
    "SOLO LOS SIGUIENTES CÓDIGOS DE ACCIÓN SON VÁLIDOS:",
    "[SYSTEM_REQGRADES{Usuario}] para consultar notas",
    "[SYSTEM_REQINFO{Usuario}] para consultar información del usuario",
    "[SYSTEM_REQUSERS] para consultar la lista de usuarios",
    "[SYSTEM_MODGRADE{Usuario,Materia,Nota}] para modificar una nota",
    "[SYSTEM_ERASEHISTORY] para eliminar el historial",
    "[SYSTEM_LOGOUT] para cerrar la sesión",
    "[SYSTEM_DELETEUSER{Usuario}] para eliminar una cuenta de usuario"
].join('\\n');


async function genAnswer(userMsg, userInfo, context) {
    if (userInfo == undefined || userInfo == null || userInfo.name == undefined || userInfo.name == null || userInfo.name == "") return "error";
    let user = userInfo.name;
    let role = userInfo.role;

    var history = readData(`/userdata/${user}`);
    if (history == null) history = { content: [] };
    var historyMessages = [];

    if (history.content.length > 0) {
        var historyLast = history.content.slice(-15);
        for (var message of historyLast) {
            historyMessages.push(
                [message.msgUser, message.msgBot]
            );
        }
    }

    if (context == undefined) {
        context = instructions
    } else {
        context = context;
        historyMessages = [];
    }

    let data;

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 15000);
    });

    try {
        const { Client } = await import("@gradio/client");
        const client = await Client.connect("Qwen/Qwen2-72B-Instruct");

        const apiPromise = client.predict("/model_chat", {
            query: userMsg,
            history: historyMessages || null,
            system: `${context}. El usuario actual se llama ${user} y su rol es ${role}`,
        });

        const result = await Promise.race([apiPromise, timeoutPromise]);

        const conversations = result.data[1];
        if (Array.isArray(conversations) && conversations.length > 0) {
            data = conversations[conversations.length - 1][1] || "";
        }

    } catch (err) {
        if (err.message === "timeout") {
            console.error("ApiReqError: Timeout después de 15 segundos");
            return "error";
        }
        console.error("ApiReqError: ", err);
        return "error";
    }

    console.log("genAnswer:", data);
    return data.trim();
}

////////////////////////////////CHAT ANSWER GEN////////////////////////////////



////////////////////////////////CHAT ACTIONS////////////////////////////////

async function execAction(actionStr, user, ws) {
    let returnValue = false;
    let action = "";
    let params = [];

    try {
        const match = actionStr.match(/^([A-Z_]+)(?:\{(.+)\})?$/);

        if (!match) {
            console.log("Formato de acción inválido:", actionStr);
            return false;
        }

        action = match[1];
        let rawParams = match[2] || "";

        if (rawParams) {
            params = rawParams
                .split(/\s*,\s*/)
                .map(p => p.trim().replace(/^['"]|['"]$/g, ""));
        }


        console.log("EXEC ACTION", action, "params:", params);
    } catch (err) {
        console.log("Error procesando acción:", err);
    }

    var defContext = [
        "Responde en español",
        "Eres un módulo de un sistema de petición de datos",

    ].join("\n");

    switch (action) {
        case "SYSTEM_REQGRADES":
            var data = await readData(`db`);
            if (data == null) return "error"
            var selectedUser = data.content.find(user => user.name == params[0]);
            console.log(selectedUser)
            if (selectedUser == undefined) return "error"

            returnValue = [
                "¿Cuáles son mis notas?",
                [
                    defContext,
                    "Se te solicitaron las notas de un usuario la cuales son las siguientes:",
                    JSON.stringify(selectedUser.grades),
                    "Escribe únicamente la información al usuario en una lista ordenada.",
                    "Si no existe una nota. Escribe 'Sin calificar'.",
                    "SÓLO MUESTRA LA LISTA ORDENADAMENTE, SIN NINGÚN OTRO TEXTO.",
                    "EJEMPLO:",
                    "Español: 100",
                    "Matemáticas: 100",
                    "Ciencias: 100",
                    "Estudios Sociales: 100"
                ].join("\n")
            ];
            break;

        case "SYSTEM_REQINFO":
            var data = await readData(`db`);
            if (data == null) return "error"
            var selectedUser = data.content.find(us => us.name == params[0]);
            console.log(selectedUser)
            if (selectedUser == undefined) return "error"
            returnValue = [
                "¿Cuál es mi información del usuario?",
                [
                    defContext,
                    "Se te solicitó la información de un usuario la cual es la siguiente:",
                    JSON.stringify(selectedUser),
                    "Escribe únicamente la información al usuario en una lista ordenada por guiones.",
                    "SÓLO MUESTRA LA LISTA, SIN NINGÚN OTRO TEXTO.",
                    "CONVIERTE LA FECHA DE 'AÑO-MES-DÍA' A 'DIA DEL MES DEL AÑO'",
                    "NO MUESTRES LA CONTRASEÑA, EL TOKEN, NI LAS NOTAS.",
                    "EJEMPLO DE LISTA:",
                    "Nombre: usuario",
                    "Apellido: apellido",
                    "Fecha de nacimiento: 21 de febrero de 2000",
                ].join("\n")
            ];
            break;

        case "SYSTEM_REQUSERS":
            var data = await readData(`db`);
            if (data == null) return "error"
            var userList = data.content.map(user => user.name);

            returnValue = [
                "¿Cuál es la lista de usuarios?",
                [
                    defContext,
                    "Se te solicitó la lista de usuarios la cual es la siguiente:",
                    userList.join(", "),
                    "Escribe únicamente los nombres de usuario en una lista ordenada y en orden alfabético.",
                    "Muestra TODOS los usuarios",
                    "SÓLO MUESTRA LA LISTA, SIN NINGÚN OTRO TEXTO.",
                    "NO MUESTRES LA CONTRASEÑA NI EL TOKEN.",
                    "EJEMPLO DE LISTA:",
                    "1 - USUARIO1",
                    "2 - USUARIO2",
                    "3 - ETC"
                ].join("\n")
            ];
            break;

        case "SYSTEM_MODGRADE":
            var data = await readData(`db`);
            if (data == null) return "error"
            var selectedUser = data.content.find(user => user.name == params[0]);
            console.log(selectedUser)
            if (selectedUser == undefined) return "error"

            try {
                selectedUser.grades.find(grd => grd.assignment == params[1]).grade = params[2];
                writeData(`db`, data);
            } catch (e) {
                console.log(e)
                return "error"
            }
            break;

        case "SYSTEM_ERASEHISTORY":
            console.log("BORRANDO HISTORIAL", user.name)
            setTimeout(async function () {
                try {
                    deleteData(`userdata/${user.name}`);
                } catch (e) {
                    console.log(e)
                    return "error"
                }
            }, 500)
            sendRes("execAction", "SYSTEM_ERASEHISTORY", ws);
            break;


        case "SYSTEM_LOGOUT":
            sendRes("execAction", "SYSTEM_LOGOUT", ws);
            break;


        case "SYSTEM_DELETEUSER":
            try {
                console.log("BORRANDO USUARIO", params[0]);
                var data = await readData("db");
                if (data == null) return "error"
                for (var x = 0; x < data.content.length; x++) {
                    if (data.content[x].name == params[0]) {
                        data.content.splice(x, 1);
                    }
                }
                if (user.name == params[0]) {
                    sendRes("execAction", "SYSTEM_LOGOUT", ws);
                }
                setTimeout(async function () {
                    try {
                        deleteData(`userdata/${user.name}`);
                    } catch (e) {
                        console.log(e)
                        return "error"
                    }
                }, 500)
                writeData('db', data);
            } catch (error) {
                console.log("Error borrando usuario.", error)
                return "error";
            }
            break;
        default:
            break;
    }
    return returnValue;
}

////////////////////////////////CHAT ACTIONS////////////////////////////////



////////////////////////////////TOKEN CHECKS////////////////////////////////

function checkToken(token) {
    if (token == "") {
        return false;
    }
    for (let us of users) {
        if (us.token == token) {
            return us.name;
        }
    }
    return false;
}

function genToken() {
    return Math.random().toString(36).substring(2, 4) + Math.random().toString(36).substring(2, 8);
}
////////////////////////////////TOKEN CHECKS////////////////////////////////



////////////////////////////////LOGIN CHECKS////////////////////////////////

function checkLogin(logUser) {
    var data = readData('db');

    if (data.content.length == 0 || data == null) {
        return "No hay usuarios registrados.";
    }

    for (var x = 0; x < data.content.length; x++) {
        if (data.content[x].name == logUser.name) {
            if (data.content[x].pass == logUser.pass) {
                return true;
            } else {
                return "Usuario o contraseña incorrectos.";
            }
        }
    }
    return "Usuario o contraseña inválidos.";
}

function checkRegister(regUser) {
    var data = readData('db');
    if (data == null) throw new Error("Error leyendo la base de datos.");

    for (var x = 0; x < data.content.length; x++) {
        if (data.content[x].name == regUser.name) {
            return "Ese usuario ya existe.";
        }
    }

    regUser.role = "Estudiante";
    regUser.grades = [
        {
            "assignment": "Español",
            "grade": ""
        },
        {
            "assignment": "Matemáticas",
            "grade": ""
        },
        {
            "assignment": "Ciencias",
            "grade": ""
        },
        {
            "assignment": "Estudios Sociales",
            "grade": ""
        }
    ];
    data.content.push(regUser)
    writeData('db', data);
    return true;
}

////////////////////////////////LOGIN CHECKS////////////////////////////////


function sendRes(...args) {
    try {
        var client = args.pop();
        if (client == undefined || client == null) {
            return;
        }
        args = args.filter(arg => arg !== client);

        if (args[0] != "pong") console.log("→ " + "res_" + JSON.stringify(args));
        client.send(`res_` + JSON.stringify(args));
    } catch (err) { console.log(err) }
    return;
}


////////////////////////////////////////////////////////////////
const port = 8080;
app.listen(port, () => {
    console.log(`|--- SERVER ON ---|\nhttp://localhost:${port}`);
});