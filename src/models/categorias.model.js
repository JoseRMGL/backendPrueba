const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CategoriasSchema = Schema({
    nombreCategoria: String,
    descripcionCategoria:String,
    imagen: String,
    idUsuario: {type:Schema.Types.ObjectId,ref:'Usuarios'}
});

module.exports = mongoose.model('Categorias',CategoriasSchema);