const express = require('express');

const CategoriasController = require('../controllers/categorias.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();
api.post('/agregarCategoria', autenticacionToken.Auth, CategoriasController.AgregarCategoria);
api.put ('/editarCategoria/:ID', autenticacionToken.Auth, CategoriasController.editarCategoria);
api.delete ('/eliminarCategoria/:ID', autenticacionToken.Auth, CategoriasController.eliminarCategoriaRolGestor);
api.get('/getCategorias', autenticacionToken.Auth, CategoriasController.ObtenerCategorias);
api.get ('/getCategoriaRolGestorID/:ID' , autenticacionToken.Auth , CategoriasController.getCategoriaIdRolGestor)

api.post ('/agregarCategoriaAdmin', autenticacionToken.Auth, CategoriasController.AgregarCategoriaRolAdmin);
api.put ('/editarCategoriaAdmin/:ID', autenticacionToken.Auth, CategoriasController.editarCategoriaRolAdmin);
api.delete ('/eliminarCategoriaAdmin/:idCategoria', autenticacionToken.Auth, CategoriasController.eliminarCategoriaRolAdmin);
api.get ('/getCategoriaAdmin', autenticacionToken.Auth , CategoriasController.getCategoriaRolAdmin);
api.get ('/getCategoriasIDRolAdmin/:ID', autenticacionToken.Auth, CategoriasController.getCategoriaIDRolAdmin);


/* al momento de subir esto a github, eliminar las librerias :) */
module.exports= api;