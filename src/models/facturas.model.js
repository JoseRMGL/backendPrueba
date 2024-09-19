const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var FacturasSchema = Schema({
    nit: String,
    fecha: Date,
    datosUsuario: [{
        idUsuario: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
        nombre: String,
        apellido: String,
        email: String
    }],
    compras: [{
        idProducto: {type:Schema.Types.ObjectId,ref:'Productos'},
        nombreProducto: String,
        cantidad: Number,
        precio: Number,
        subTotal: Number,
        descripcionCategoria: [{
            idCategoria: { type: Schema.Types.ObjectId, ref: 'Categorias' },
            nombreCategoria: String,
        }],
        datosSucursal: [{
            idSucursal: { type: Schema.Types.ObjectId, ref: 'Sucursales' },
            nombreSucursal: String,
            direccionSucursal: String,
            telefonoSucursal: String
        }] 
    }],
    total: Number
    
});

module.exports = mongoose.model('Facturas',FacturasSchema);