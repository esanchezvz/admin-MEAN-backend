// Requirements
const express = require('express');
const mongoose = require('mongoose');

// Variables
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const loginRoutes = require('./routes/login');
const busquedaRoutes = require('./routes/busqueda');
const uploadRoutes = require('./routes/upload');
const imgRoutes = require('./routes/imagenes');

// Inicialización
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Server Index Config
// const serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/search', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);
app.use('/', appRoutes);

// Conexión DB
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  { useNewUrlParser: true },
  (err, res) => {
    if (err) throw err;
    console.log(`DB listening on port: 27017 \x1b[32m%s\x1b[0m`, 'online');
  }
);

// Escuchar Servidor
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT} \x1b[32m%s\x1b[0m`, 'online');
});
