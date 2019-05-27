const express = require('express');

const app = express();
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// Rutas
// Búsqueda Global
app.get('/all/:search', (req, res, next) => {
  const search = req.params.search;
  const regEx = new RegExp(search, 'i');

  Promise.all([
    hospitalSearch(search, regEx),
    medicoSearch(search, regEx),
    usuarioSearch(search, regEx)
  ]).then(response => {
    res.status(200).json({
      ok: true,
      hospitales: response[0],
      medicos: response[1],
      usuarios: response[2]
    });
  });
});

// Búsqueda por colección
app.get('/collection/:tabla/:search', (req, res) => {
  const search = req.params.search;
  const tabla = req.params.tabla;
  const regEx = new RegExp(search, 'i');
  let promesa;

  switch (tabla) {
    case 'medicos':
      promesa = medicoSearch(search, regEx);
      break;
    case 'usuarios':
      promesa = usuarioSearch(search, regEx);
      break;
    case 'hospitales':
      promesa = hospitalSearch(search, regEx);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          'Los parametros de búsqueda son usuarios, medicos y hospitales.',
        err: { message: 'La collección solicitada no existe.' }
      });
      break;
  }

  promesa.then(response => {
    res.status(200).json({
      ok: true,
      [tabla]: response
    });
  });
});

// Funciones de Búsqueda
function hospitalSearch(search, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate('usuario', 'nombre email')
      .exec((err, hospitales) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function medicoSearch(search, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate('usuario', 'nombre email')
      .populate('hospital')
      .exec((err, medicos) => {
        if (err) {
          reject('Error al cargar medicos', err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function usuarioSearch(search, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role')
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
