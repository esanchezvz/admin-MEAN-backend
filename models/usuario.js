const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const rolesUsuario = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol válido.'
};

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido.']
  },
  email: {
    type: String,
    required: [true, 'El correo es requerido.'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida.']
  },
  img: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: [true, 'El rol de usuario es requerido'],
    default: 'USER_ROLE',
    enum: rolesUsuario
  }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} ya existe.' });

module.exports = mongoose.model('Usuario', usuarioSchema);
