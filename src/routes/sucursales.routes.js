const express = require('express');

const SucursalesController = require('../controllers/sucursales.controller');
const autenticacionToken = require ('../middlewares/autenticacion');
const api = express.Router();

/* agregar sucursal por id de la empresa */
api.post('/agregarSucursal/:ID', autenticacionToken.Auth, SucursalesController.AgregarSucursal);

/* ver sucursales por el id de la empresa*/
api.get('/verSucursalPorEmpresa/:ID', autenticacionToken.Auth, SucursalesController.obtenersucursalesPorIdEmpresa);

/* NUEVA FUNCION PARA AGREGAR SUCURSAL AUTOMATIZA PROCESOS */
api.post('/agregarSucursalPor/:idEmpresa/:idUsuario', autenticacionToken.Auth, SucursalesController.AgregarSucursalPorIdEmpresaUsuario);

//SOLO ADMIN
/* estas 3 funciones cambiarlas */
api.put('/editarSucursalRolAdmin/:ID', autenticacionToken.Auth, SucursalesController.editarSucursalRolAdmin);
api.delete('/eliminarSucursalRolAdmin/:ID' , autenticacionToken.Auth, SucursalesController.eliminarSucursalRolAdmin);
api.get('/verSucursalIDRolAdmin/:ID', autenticacionToken.Auth , SucursalesController.verSucursalIdRolAdmin);

api.get('/verSucursalRolAdmin',autenticacionToken.Auth , SucursalesController.verSucursalRolAdmin);

// tareas del rol GESTOR

/* ver todas sucursales */
api.get('/verSucursalRolGestor',autenticacionToken.Auth , SucursalesController.verSucursalRolGestor);
/* Ver sucursal por gestor */
api.get('/verSucursalPorGestor/:ID', autenticacionToken.Auth, SucursalesController.obtenerSucursalesporIdGestor);
/* Ver sucursal del usuario que este registrado */
api.get('/verSucursalGestorRegistrado', autenticacionToken.Auth, SucursalesController.verSucursalesPorGestorRegistrado);



// tareas del ROL_CLIENTE
api.get('/verTodasSucursalesRolCliente',autenticacionToken.Auth , SucursalesController.ObtenerSucursalesRolCliente);

module.exports= api;