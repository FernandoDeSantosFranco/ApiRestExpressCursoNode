const debug = require("debug")("app:inicio");
const express = require("express");
const config = require("config");
//const logger = require("./logger"); //Middleware propio, exportando logger.js
const morgan = require("morgan");
const Joi = require("joi");
const app = express();

app.use(express.json()); //body
app.use(express.urlencoded({ extended: true }));

//Uso de recursos estáticos, carpeta public
app.use(express.static("public"));

//Configuración de entornos
console.log("Aplicación: " + config.get("nombre"));
console.log("BD server: " + config.get("configDB.host"));

//app.use(logger); //Uso de middleware propio

//Uso de middleware de tercero - Morgan
//Con la configuración de entornos, podemos configurar
//morgan para que solamente se use si estamos en el
//entorno de desarrollo, y no en un entorno de producción
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  //console.log("Morgan habilitado...");
  debug("Morgan está habilitado.");
}

//Trabajos con la base de datos
debug("Conectando con la bd...");

const usuarios = [
  { id: 1, nombre: "Fer" },
  { id: 2, nombre: "Max" },
  { id: 3, nombre: "Gay" },
];

app.get("/", (req, res) => {
  res.send("Hola Mundo desde Express");
});

app.get("/api/usuarios", (req, res) => {
  res.send(usuarios);
});

app.get("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) res.status(404).send("El usuario no fue encontrado");
  res.send(usuario);
});

app.post("/api/usuarios", (req, res) => {
  const { error, value } = validarUsuario(req.body.nombre);

  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }

  /*if (!req.body.nombre || req.body.nombre.length < 3) {
    //400 Bad request
    res.status(400).send("Debe ingresar un nombre, que tenga mínimo 3 letras.");
    return;
  }
  const usuario = {
    id: usuarios.length + 1,
    nombre: req.body.nombre,
  };
  usuarios.push(usuario);
  res.send(usuario);*/
});

app.get("/api/usuarios/:firstname/:lastname", (req, res) => {
  res.send(req.params);
});

app.put("/api/usuarios/:id", (req, res) => {
  //Encontrar si existe el objeto usuario
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
    return;
  }

  const { error, value } = validarUsuario(req.body.nombre);

  if (error) {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }

  usuario.nombre = value.nombre; //value.nombre == req.body.nombre
  res.send(usuario);
});

app.delete("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
    return;
  }

  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);
  res.send(usuarios);
});

//Creamos una variable de entorno (process.env) y
//le damos el nombre PORT, si existe dicha variable se
//toma el puerto, y si no, se usa el puerto 3000 por defecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}... `);
});

function existeUsuario(id) {
  return usuarios.find((u) => u.id === parseInt(id));
}

function validarUsuario(nom) {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  return schema.validate({ nombre: nom });
}
