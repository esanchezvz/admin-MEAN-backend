// Requirements
const express = require('express');
const mongoose = require('mongoose');

// Inicialización
const PORT = process.env.PORT || 5000;
const app = express();

// Conexión DB
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  (err, res) => {
    if (err) throw err;
    console.log(`DB on port: 27017 \x1b[32m%s\x1b[0m`, 'online');
  }
);

// Rutas
app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Petición realizada correctamente'
  });
});

// Escuchar Servidor
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT} \x1b[32m%s\x1b[0m`, 'online');
});
