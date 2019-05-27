const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Rutas
app.get('/:coleccion/:img', (req, res, next) => {
  const coleccion = req.params.coleccion;
  const img = req.params.img;
  const imgPath = path.resolve(__dirname, `../uploads/${coleccion}/${img}`);

  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  } else {
    const noImgPath = path.resolve(__dirname, `../assets/img/no-img.jpg`);
    res.sendFile(noImgPath);
  }
});

module.exports = app;
