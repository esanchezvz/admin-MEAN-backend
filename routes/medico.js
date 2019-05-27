const express = require('express');
const auth = require('../middlewares/auth');

const app = express();
const Medico = require('../models/medico');

// Rutas
// GET todos los Medicos
app.get('/', (req, res, next) => {
  const offset = Number(req.query.offset) || 0;
  const per_page = Number(req.query.per_page) || 0;

  Medico.find({})
    .skip(offset)
    .limit(per_page)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar medicos',
          errors: err
        });
      }

      Medico.countDocuments({}, (error, count) => {
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: count
        });
      });
    });
});

// Actulizar crear un nuevo medico
app.put('/:id', auth.verifyToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar medico',
        errors: err
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontró el medico con id ' + id,
        errors: {
          message: 'No se encontró el medico por ID.'
        }
      });
    }

    medico.nombre = body.nombre;
    medico.hospital = body.hospital; // Es el id
    medico.usuario = req.usuario._id;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el medico.',
          errors: err
        });
      }

      medicoGuardado.password = '🖕';

      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

// POST crear un nuevo medico
app.post('/', auth.verifyToken, (req, res) => {
  const body = req.body;
  const medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    role: body.role,
    usuario: req.usuario._id,
    hospital: body.hospital // Es el id
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado
    });
  });
});

// Eliminar medico
app.delete('/:id', auth.verifyToken, (req, res) => {
  const id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar medico.',
        errors: err
      });
    }

    if (!medicoEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese id.',
        errors: { message: 'No existe un medico con ese id.' }
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoEliminado
    });
  });
});

module.exports = app;
