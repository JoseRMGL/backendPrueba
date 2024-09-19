const express = require('express');

const ProductosController = require('../controllers/productos.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();
/*ROL_GESTOR */
api.post('/agregarProductosRolGestor/:idSucursal/:idCategoria', autenticacionToken.Auth, ProductosController.agregarProductoRolGestor);

api.get('/verProductosRolGestor/:idSucursal/:idCategoria', autenticacionToken.Auth, ProductosController.verProductosPorCategoria);

api.get('/verProductosPorCategorias/:ID', autenticacionToken.Auth, ProductosController.obtenerProductosPorIdCategoria);

api.get('/verTodosProductos', autenticacionToken.Auth, ProductosController.obtenerProductos);

/* FUNCIONES QUE FALTAN */
/* VER PRODUCTOS ROL ADMIN */
api.get('/verProductosRolAdmin', autenticacionToken.Auth, ProductosController.obtenerProductosRolAdmin);

/* EDITAR PRODUCTOS ROL GESTOR */
api.put('/editarProductosRolGestor/:ID', autenticacionToken.Auth , ProductosController.editarProductosRolGestor);
/* ELIMINAR PRODUCTOS ROL GESTOR  */
api.delete('/eliminarProductosRolGestor/:ID', autenticacionToken.Auth , ProductosController.eliminarProductosRolGestor);
/* VER PRODUCTOS POR ID ROL GESTOR */
api.get('/verProductosPorId/:ID', autenticacionToken.Auth, ProductosController.verProductosPorId);

/* TAREAS DEL ROL_CLIENTE */
api.get('/verProductosPorSucursal/:ID', autenticacionToken.Auth, ProductosController.obtenerProductosPorIdSucursal);


module.exports= api;