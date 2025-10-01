let config = {
  "titulo": "Este es el título del formulario",
  "colorFondo": "#b6f0ffff", // Color en formato hexadecimal, de preferencia pastel. Ej #b6f0ffff
  "mostrarRespuesta": true, // true o false
  "botonRandom": false, // true o false
  "random": false, // true o false
  "autoScroll": true, // true o false
}

let preguntas =
[
  {
    "idPregunta": 1, // ID de la pregunta (100% NECESARIO)
    "txtPregunta": "Esto es una pregunta", // Texto de la pregunta
    "respOpciones": [ //Opciones, pueden ser varias. La numeración se debe quedar 1), 2), 3), 4)...
      "1) Esto es una opción",
      "2) Opción 2",
      "3) 3",
      "4) Y 4"
    ],
    "idRespPregunta": 1, // ID respuesta: 1 (la primera)
    "respPregunta": "Esto es una respuesta y explicación."
  },
  {
    "idPregunta": 2,
    "txtPregunta": "Estos son varios formatos (Ver formato en /form): \n ~Tachado~ \n &bullet; Punto \n Salto \nde línea\\n \n \n Doble salto\\n\\n \n\n Salto final \n Imágen (Ver formato en /img): [IMG-##] [IMG-01] \n Menor o igual \\le \n Mayor o igual \\ge \n Fracción \\frac{numerador}{denominador} \n Exponente ^X o ^{Y} \n Doble salto \n \n Doble salto \n ¬Texto centrado¬ \n ¬¬Texto citado¬¬", // Formatos de texto, se pueden usar en preguntas y respuestas también. No todos se pueden combinar, pero es posible
    "respOpciones": [
      "1) Esto es una imagen [IMG-02]",
      "2) [IMG-01]",
      "3) ¬Texto centrado¬",
      "4) ¬¬Cita¬¬",
      "5) Salto\nDoble\n \nsalto\n\nSalto final",
    ],
    "idRespPregunta": 1,
    "respPregunta": "Estos son formatos en respuesta: ¬¬Cita¬¬ [IMG-01] Salto\nDoble\n \nsalto \n ¬Texto centrado¬ \n ~Tachado~ \n &bullet; Punto\n\nSalto final, la respuesta era la opción 1."
  }
]
