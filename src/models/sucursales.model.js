
const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var SucursalesSchema = Schema({
    nombreSucursal: String,
    direccionSucursal: String,
    telefonoSucursal: Number,
    departamento: String,
    municipio: String,
    imagen: String,

    idEmpresa: { type: Schema.Types.ObjectId, ref: 'Empresas' },


    gestorSucursales: [{

        idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios' },
        nombre: String,
        apellido: String,
        email: String,
        rol: String

    }],

    datosEmpresa: [{
        idEmpresa: { type: Schema.Types.ObjectId, ref: 'Empresas' },
        nombreEmpresa: String,
        direccion: String,
        telefono: Number,
    }]
});


module.exports = mongoose.model('Sucursales', SucursalesSchema);