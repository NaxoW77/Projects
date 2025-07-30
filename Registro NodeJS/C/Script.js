var fs = require('fs');
var prompt = require("prompt-sync")({sigint:true});

console.clear()
var on = 1;

while(on == 1){
    console.log("\x1b[37m\x1b[47m⠀\x1b[0m ¿Qué desea hacer?\n\x1b[47m⠀\x1b[0m 1. Ver registros guardados | 2. Añadir registro | 3. Modificar registro | 4. Vaciar registros | 5. Salir");
    var op = parseInt(prompt("\x1b[47m⠀\x1b[0m → ", "6"));

    switch(op){
        case 1:
            List();
            break;
        case 2:
            Add();
            break;
        case 3:
            Mod();
            break;
        case 4:
            Clear();
            break;
        case 5:
            Exit();
            break;
        default:
            console.clear()
            console.log("\x1b[41m\x1b[31m⠀\x1b[0m\x1b[31m Valor inválido. Por favor seleccione una opción válida de la lista.\x1b[0m")
            console.log("")
            break;
    }
}

function List(){
    console.log("")
    var data = fs.readFileSync('Registros.json', 'utf8')
    var raw = JSON.parse(data).Registros
    if(raw.length == 0){
        console.log("\x1b[41m\x1b[31m⠀\x1b[0m\x1b[31m No hay registros guardados.\x1b[0m")
        console.log("")
        prompt("\x1b[47m⠀\x1b[0m Pulsa ENTER para continuar...\x1b[30m")
        console.clear()
    }else{
    console.log(`\x1b[44m\x1b[34m⠀\x1b[0m Registros guardados [${raw.length}]:`)
    for(var x in raw){
        console.log(`\x1b[44m\x1b[34m⠀\x1b[0m ID: ${parseInt(x)+1} | Nombre: ${raw[x].Nombre}, edad: ${raw[x].Edad}`)
    }
    console.log("")
    prompt("\x1b[47m⠀\x1b[0m Pulsa ENTER para continuar...\x1b[30m")
    console.clear()
}
}

function Add(){
    console.log("")
    var data = fs.readFileSync('Registros.json', 'utf8')
    var raw = JSON.parse(data);

    var in1 = "";

    console.log("\x1b[47m⠀\x1b[0m Ingrese el nombre.");
    var in1 = prompt("\x1b[47m⠀\x1b[0m → ", "Vacío");
    console.log("")
    console.log("\x1b[47m⠀\x1b[0m Ingrese la edad.");
    var in2 = parseInt(prompt("\x1b[47m⠀\x1b[0m → ", "0"));
    if(!in2){
        in2=0;
    }

    raw.Registros.push({Nombre : in1, Edad : in2})
    console.log("")
    console.log("\x1b[42m\x1b[32m⠀\x1b[0m\x1b[32m Se añadió el registro correctamente.\x1b[0m")

    fs.writeFileSync('Registros.json', JSON.stringify(raw), 'utf8', function(){});
    List();
}

function Mod(){
    console.log("")
    var data = fs.readFileSync('Registros.json', 'utf8')
    var raw = JSON.parse(data)

    if(raw.Registros.length == 0){
        console.log("\x1b[41m\x1b[31m⠀\x1b[0m\x1b[31m No hay registros guardados.\x1b[0m")
        console.log("")
        prompt("\x1b[47m⠀\x1b[0m Pulsa ENTER para continuar...\x1b[30m")
        console.clear()
    }else{
    console.log(`\x1b[44m\x1b[34m⠀\x1b[0m Estos son los registros guardados actualmente [${raw.Registros.length}]:`)
    for(var x in raw.Registros){
        console.log(`\x1b[44m\x1b[34m⠀\x1b[0m ID: ${parseInt(x)+1} | Nombre: ${raw.Registros[x].Nombre}, edad: ${raw.Registros[x].Edad}`)
    }

    console.log("")

    console.log("\x1b[47m⠀\x1b[0m Ingrese el ID del registro que quiera modificar.");
    var id = prompt("\x1b[47m⠀\x1b[0m → ", "Vacío");
    if(!raw.Registros[id-1]){
        console.clear();
        console.log("\x1b[41m\x1b[31m⠀\x1b[0m\x1b[31m Ese elemento no existe. Ingrese un registro válido\x1b[0m")
        Mod();
    }else{

    console.log("")
    console.log("\x1b[47m⠀\x1b[0m (Deja en blanco para no modificar.)");
    console.log("")
    console.log("\x1b[47m⠀\x1b[0m Ingrese el nombre.");
    var in1 = prompt("\x1b[47m⠀\x1b[0m → ", raw.Registros[id-1].Nombre);
    console.log("")
    console.log("\x1b[47m⠀\x1b[0m Ingrese la edad.");
    var in2 = parseInt(prompt("\x1b[47m⠀\x1b[0m → ", raw.Registros[id-1].Edad));
    if(!in2){
        in2=0;
    }
    
    raw.Registros[id-1] = {Nombre : in1, Edad : in2}
    console.log("")
    console.log("\x1b[42m\x1b[32m⠀\x1b[0m\x1b[32m Se modificó el registro correctamente.\x1b[0m")

    fs.writeFileSync('Registros.json', JSON.stringify(raw), 'utf8', function(){});
    List();
    }
}
}

function Clear(){
    console.log("")
    var val = JSON.parse(fs.readFileSync('Registros.json', 'utf8')).Registros.length
    if(val == 0){
        console.log("\x1b[41m\x1b[31m⠀\x1b[0m\x1b[31m No hay registros guardados.\x1b[0m")
        console.log("")
        prompt("\x1b[47m⠀\x1b[0m Pulsa ENTER para continuar...\x1b[30m")
        console.clear()
    }else{
    console.log(`\x1b[43m\x1b[33m⠀\x1b[0m\x1b[33m ¿Estás seguro de que deseas borrar [${val}] registros? (Y/N)\x1b[0m`)
    var op = prompt("\x1b[47m⠀\x1b[0m → ", "n")
    console.log("")
    if(op == "Y" || op == "y"){
    var obj = {
        "Registros":[

        ]
    }
    fs.writeFileSync('Registros.json', JSON.stringify(obj), 'utf8', function(){});
    console.log("\x1b[42m\x1b[32m⠀\x1b[0m\x1b[32m Se han vaciado los registros exitosamente.\x1b[0m")
    console.log("")
    prompt("\x1b[47m⠀\x1b[0m Pulsa ENTER para continuar...\x1b[30m")
    console.clear()
}else{
    console.log("\x1b[41m\x1b[31m⠀\x1b[0m\x1b[31m Acción cancelada.\x1b[0m")
    console.log("")
    prompt("\x1b[47m⠀\x1b[0m Pulsa ENTER para continuar...\x1b[30m")
    console.clear()
}
}
}

function Exit(){
    on = 0;
}