const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const SEED = require('../config/config').SEED;
const CLIENT_ID = require('../config/config').CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);
const app = express();
const Usuario = require('../models/usuario');

// Autenticación Interna
app.post('/', (req, res) => {
  const body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el usuario por email.',
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: {
          message: 'Credenciales incorrectas - email'
        }
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: {
          message: 'Credenciales incorrectas - password'
        }
      });
    }

    // Crear Token
    usuarioDB.password = '🖕';
    const token = jwt.sign({ usuario: usuarioDB }, SEED, {
      expiresIn: 14400
    }); //4 hrs

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      id: usuarioDB._id,
      token
    });
  });
});

// Autenticación Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post('/google', async (req, res) => {
  const token = req.body.token;
  const googleUser = await verify(token).catch(err => {
    res.status(403).json({
      ok: false,
      mensaje: 'Token de google inválido.'
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario.',
        errors: err
      });
    }

    if (usuarioDB) {
      if (!usuarioDB.google) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe usar su autenticación normal.',
          errors: err
        });
      } else {
        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        }); //4 hrs

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          id: usuarioDB._id,
          token
        });
      }
    } else {
      // El usuario no existe, hay que crearlo
      const usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = 'doesntmatter';

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario.',
            errors: err
          });
        }

        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        }); //4 hrs

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          id: usuarioDB._id,
          token
        });
      });
    }
  });

  // res.status(200).json({
  //   ok: true,
  //   googleUser
  // });
});

module.exports = app;
