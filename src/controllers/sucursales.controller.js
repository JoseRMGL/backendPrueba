const Sucursales = require('../models/sucursales.model'); // Asegúrate de que la ruta sea correcta
const Empresas = require('../models/empresas.model'); // Asegúrate de importar el modelo de Empresas
const Usuarios = require('../models/usuarios.model'); // Asegúrate de importar el modelo de Usuario
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');


function AgregarSucursal(req, res) {

    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }

    // Obtención de parámetros
    const parametros = req.body;
    const idEmpresa = req.params.ID; // ID de la empresa desde la ruta

    // Validar que se reciban los parámetros necesarios
    // Validar que se reciban los parámetros necesarios
    if (!parametros.nombreSucursal || !parametros.direccionSucursal || !parametros.telefonoSucursal || !parametros.email) {
        return res.status(400).send({ mensaje: 'Faltan parámetros necesarios (nombreSucursal, direccionSucursal, telefonoSucursal, email).' });
    }

    // Buscar la empresa por ID
    Empresas.findById(idEmpresa, (err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar la empresa.' });
        if (!empresaEncontrada) return res.status(404).send({ mensaje: 'Empresa no encontrada.' });

        // Buscar el usuario por email
        Usuarios.findOne({ email: parametros.email }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error al buscar el usuario.' });
            if (!usuarioEncontrado) return res.status(404).send({ mensaje: 'Usuario no encontrado por el email proporcionado.' });

            // Verificar que el usuario tenga el rol ROL_GESTOR
            if (usuarioEncontrado.rol !== 'ROL_GESTOR') {
                return res.status(403).send({ mensaje: 'Solo los usuarios con rol ROL_GESTOR pueden ser agregados a una sucursal.' });
            }

            // Buscar si la sucursal ya existe
            Sucursales.findOne({ nombreSucursal: parametros.nombreSucursal, idEmpresa: idEmpresa }, (err, sucursalEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error al buscar la sucursal.' });

                if (sucursalEncontrada) {
                    // Sucursal ya existe, agregar el usuario al array gestorSucursales
                    sucursalEncontrada.gestorSucursales.push({
                        idUsuario: usuarioEncontrado._id,
                        nombre: usuarioEncontrado.nombre,
                        apellido: usuarioEncontrado.apellido,
                        email: usuarioEncontrado.email,
                        rol: usuarioEncontrado.rol
                    });

                    // Guardar la sucursal actualizada
                    sucursalEncontrada.save((err, sucursalActualizada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error al actualizar la sucursal.' });
                        return res.status(200).send({ mensaje: 'Usuario agregado a la sucursal existente.', sucursales: sucursalActualizada });
                    });
                } else {
                    // Sucursal no existe, crear una nueva
                    const nuevaSucursal = new Sucursales({
                        nombreSucursal: parametros.nombreSucursal,
                        direccionSucursal: parametros.direccionSucursal,
                        telefonoSucursal: parametros.telefonoSucursal,
                        idEmpresa: idEmpresa,
                        gestorSucursales: [{
                            idUsuario: usuarioEncontrado._id,
                            nombre: usuarioEncontrado.nombre,
                            apellido: usuarioEncontrado.apellido,
                            email: usuarioEncontrado.email,
                            rol: usuarioEncontrado.rol
                        }]
                    });

                    // Guardar la nueva sucursal en la base de datos
                    nuevaSucursal.save((err, sucursalGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error al guardar la sucursal.' });
                        return res.status(200).send({ mensaje: 'Sucursal agregada con éxito.', sucursales: sucursalGuardada });
                    });
                }
            });
        });
    });



}

function AgregarSucursalPorIdEmpresaUsuario(req, res) {
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción." });
    }

    // Obtención de parámetros
    const parametros = req.body;
    const idEmpresa = req.params.idEmpresa; // ID de la empresa desde la ruta
    const idUsuario = req.params.idUsuario; // ID del usuario desde la ruta

    // Validar que se reciban los parámetros necesarios
    if (!parametros.nombreSucursal || !parametros.direccionSucursal || !parametros.telefonoSucursal || !parametros.departamento || !parametros.municipio) {
        return res.status(400).send({ mensaje: 'Faltan parámetros necesarios (nombreSucursal, direccionSucursal, telefonoSucursal, departamento, municipio).' });
    }

    // Buscar la empresa por ID
    Empresas.findById(idEmpresa, (err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar la empresa.' });
        if (!empresaEncontrada) return res.status(404).send({ mensaje: 'Empresa no encontrada.' });

        // Obtener los datos de la empresa para el array datosEmpresa
        const datosEmpresa = {
            idEmpresa: empresaEncontrada._id,
            nombreEmpresa: empresaEncontrada.nombreEmpresa,
            direccion: empresaEncontrada.direccion,
            telefono: empresaEncontrada.telefono
        };

        // Buscar el usuario por ID
        Usuarios.findById(idUsuario, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error al buscar el usuario.' });
            if (!usuarioEncontrado) return res.status(404).send({ mensaje: 'Usuario no encontrado por el ID proporcionado.' });

            // Verificar que el usuario tenga el rol ROL_GESTOR
            if (usuarioEncontrado.rol !== 'ROL_GESTOR') {
                return res.status(403).send({ mensaje: 'Solo los usuarios con rol ROL_GESTOR pueden ser agregados a una sucursal.' });
            }

            // Buscar si la sucursal ya existe
            Sucursales.findOne({ nombreSucursal: parametros.nombreSucursal, idEmpresa: idEmpresa }, (err, sucursalEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error al buscar la sucursal.' });

                if (sucursalEncontrada) {
                    // Sucursal ya existe, agregar el usuario al array gestorSucursales
                    sucursalEncontrada.gestorSucursales.push({
                        idUsuario: usuarioEncontrado._id,
                        nombre: usuarioEncontrado.nombre,
                        apellido: usuarioEncontrado.apellido,
                        email: usuarioEncontrado.email,
                        rol: usuarioEncontrado.rol
                    });

                    // Guardar la sucursal actualizada
                    sucursalEncontrada.save((err, sucursalActualizada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error al actualizar la sucursal.' });
                        return res.status(200).send({ mensaje: 'Usuario agregado a la sucursal existente.', sucursales: sucursalActualizada });
                    });
                } else {
                    // Sucursal no existe, crear una nueva
                    const nuevaSucursal = new Sucursales({
                        nombreSucursal: parametros.nombreSucursal,
                        direccionSucursal: parametros.direccionSucursal,
                        telefonoSucursal: parametros.telefonoSucursal,
                        departamento: parametros.departamento,
                        municipio: parametros.municipio,
                        idEmpresa: idEmpresa,
                        datosEmpresa: [datosEmpresa],
                        gestorSucursales: [{
                            idUsuario: usuarioEncontrado._id,
                            nombre: usuarioEncontrado.nombre,
                            apellido: usuarioEncontrado.apellido,
                            email: usuarioEncontrado.email,
                            rol: usuarioEncontrado.rol
                        }],
                        imagen: null // Campo de imagen inicializado como null
                    });

                    // Guardar la nueva sucursal en la base de datos
                    nuevaSucursal.save((err, sucursalGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error al guardar la sucursal.' });
                        return res.status(200).send({ mensaje: 'Sucursal agregada con éxito.', sucursales: sucursalGuardada });
                    });
                }
            });
        });
    });
}

/* SOLO ADMIN */
function obtenerSucursalesporIdGestor(req, res) {

    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }

    const idUsuario = req.params.ID; // ID del gestor desde la ruta

    // Validar que se reciba el ID del gestor
    if (!idUsuario) {
        return res.status(400).send({ mensaje: 'Falta el ID del gestor.' });
    }

    // Buscar las sucursales donde el gestor sea parte de ellas
    Sucursales.find({ 'gestorSucursales.idUsuario': idUsuario }, (err, sucursalesEncontradas) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar las sucursales.' });
        if (!sucursalesEncontradas || sucursalesEncontradas.length === 0) {
            return res.status(500).send({ mensaje: 'No se encontraron sucursales para el gestor proporcionado.' });
        }

        return res.status(200).send({ sucursales: sucursalesEncontradas });
    });

}


/* SOLO ADMIN */
function obtenersucursalesPorIdEmpresa(req, res) {

    // Verificar el rol del usuario
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(403).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }

    const idEmpresa = req.params.ID; // ID de la empresa desde la ruta

    // Validar que se reciba el ID de la empresa
    if (!idEmpresa) {
        return res.status(400).send({ mensaje: 'Falta el ID de la empresa.' });
    }

    // Buscar las sucursales donde la empresa sea parte de ellas
    Sucursales.find({ idEmpresa: idEmpresa }, (err, sucursalesEncontradas) => {
        if (err) return res.status(500).send({ mensaje: 'Error al buscar las sucursales.' });
        if (!sucursalesEncontradas || sucursalesEncontradas.length === 0) {
            return res.status(404).send({ mensaje: 'No se encontraron sucursales para la empresa proporcionada.' });
        }

        return res.status(200).send({ sucursales: sucursalesEncontradas });
    });
}

/* editar, eliminar, ver todas sucursales, ver sucursal por id*/
function editarSucursalRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_ADMIN puede realizar esta acción." });
    }

    var parametros = req.body;
    var idAdmin = req.params.ID;

    // Verificar si el nuevo nombre de la sucursal ya existe
    Sucursales.findOne({ nombreSucursal: parametros.nombreSucursal, _id: { $ne: idAdmin } }, (err, sucursalExistente) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (sucursalExistente) {
            return res.status(400).send({ mensaje: "Error: La sucursal con este nombre ya existe." });
        }

        // Si no existe, proceder a editar la sucursal
        Sucursales.findByIdAndUpdate(idAdmin, parametros, { new: true }, (err, sucursalesEncontradas) => {
            if (err) return res.status(500).send({ mensaje: "Error en la petición." });
            if (!sucursalesEncontradas) return res.status(500).send({ mensaje: "Error al editar la Sucursal." });
            return res.status(200).send({ sucursales: sucursalesEncontradas });
        });
    });
}

function eliminarSucursalRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    }

    var idAdmin = req.params.ID;
    Sucursales.findByIdAndDelete(idAdmin,(err,eliminarSucursal)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!eliminarSucursal)return res.status(500).send({mensaje : "Error al eliminar la Sucursal"});
        return res.status(200).send({sucursales: eliminarSucursal});
    })
}
function verSucursalRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    }

    Sucursales.find((err, sucursalesEncontradas) => {
  
        if (err) return res.status(500).send({ mensaje: 'Error al buscar las sucursales' })
        if (!sucursalesEncontradas) return res.status(500).send({ mensaje: 'No existen las sucursales' })
    
        return res.status(200).send({ sucursales: sucursalesEncontradas })
    })
}


function verSucursalIdRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
    }
    var idAdmin = req.params.ID;

    Sucursales.findById(idAdmin, (err,sucursalEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la petición"});
        if(!sucursalEncontrada) return res.status(500).send({ mensaje: "Error al ver las sucrusales"});
        return res.status(200).send({ sucursales: sucursalEncontrada});
    })
}



function verSucursalRolGestor(req, res) {

  
  
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }

    Sucursales.find((err, sucursalesEncontradas) => {
  
      if (err) return res.status(500).send({ mensaje: 'Error al buscar las sucursales' })
      if (!sucursalesEncontradas) return res.status(500).send({ mensaje: 'No existen las sucursales' })
  
      return res.status(200).send({ sucursales: sucursalesEncontradas })
  })
  
  }

  /* tareas nuevas rol gestor */
  function verSucursalesPorGestorRegistrado(req, res) {

    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_GESTOR puede realizar esta acción." });
    }

    Sucursales.find({ gestorSucursales: { $elemMatch: { idUsuario: req.user.sub } } }, (err, sucursalesEncontradas) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición." });
        if (!sucursalesEncontradas || sucursalesEncontradas.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron sucursales para este gestor." });
        }
        return res.status(200).send({ sucursales: sucursalesEncontradas });
    });
}

  
/* TAREAS DEL ROL_CLIENTE */
function ObtenerSucursalesRolCliente(req, res) {
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Únicamente el ROL_CLIENTE puede realizar esta acción." });
    }

    Sucursales.find((err, sucursalesEncontradas) => {

        if (err) return res.status(500).send({ mensaje: 'Error al buscar los productos' })
        if (!sucursalesEncontradas) return res.status(500).send({ mensaje: 'No existen los productos' })

        return res.status(200).send({ sucursales: sucursalesEncontradas })
    })
}



module.exports = {
    AgregarSucursal,
    obtenerSucursalesporIdGestor,
    obtenersucursalesPorIdEmpresa,
    editarSucursalRolAdmin,
    eliminarSucursalRolAdmin,
    verSucursalRolAdmin,
    verSucursalIdRolAdmin,
    AgregarSucursalPorIdEmpresaUsuario,
    verSucursalRolGestor,
    verSucursalesPorGestorRegistrado,
    ObtenerSucursalesRolCliente
}

