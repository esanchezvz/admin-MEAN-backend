const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');

const app = express();
const Usuario = require('../models/usuario');

// Rutas
// GET todos los usuarios
app.get('/', (req, res, next) => {
  Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al cargar usuarios',
        errors: err
      });
    }

    res.status(200).json({
      ok: true,
      usuarios: usuarios
    });
  });
});

// Actulizar crear un nuevo usuario
app.put('/:id', auth.verifyToken, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encontró el usuario con id ' + id,
        errors: {
          message: 'No se encontró el usuario por ID.'
        }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el usuario.',
          errors: err
        });
      }

      usuarioGuardado.password = '🖕';

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

// POST crear un nuevo usuario
app.post('/', auth.verifyToken, (req, res) => {
  const body = req.body;
  const usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario',
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});

// Eliminar usuario
app.delete('/:id', auth.verifyToken, (req, res) => {
  const id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario.',
        errors: err
      });
    }

    if (!usuarioEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese id.',
        errors: { message: 'No existe un usuario con ese id.' }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioEliminado
    });
  });
});

module.exports = app;
