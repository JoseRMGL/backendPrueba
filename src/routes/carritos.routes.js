const express = require('express');
const autenticacionToken = require ('../middlewares/autenticacion');
const CarritosController = require('../controllers/carritos.controller');
const api = express.Router();

//registro de carrito rol_cliente
api.post('/registrarCarrito',autenticacionToken.Auth, CarritosController.RegistrarCarrito);

//eliminacion de carrito
api.delete('/eliminarProductosCarritos/:idProducto',autenticacionToken.Auth, CarritosController.EliminarProductoCarrito);

// agregar carrito por medio del id del producto
api.put ('/registrarCarritoPorId/:ID', autenticacionToken.Auth, CarritosController.agregarCarritoPorIdProducto);


module.exports= api;