const express = require('express');

const usuarioController = require('../controllers/usuarios.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();

api.post('/login', usuarioController.Login);
api.post('/agregarUsuario',usuarioController.agregarUsuario);

api.post('/solicitar-codigo', usuarioController.solicitarCodigoRestablecimiento);
api.post('/restablecer-password', usuarioController.restablecerPassword);

/* ---------- ADMINISTRACIÓN DEL ROL ADMIN --------- */
api.post ('/agregarRolCliente', autenticacionToken.Auth,  usuarioController.agregarClienteRolAdmin);
/* Editar usuario, el ID es el que se puso en el codigo */
api.put ('/editarRolCliente/:ID', autenticacionToken.Auth, usuarioController.editarUsuarioRolCliente);
/* Eliminar usuario por medio del id*/
api.delete("/eliminarRolCliente/:ID", autenticacionToken.Auth, usuarioController.eliminarUsuarioRolCliente);
/* Ver usuarios que tengan ROL_CLIENTE*/
api.get('/getUsuariosRolCliente', autenticacionToken.Auth, usuarioController.getUsuariosRolCliente);
/* Ver propio usuario por ID ROL_CLIENTE, ver perfil en conclusión */
api.get('/getUsuarioRolCliente/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolCliente);

/* ---------------- TAREAS DEL ROL_ADMIN  ---------*/
/* editar perfil put ID*/
api.put ('/editarRolAdmin/:ID' , autenticacionToken.Auth, usuarioController.editarUsuarioRolAdmin);

/* agregar, ROL_FACTURADOR por defecto post*/
api.post ('/agregarRolFacturador', autenticacionToken.Auth,  usuarioController.agregarFacturador);
/* agregar, ROL_EMPLEADO por defecto post*/
api.post ('/agregarRolEmpleado',  autenticacionToken.Auth, usuarioController.agregarEmpleado);
/* agregar, ROL_GESTOR por defecto post*/
api.post ('/agregarRolGestor',  autenticacionToken.Auth, usuarioController.agregarGestor);
/* ver usuarios con ROL_FACTURADOR get */
api.get ('/getUsuariosRolFacturador', autenticacionToken.Auth, usuarioController.getUsuariosRolFacturador);
/* ver usuarios con ROL_EMPLEADO  get*/
api.get ('/getUsuarioRolEmpleado', autenticacionToken.Auth, usuarioController.getUsuariosRolEmpleado);
/* ver usuarios con ROL_GESTOR get*/
api.get ('/getUsuarioRolGestor', autenticacionToken.Auth, usuarioController.getUsuariosRolGestor);
/* ver propio usuario por ID get ID*/
api.get ('/getUsuarioAdministrador/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolAdministrador);


/* ---------- TAREAS DEL ROL_FACTURADOR ------------- */
/* Editar usuario, el ID es el que se puso en el codigo */
api.put ('/editarRolFacturador/:ID', autenticacionToken.Auth, usuarioController.editarUsuarioRolFacturador);
/* Eliminar usuario por medio del id*/
api.delete("/eliminarRolFacturador/:ID", autenticacionToken.Auth, usuarioController.eliminarUsuarioRolFacturador);
/* Ver usuarios que tengan ROL_CLIENTE*/
api.get('/getUsuariosRolFacturador', autenticacionToken.Auth, usuarioController.getUsuariosRolFacturador);
/* Ver propio usuario por ID ROL_CLIENTE, ver perfil en conclusión */
api.get('/getUsuarioRolFacturador/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolFacturador);

/* ---------------TAREAS DEL ROL_GESTOR ---------- */
/* editar perfil */
api.put ('/editarRolGestor/:ID', autenticacionToken.Auth,  usuarioController.editarUsuarioRolGestor);
/* eliminar perfil */
api.delete ('/eliminarRolGestor/:ID', autenticacionToken.Auth, usuarioController.eliminarUsuarioRolGestor);
/* ver a los usuarios que tengan ROL_GESTOR */
api.get('/getUsuariosRolGestor', autenticacionToken.Auth, usuarioController.getUsuariosRoLGestor);
/* ver propio usuario por ID */
api.get('/getUsuarioRolGestor/:ID', autenticacionToken.Auth, usuarioController.getUsuarioIdRolGestor);

/* al momento de subir esto a github, eliminar las librerias :) */
module.exports= api;