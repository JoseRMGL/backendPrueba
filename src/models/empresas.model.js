const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({
    nombreEmpresa: String,
    direccion:String,
    telefono:Number,
    mision:String,
    vision:String,
    historia:String,

    idUsuario: {type:Schema.Types.ObjectId,ref:'Usuarios'}
});

module.exports = mongoose.model('Empresas',EmpresaSchema);