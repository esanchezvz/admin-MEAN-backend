const express = require('express');
const auth = require('../middlewares/auth');

const app = express();
const Hospital = require('../models/hospital');

// TO-DO -> Revisar rutas de medico en postman.

// Rutas
// Obtener todos los hospitales
app.get('/', (req, res, next) => {
  const offset = Number(req.query.offset) || 0;
  const per_page = Number(req.query.per_page) || 0;

  Hospital.find({})
    .skip(offset)
    .limit(per_page)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar hospitales',
          errors: err
        });
      }

      Hospital.countDocuments({}, (error, count) => {
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: count
        });
      });
    });
});

// Actulizar un hospital
app.put('/:id', auth.verifyToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar hospital',
        errors: err
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontró el hospital con id ' + id,
        errors: {
          message: 'No se encontró el hospital por ID.'
        }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el hospital.',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

// POST crear un nuevo hospital
app.post('/', auth.verifyToken, (req, res) => {
  const body = req.body;
  const hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear hospital',
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

// Eliminar hospital
app.delete('/:id', auth.verifyToken, (req, res) => {
  const id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar hospital.',
        errors: err
      });
    }

    if (!hospitalEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese id.',
        errors: { message: 'No existe un hospital con ese id.' }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: hospitalEliminado
    });
  });
});

module.exports = app;
