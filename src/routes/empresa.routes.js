const express = require('express');

const EmpresaController = require('../controllers/empresas.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();

/*ROL_ADMIN*/
api.post('/agregarEmpresaRolAdmin', autenticacionToken.Auth, EmpresaController.agregarEmpresaRolAdmin);
api.put('/editarEmpresaRolAdmin/:ID', autenticacionToken.Auth , EmpresaController.editarEmpresaRolAdmin)
api.delete('/eliminarEmpresaRolAdmin/:ID', autenticacionToken.Auth, EmpresaController.eliminarEmpresaRolAdmin);
api.get('/getEmpresaRolAdmin', autenticacionToken.Auth, EmpresaController.getEmpresaRolAdmin);
api.get('/getEmpresaIdRolAdmin/:ID', autenticacionToken.Auth, EmpresaController.getEmpresaIdRolAdmin);

/*ROL_GESTOR*/
api.post('/agregarEmpresaRolGestor', autenticacionToken.Auth, EmpresaController.agregarEmpresaRolGestor);
api.put('/editarEmpresaRolGestor/:ID',autenticacionToken.Auth, EmpresaController.editarEmpresaRolGestor);
api.delete('/eliminarEmpresaRolGestor/:ID', autenticacionToken.Auth , EmpresaController.eliminarEmpresaRolGestor);
api.get('/getEmpresaRolGestor', autenticacionToken.Auth , EmpresaController.getEmpresaRolGestor);
api.get('/getEmpresaIdRolGestor/:ID', autenticacionToken.Auth, EmpresaController.getEmpresaIdRolGestor);


module.exports= api;