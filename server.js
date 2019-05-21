// Requirements
const express = require('express');
const mongoose = require('mongoose');

// Variables
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');

// Inicialización
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);

// Conexión DB
mongoose.set('useCreateIndex', true);
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  { useNewUrlParser: true },
  (err, res) => {
    if (err) throw err;
    console.log(`DB on port: 27017 \x1b[32m%s\x1b[0m`, 'online');
  }
);

// Escuchar Servidor
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT} \x1b[32m%s\x1b[0m`, 'online');
});
