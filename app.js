// IMPORTACIONES
const express = require('express');
const cors = require('cors');
var app = express();


// RUTAS
const UsuariosRutas = require('./src/routes/usuario.routes');

const CategoriasRutas = require('./src/routes/categorias.routes');

const ProductosRutas = require ('./src/routes/productos.routes');

const CarritosRutas = require ('./src/routes/carritos.routes');

const EmpresaRutas = require ('./src/routes/empresa.routes');

const SucursalesRutas = require ('./src/routes/sucursales.routes');

const FacturasRutas = require('./src/routes/facturas.routes');
 
// MIDDLEWARE INTERMEDIARIO
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CABECERA
app.use(cors());

// CARGA DE RUTAS 
app.use('/api', UsuariosRutas, CategoriasRutas, ProductosRutas, CarritosRutas, EmpresaRutas, SucursalesRutas, FacturasRutas);

module.exports = app;
