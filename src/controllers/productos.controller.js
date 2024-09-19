const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');
const Sucursales = require('../models/sucursales.model');

function agregarProductoRolGestor(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(403).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    var parametros = req.body;
    const idSucursal = req.params.idSucursal; // ID de la sucursal desde la ruta
    const idCategoria = req.params.idCategoria; // ID de la categoría desde la ruta

    // Validar que se reciban todos los parámetros necesarios
    if (parametros.nombreProducto && parametros.marca &&
        parametros.stock && parametros.precio && parametros.descripcion &&
        parametros.nombreProducto !== "" && parametros.marca !== "" &&
        parametros.stock !== "" && parametros.precio !== "" && parametros.descripcion !== "" && parametros.size !== "") {

        // Buscar la categoría por ID
        Categorias.findById(idCategoria, (err, categoriaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
            if (!categoriaEncontrada) return res.status(404).send({ mensaje: 'Esta categoría no existe.' });

            // Buscar la sucursal por ID
            Sucursales.findById(idSucursal, (err, sucursalEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
                if (!sucursalEncontrada) return res.status(404).send({ mensaje: 'Esta sucursal no existe.' });

                // Crear el modelo de producto
                var productosModel = new Productos();
                productosModel.nombreProducto = parametros.nombreProducto;
                productosModel.marca = parametros.marca;
                productosModel.stock = parametros.stock;
                productosModel.precio = parametros.precio;
                productosModel.descripcion = parametros.descripcion;
                productosModel.size = parametros.size;
                productosModel.imagen = null;

                // Agregar la categoría al array
                productosModel.descripcionCategoria = [{
                    idCategoria: categoriaEncontrada._id, // ID de la categoría
                    nombreCategoria: categoriaEncontrada.nombreCategoria // Nombre de la categoría
                }];

                // Agregar la sucursal al array
                productosModel.datosSucursal = [{
                    idSucursal: sucursalEncontrada._id, // ID de la sucursal
                    nombreSucursal: sucursalEncontrada.nombreSucursal, // Nombre de la sucursal
                    direccionSucursal: sucursalEncontrada.direccionSucursal, // Dirección de la sucursal
                    telefonoSucursal: sucursalEncontrada.telefonoSucursal // Teléfono de la sucursal
                }];

                // Guardar el producto
                productosModel.save((err, productosGuardados) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar el producto' });
                    if (!productosGuardados) return res.status(500).send({ mensaje: 'Error al agregar el producto' });
                    return res.status(200).send({ productos: productosGuardados });
                });
            });
        });
    } else {
        return res.status(400).send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, marca, descripción, stock, precio, size). Además, los campos no pueden ser vacíos' });
    }
}




/* 
function agregarProductoRolAdmin(req, res) {
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }
    var parametros = req.body;
    if (parametros.nombreProducto && parametros.marca &&
        parametros.stock && parametros.precio && parametros.descripcion && parametros.nombreCategoria &&
        parametros.nombreProducto != "" && parametros.marca != "" &&
        parametros.stock != "" && parametros.precio != "" && parametros.descripcion != "" && parametros.nombreCategoria != "") {
        Categorias.findOne({ nombreCategoria: parametros.nombreCategoria }, (err, categoriaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!categoriaEncontrada) return res.status(500).send({ mensaje: 'Esta Categoría no existe. Verifique el nombre' });
            var productosModel = new Productos();
            productosModel.nombreProducto = parametros.nombreProducto;
            productosModel.marca = parametros.marca;
            productosModel.stock = parametros.stock;
            productosModel.precio = parametros.precio;
            productosModel.descripcion = parametros.descripcion;
            productosModel.idCategoria = categoriaEncontrada._id;

            productosModel.save((err, productosGuardados) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!productosGuardados) return res.status(500).send({ mensaje: 'Error al agregar la empresa' });
                return res.status(200).send({ productos: productosGuardados });
            });
        });
    } else {
        return res.status(500)
            .send({ mensaje: 'Debe llenar los campos necesarios (nombreProducto, marca, descripción, stock, precio y nombreCategoria). Además, los campos no pueden ser vacíos' });
    }
} */


function verProductosPorCategoria(req, res) {

    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }

    const idSucursal = req.params.idSucursal; // ID de la sucursal desde la ruta
    const idCategoria = req.params.idCategoria; // ID de la categoría desde la ruta

    // Validar que se reciban ambos IDs
    if (!idSucursal || !idCategoria) {
        return res.status(400).send({ mensaje: 'Faltan el ID de la sucursal o el ID de la categoría.' });
    }

    // Buscar los productos por ID de sucursal y ID de categoría
    Productos.find({ idSucursal, idCategoria }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal y categoría proporcionadas.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });
}



function obtenerProductosPorIdCategoria(req, res) {

    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    const idCategoria = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idCategoria) {
        return res.status(400).send({ mensaje: 'Falta el ID de la categoría.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Productos.find({ 'descripcionCategoria.idCategoria': idCategoria }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la categoría proporcionada.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });
}



function obtenerProductos(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    Productos.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        return res.send({ productos: productosObtenidos })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */
    })
}


/* ver productos rol admin */
function obtenerProductosRolAdmin(req, res) {
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }

    Productos.find((err, productosEncontrados) => {

        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos' })
        if (!productosEncontrados) return res.status(500).send({ mensaje: 'No existen los productos' })

        return res.status(200).send({ productos: productosEncontrados })
    })
}


/* Editar productos solo el rol_gestor */
function editarProductosRolGestor(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    var parametros = req.body;
    var idProducto = req.params.ID;

    Productos.findByIdAndUpdate(idProducto, parametros, { new: true }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!productosEncontrados) return res.status(500).send({ mensaje: "Error al editar el producto" });
        return res.status(200).send({ productos: productosEncontrados });
    })
}



function eliminarProductosRolGestor(req,res){
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción" });
    }

    var idProducto = req.params.ID;
    Productos.findByIdAndDelete(idProducto,(err, eliminarProducto)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!eliminarProducto)return res.status(500).send({mensaje : "Error al eliminar la Empresa"});
        return res.status(200).send({productos: eliminarProducto});
    })
}



function verProductosPorId(req,res){
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }
    var idProducto = req.params.ID;

    Productos.findById(idProducto, (err,productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la petición"});
        if(!productoEncontrado) return res.status(500).send({ mensaje: "Error al ver los productos"});
        return res.status(200).send({ productos: productoEncontrado});
    })

}


  
/* TAREAS DEL ROL_CLIENTE */
function obtenerProductosPorIdSucursal(req, res) {

    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción" });
    }

    const idSucursal = req.params.ID; // ID de la categoría desde la ruta

    // Validar que se reciba el ID de la categoría
    if (!idSucursal) {
        return res.status(400).send({ mensaje: 'Falta el ID de la sucursal.' });
    }

    // Buscar los productos por ID de categoría en el array descripcionCategoria
    Productos.find({ 'datosSucursal.idSucursal': idSucursal }, (err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos.' });
        if (!productosEncontrados || productosEncontrados.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron productos para la sucursal proporcionada.' });
        }

        return res.status(200).send({ productos: productosEncontrados });
    });
}


module.exports = {
    agregarProductoRolGestor,
    verProductosPorCategoria,
    obtenerProductosPorIdCategoria,
    obtenerProductos,
    obtenerProductosRolAdmin,
    editarProductosRolGestor,
    eliminarProductosRolGestor,
    verProductosPorId,
    obtenerProductosPorIdSucursal
}