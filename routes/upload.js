const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const fs = require('fs');

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// Rutas
app.put('/:coleccion/:id', (req, res, next) => {
  const coleccion = req.params.coleccion;
  const id = req.params.id;

  // Validar colecciones
  const validCollection = ['hospitales', 'medicos', 'usuarios'];
  if (validCollection.indexOf(coleccion) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de colección inválida.',
      erros: {
        message: 'Tipo de colección inválida.'
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No se mandó imagen.',
      erros: { message: 'Debe de seleccionar una imagen.' }
    });
  }

  // Obtener nombre del archivo
  const file = req.files.imagen;
  const splitName = file.name.split('.');
  const fileExtension = splitName[splitName.length - 1];

  // Extensiones Permitidas
  const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];
  if (validExtensions.indexOf(fileExtension) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de archivo inválido.',
      erros: {
        message:
          'Los tipos de archivos permitidos son ' + validExtensions.join(', ')
      }
    });
  }

  // Personalizar nombre de archivo "user_id-timestamp.fileExtension"
  const fileName = `${id}-${new Date().getTime()}.${fileExtension}`;

  // Mover archivo del temporal a un path
  const path = `./uploads/${coleccion}/${fileName}`;
  file.mv(path, error => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover archivo a path final.',
        erros: error
      });
    }

    uploadToCollection(coleccion, id, fileName, res);
  });
});

function uploadToCollection(coleccion, id, fileName, res) {
  if (coleccion === 'usuarios') {
    Usuario.findById(id, (err, usuario) => {
      if (!usuario) {
        const deleteImg = './uploads/usuarios/' + fileName;
        fs.unlink(deleteImg, error => {
          if (error) {
            console.log('error_FS:', error);
          }
        });
        return res.status(400).json({
          ok: true,
          mensaje: 'Error al actualizar imagen',
          errors: { message: 'Usuario no existe' }
        });
      }

      const oldPath = './uploads/usuarios/' + usuario.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, error => {
          if (error) {
            console.log('error_FS:', error);
          }
        });
      }

      usuario.img = fileName;

      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = null;

        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizada',
          usuario: usuarioActualizado
        });
      });
    });
  }

  if (coleccion === 'medicos') {
    Medico.findById(id, (err, medico) => {
      if (!medico) {
        const deleteImg = './uploads/medicos/' + fileName;
        fs.unlink(deleteImg, error => {
          if (error) {
            console.log('error_FS:', error);
          }
        });
        return res.status(400).json({
          ok: true,
          mensaje: 'Error al actualizar imagen',
          errors: { message: 'Médico no existe' }
        });
      }

      const oldPath = './uploads/medicos/' + medico.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, error => {
          if (error) {
            console.log('error_FS:', error);
          }
        });
      }

      medico.img = fileName;

      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de médico actualizada',
          usuario: medicoActualizado
        });
      });
    });
  }

  if (coleccion === 'hospitales') {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        const deleteImg = './uploads/hospitales/' + fileName;
        fs.unlink(deleteImg, error => {
          if (error) {
            console.log('error_FS:', error);
          }
        });
        return res.status(400).json({
          ok: true,
          mensaje: 'Error al actualizar imagen',
          errors: { message: 'Hospital no existe' }
        });
      }

      const oldPath = './uploads/hospitales/' + hospital.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, error => {
          if (error) {
            console.log('error_FS:', error);
          }
        });
      }

      hospital.img = fileName;

      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de hospital actualizada',
          usuario: hospitalActualizado
        });
      });
    });
  }
}

module.exports = app;
