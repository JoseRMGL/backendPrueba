const express = require('express');

const FacturaController = require('../controllers/facturas.controller');
const autenticacionToken = require ('../middlewares/autenticacion');

const api = express.Router();

//api.post('/generarFacturas', autenticacionToken.Auth, FacturaController.GenerarFactura);
// CREAR FUNCION
api.post('/crearFacturaCliente', autenticacionToken.Auth, FacturaController.CrearFacturaCliente);


module.exports= api;