// CONTROLLER USUARIOS AXEL ALVAREZ
const Usuarios = require('../models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

function restablecerPassword(req, res) {
  const { email, codigo, nuevaPassword } = req.body;

  Usuarios.findOne({ email: email }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
    if (!usuarioEncontrado) return res.status(404).send({ mensaje: 'No se encontró un usuario con este correo electrónico' });

    // Verificar si el código es correcto y no ha expirado
    if (usuarioEncontrado.codigoRestablecimiento !== codigo || Date.now() > usuarioEncontrado.expiracionCodigoRestablecimiento) {
      return res.status(400).send({ mensaje: 'Código de verificación inválido o expirado' });
    }

    // Encriptar la nueva contraseña
    bcrypt.hash(nuevaPassword, null, null, (err, passwordEncriptada) => {
      if (err) return res.status(500).send({ mensaje: 'Error al encriptar la contraseña' });

      // Actualizar la contraseña y limpiar el código de restablecimiento
      usuarioEncontrado.password = passwordEncriptada;
      usuarioEncontrado.codigoRestablecimiento = undefined;
      usuarioEncontrado.expiracionCodigoRestablecimiento = undefined;

      usuarioEncontrado.save((err) => {
        if (err) return res.status(500).send({ mensaje: 'Error al guardar la nueva contraseña' });

        return res.status(200).send({ mensaje: 'Contraseña restablecida con éxito' });
      });
    });
  });
}

function solicitarCodigoRestablecimiento(req, res) {
  const { email } = req.body;

  Usuarios.findOne({ email: email }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la petición' });
    if (!usuarioEncontrado) return res.status(404).send({ mensaje: 'No se encontró un usuario con este correo electrónico' });

    // Generar código de verificación
    const codigoVerificacion = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Guardar el código y la fecha de expiración en el documento del usuario
    usuarioEncontrado.codigoRestablecimiento = codigoVerificacion;
    usuarioEncontrado.expiracionCodigoRestablecimiento = Date.now() + 3600000; // 1 hora de validez

    usuarioEncontrado.save((err) => {
      if (err) return res.status(500).send({ mensaje: 'Error al guardar el código de verificación' });

      // Configurar el transporte de correo
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tu_correo@gmail.com',
          pass: 'tu_contraseña'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Configurar el correo
      const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: email,
        subject: 'Código de verificación para restablecer contraseña',
        text: `Tu código de verificación es: ${codigoVerificacion}. Este código expirará en 1 hora.`
      };

      // Enviar el correo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error al enviar el correo:', error);
          // Aún así, devolvemos los datos del usuario y el código
          return res.status(200).send({
            mensaje: 'Se ha generado un código de verificación, pero hubo un error al enviar el correo electrónico',
            usuario: {
              email: usuarioEncontrado.email,
              codigoRestablecimiento: codigoVerificacion,
              expiracionCodigoRestablecimiento: usuarioEncontrado.expiracionCodigoRestablecimiento
            }
          });
        } else {
          console.log('Email enviado:', info.response);
          return res.status(200).send({
            mensaje: 'Se ha enviado un código de verificación a tu correo electrónico',
            usuario: {
              email: usuarioEncontrado.email,
              codigoRestablecimiento: codigoVerificacion,
              expiracionCodigoRestablecimiento: usuarioEncontrado.expiracionCodigoRestablecimiento
            }
          });
        }
      });
    });
  });
}


function Login(req, res) {

  var parametros = req.body;

  Usuarios.findOne({ email: parametros.email }, (err, usuarioEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
    if (usuarioEncontrado) {
      bcrypt.compare(parametros.password, usuarioEncontrado.password,
        (err, verificacionPassword) => {
          if (verificacionPassword) {

            if (parametros.obtenerToken === 'true') {

              return res.status(200).send({ token: jwt.crearToken(usuarioEncontrado) })

            } else {
              usuarioEncontrado.password = undefined;
              return res.status(200).send({ usuario: usuarioEncontrado })
            }
          } else {
            return res.status(500).send({ mensaje: 'La contraseña es incorrecta' });
          }
        })
    } else {
      return res.status(500).send({ mensaje: 'El correo no esta asignado' })
    }
  })
}



function agregarUsuario(req, res) {

  var parametros = req.body;
  var usuarioModel = new Usuarios();
  if (parametros.nombre && parametros.apellido && parametros.email && parametros.password) {
    usuarioModel.nombre = parametros.nombre;
    usuarioModel.apellido = parametros.apellido;
    usuarioModel.email = parametros.email;
    usuarioModel.password = parametros.password;
    usuarioModel.rol = 'ROL_CLIENTE';
    usuarioModel.telefono = parametros.telefono;
    usuarioModel.direccion = parametros.direccion;
    usuarioModel.departamento = parametros.departamento;
    usuarioModel.municipio = parametros.municipio;
    usuarioModel.imagen = null;



    //Verificacion de email
    Usuarios.find({ email: parametros.email }, (err, usuarioEncontrado) => {
      if (usuarioEncontrado.length == 0) {
        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
          usuarioModel.password = passwordEncriptada;



          usuarioModel.save((err, usuarioGuardado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!usuarioGuardado) return res.status(500).send({ mensaje: "Error al agregar el cliente" });

            return res.status(200).send({ usuario: usuarioGuardado });
          });
        });
      } else {
        return res.status(500).send({ mensaje: "Correo Existente, ingrese uno nuevo" });
      }

    })
  } else {
    return res.status(500).send({ mensaje: "Complete los campos obligatorios" });
  }
}

/* TAREAS DEL ROL_CLIENTE */

// 1. editar usuario
function editarUsuarioRolCliente(req, res) {

   // Verificar el rol de usuario
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(403).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }

  var parametros = req.body;
  var idCliente = req.params.ID;

  // Verificar si se está intentando cambiar el email
  if (parametros.email) {
    // Buscar si el email ya existe en otro usuario
    Usuarios.findOne({ email: parametros.email, _id: { $ne: idCliente } }, (err, emailExistente) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (emailExistente) {
        return res.status(400).send({ mensaje: "El email ya está en uso por otro usuario." });
      }

      // Si el email no existe, proceder a actualizar
      Usuarios.findByIdAndUpdate(idCliente, parametros, { new: true }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!usuarioEncontrado) return res.status(404).send({ mensaje: "Error al editar el cliente" });
        return res.status(200).send({ usuario: usuarioEncontrado });
      });
    });
  } else {
    // Si no se proporciona un nuevo email, proceder a actualizar directamente
    Usuarios.findByIdAndUpdate(idCliente, parametros, { new: true }, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (!usuarioEncontrado) return res.status(404).send({ mensaje: "Error al editar el cliente" });
      return res.status(200).send({ usuario: usuarioEncontrado });
    });
  }
}

// 2. eliminar usuario
function eliminarUsuarioRolCliente(req, res) {

  // siempre poner esto al principio, es para verificar quien puede realizar la acción
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  var idCliente = req.params.ID;
  Usuarios.findByIdAndDelete(idCliente, (err, eliminarRolUsuario) => {

    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!eliminarRolUsuario) return res.status(500).send({ mensaje: "Error al eliminar el usuario" });
    return res.status(200).send({ usuario: eliminarRolUsuario });

  });

}

// 3. ver a usuarios con ROL_CLIENTE, en este caso es un ejemplo que debera de aplicarse a ROL_ADMIN
function getUsuariosRolCliente(req, res) {

  // VERIFICADOR
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  // verificar que tipo de usuario quiero ver
  Usuarios.find({ rol: 'ROL_CLIENTE' }, (err, usuariosEncontrados) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!usuariosEncontrados) return res.status(500).send({ mensaje: "Error al ver los usuarios" });
    return res.status(200).send({ usuario: usuariosEncontrados });
  })
}

/* 4. ver a un perfil que tenga ROL_CLIENTE por el ID*/
function getUsuarioIdRolCliente(req, res) {
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }


  // buscar por id
  var idCliente = req.params.ID;

  Usuarios.findById(idCliente, (err, usuariosEncontrados) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!usuariosEncontrados) return res.status(500).send({ mensaje: "Error al ver los usuarios" });
    return res.status(200).send({ usuario: usuariosEncontrados })
  })
}


/* TAREAS DEL ROL_ADMIN */
/* 1. editar perfil */
function editarUsuarioRolAdmin(req, res) {
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  var parametros = req.body;
  var idAdmin = req.params.ID;
  Usuarios.findByIdAndUpdate(idAdmin, parametros, { new: true }, (err, adminEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
    if (!adminEncontrado) return res.status(500).send({ mensaje: "Error al editar el Administrador" });
    return res.status(200).send({ usuario: adminEncontrado });

  })
}


/* 2. agregar, ROL_FACTURADOR por defecto */
function agregarClienteRolAdmin(req, res) {

  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  var parametros = req.body;
  var usuarioModel = new Usuarios();
  if (parametros.nombre && parametros.apellido && parametros.email && parametros.password) {
    usuarioModel.nombre = parametros.nombre;
    usuarioModel.apellido = parametros.apellido;
    usuarioModel.email = parametros.email;
    usuarioModel.password = parametros.password;
    usuarioModel.rol = 'ROL_CLIENTE';
    usuarioModel.telefono = parametros.telefono;
    usuarioModel.direccion = parametros.direccion;
    usuarioModel.departamento = parametros.departamento;
    usuarioModel.municipio = parametros.municipio;
    usuarioModel.imagen = null;


    //Verificacion de email
    Usuarios.find({ email: parametros.email }, (err, usuarioEncontrado) => {
      if (usuarioEncontrado.length == 0) {
        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
          usuarioModel.password = passwordEncriptada;



          usuarioModel.save((err, usuarioGuardado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!usuarioGuardado) return res.status(500).send({ mensaje: "Error al agregar el cliente" });

            return res.status(200).send({ usuario: usuarioGuardado });
          });
        });
      } else {
        return res.status(500).send({ mensaje: "Correo Existente, ingrese uno nuevo" });
      }

    })
  } else {
    return res.status(500).send({ mensaje: "Complete los campos obligatorios" });
  }
}

/* 2. agregar, ROL_FACTURADOR por defecto */
function agregarFacturador(req, res) {

  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  var parametros = req.body;
  var usuarioModel = new Usuarios();
  if (parametros.nombre && parametros.apellido && parametros.email && parametros.password) {
    usuarioModel.nombre = parametros.nombre;
    usuarioModel.apellido = parametros.apellido;
    usuarioModel.email = parametros.email;
    usuarioModel.password = parametros.password;
    usuarioModel.rol = 'ROL_FACTURADOR';
    usuarioModel.telefono = parametros.telefono;
    usuarioModel.direccion = parametros.direccion;
    usuarioModel.departamento = parametros.departamento;
    usuarioModel.municipio = parametros.municipio;
    usuarioModel.imagen = null;


    //Verificacion de email
    Usuarios.find({ email: parametros.email }, (err, usuarioEncontrado) => {
      if (usuarioEncontrado.length == 0) {
        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
          usuarioModel.password = passwordEncriptada;



          usuarioModel.save((err, usuarioGuardado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!usuarioGuardado) return res.status(500).send({ mensaje: "Error al agregar el cliente" });

            return res.status(200).send({ usuario: usuarioGuardado });
          });
        });
      } else {
        return res.status(500).send({ mensaje: "Correo Existente, ingrese uno nuevo" });
      }

    })
  } else {
    return res.status(500).send({ mensaje: "Complete los campos obligatorios" });
  }
}
/* 3. agregar, ROL_EMPLEADO por defecto */
function agregarEmpleado(req, res) {

  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  var parametros = req.body;
  var usuarioModel = new Usuarios();
  if (parametros.nombre && parametros.apellido && parametros.email && parametros.password) {
    usuarioModel.nombre = parametros.nombre;
    usuarioModel.apellido = parametros.apellido;
    usuarioModel.email = parametros.email;
    usuarioModel.password = parametros.password;
    usuarioModel.rol = 'ROL_EMPLEADO';
    usuarioModel.telefono = parametros.telefono;
    usuarioModel.direccion = parametros.direccion;
    usuarioModel.departamento = parametros.departamento;
    usuarioModel.municipio = parametros.municipio;
    usuarioModel.imagen = null;

    Usuarios.find({ email: parametros.email }, (err, empleadoGuardado) => {
      if (empleadoGuardado.length == 0) {
        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
          usuarioModel.password = passwordEncriptada;



          usuarioModel.save((err, empleadoGuardado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!empleadoGuardado) return res.status(500).send({ mensaje: "Error al agregar el empleado" });

            return res.status(200).send({ usuario: empleadoGuardado });
          });
        });
      } else {
        return res.status(500).send({ mensaje: "Correo Existente, ingrese uno nuevo" });
      }

    })
  } else {
    return res.status(500).send({ mensaje: "Complete los campos obligatorios" });
  }
}
/* 4. agregar, ROL_GESTOR por defecto */
function agregarGestor(req, res) {

  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  var parametros = req.body;
  var usuarioModel = new Usuarios();
  if (parametros.nombre && parametros.apellido && parametros.email && parametros.password) {
    usuarioModel.nombre = parametros.nombre;
    usuarioModel.apellido = parametros.apellido;
    usuarioModel.email = parametros.email;
    usuarioModel.password = parametros.password;
    usuarioModel.rol = 'ROL_GESTOR';
    usuarioModel.telefono = parametros.telefono;
    usuarioModel.direccion = parametros.direccion;
    usuarioModel.departamento = parametros.departamento;
    usuarioModel.municipio = parametros.municipio;
    usuarioModel.imagen = null;

    Usuarios.find({ email: parametros.email }, (err, gestorGuardado) => {
      if (gestorGuardado.length == 0) {
        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
          usuarioModel.password = passwordEncriptada;



          usuarioModel.save((err, gestorGuardado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!gestorGuardado) return res.status(500).send({ mensaje: "Error al agregar el empleado" });

            return res.status(200).send({ usuario: gestorGuardado });
          });
        });
      } else {
        return res.status(500).send({ mensaje: "Correo Existente, ingrese uno nuevo" });
      }

    })
  } else {
    return res.status(500).send({ mensaje: "Complete los campos obligatorios" });
  }
}

/* 5. ver usuarios con ROL_FACTURADOR  funcion 3*/
function getUsuariosRolFacturador(req, res) {

  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  // verificar que tipo de usuario quiero ver
  Usuarios.find({ rol: 'ROL_FACTURADOR' }, (err, facturadorEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!facturadorEncontrado) return res.status(500).send({ mensaje: "Error al ver los facturadores" });
    return res.status(200).send({ usuario: facturadorEncontrado });
  })
}

/* 6.  ver usuarios con unicamente ROL_EMPLEADO  */
function getUsuariosRolEmpleado(req, res) {
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  // verificar que tipo de usuario quiero ver
  Usuarios.find({ rol: 'ROL_EMPLEADO' }, (err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: "Error al ver los empleados" });
    return res.status(200).send({ usuario: empleadoEncontrado });
  })
}
/* 7. ver usuarios con ROL_GESTOR */
function getUsuariosRolGestor(req, res) {

  // VERIFICADOR
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  // verificar que tipo de usuario quiero ver
  Usuarios.find({ rol: 'ROL_GESTOR' }, (err, gestorEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!gestorEncontrado) return res.status(500).send({ mensaje: "Error al ver los gestores de inventario" });
    return res.status(200).send({ usuario: gestorEncontrado });
  })
}

/* 8. ver propio usuario por ID*/
function getUsuarioIdRolAdministrador(req, res) {
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }

  // buscar por id
  var idAdministrador = req.params.ID;

  Usuarios.findById(idAdministrador, (err, administradorEncontrado) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!administradorEncontrado) return res.status(500).send({ mensaje: "Error al ver los administradores" });
    return res.status(200).send({ usuario: administradorEncontrado })
  })
}


/* TAREAS DEL ROL_FACTURADOR */
/* Editar usuario */
function editarUsuarioRolFacturador(req, res) {
  // Verificar el rol de usuario
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(403).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }

  var parametros = req.body;
  var idFacturador = req.params.ID;

  // Verificar si se está intentando cambiar el email
  if (parametros.email) {
    // Buscar si el email ya existe en otro usuario
    Usuarios.findOne({ email: parametros.email, _id: { $ne: idFacturador } }, (err, emailExistente) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (emailExistente) {
        return res.status(400).send({ mensaje: "El email ya está en uso por otro usuario." });
      }

      // Si el email no existe, proceder a actualizar
      Usuarios.findByIdAndUpdate(idFacturador, parametros, { new: true }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!usuarioEncontrado) return res.status(404).send({ mensaje: "Error al editar el cliente" });
        return res.status(200).send({ usuario: usuarioEncontrado });
      });
    });
  } else {
    // Si no se proporciona un nuevo email, proceder a actualizar directamente
    Usuarios.findByIdAndUpdate(idFacturador, parametros, { new: true }, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (!usuarioEncontrado) return res.status(404).send({ mensaje: "Error al editar el cliente" });
      return res.status(200).send({ usuario: usuarioEncontrado });
    });
  }
}

/* Eliminar usuario*/
function eliminarUsuarioRolFacturador(req, res) {

  // siempre poner esto al principio, es para verificar quien puede realizar la acción
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }

  var idFacturador = req.params.ID;
  Usuarios.findByIdAndDelete(idFacturador, (err, eliminarRolUsuario) => {

    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!eliminarRolUsuario) return res.status(500).send({ mensaje: "Error al eliminar el usuario" });
    return res.status(200).send({ usuario: eliminarRolUsuario });
  });

}

/* Ver usuarios con el ROL_FACTURADOR */
function getUsuariosRolFacturador(req, res) {

  // VERIFICADOR
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  // verificar que tipo de usuario quiero ver
  Usuarios.find({ rol: 'ROL_FACTURADOR' }, (err, usuariosEncontrados) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!usuariosEncontrados) return res.status(500).send({ mensaje: "Error al ver los usuarios" });
    return res.status(200).send({ usuario: usuariosEncontrados });
  })
}

/* Ver usuario propio del ROL_FACTURADOR*/
function getUsuarioIdRolFacturador(req, res) {
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }
  // buscar por id
  var idFacturador = req.params.ID;

  Usuarios.findById(idFacturador, (err, usuariosEncontrados) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!usuariosEncontrados) return res.status(500).send({ mensaje: "Error al ver los usuarios" });
    return res.status(200).send({ usuario: usuariosEncontrados })
  })
}

// 1. editar usuario
// 2 eliminar usuario
// 3 ver usuarios
// 4 ver propio usuario

/*TAREAS DE ROL GESTOR*/
function editarUsuarioRolGestor(req, res) {
  // Verificar el rol de usuario
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(403).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }

  var parametros = req.body;
  var idGestor = req.params.ID;

  // Verificar si se está intentando cambiar el email
  if (parametros.email) {
    // Buscar si el email ya existe en otro usuario
    Usuarios.findOne({ email: parametros.email, _id: { $ne: idGestor } }, (err, usuarioEncontrado) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (usuarioEncontrado) {
        return res.status(400).send({ mensaje: "El email ya está en uso por otro usuario." });
      }

      // Si el email no existe, proceder a actualizar
      Usuarios.findByIdAndUpdate(idGestor, parametros, { new: true }, (err, gestoresEncontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición" });
        if (!gestoresEncontrados) return res.status(404).send({ mensaje: "Error al editar el gestor" });
        return res.status(200).send({ usuario: gestoresEncontrados });
      });
    });
  } else {
    // Si no se proporciona un nuevo email, proceder a actualizar
    Usuarios.findByIdAndUpdate(idGestor, parametros, { new: true }, (err, gestoresEncontrados) => {
      if (err) return res.status(500).send({ mensaje: "Error en la petición" });
      if (!gestoresEncontrados) return res.status(404).send({ mensaje: "Error al editar el gestor" });
      return res.status(200).send({ usuario: gestoresEncontrados });
    });
  }
}
/*eliminar perfil de gestor*/
function eliminarUsuarioRolGestor(req, res) {

  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción " });
  }

  var idGestor = req.params.ID;
  Usuarios.findByIdAndDelete(idGestor, (err, eliminarRolGestor) => {

    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!editarUsuarioRolGestor) return res.status(500).send({ mensaje: "Error al eliminar el gestor" });
    return res.status(200).send({ usuario: eliminarRolGestor });

  });

}
/* Ver usuarios con el ROL_GESTOR */
function getUsuariosRoLGestor(req, res) {

  // VERIFICADOR
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });

  }

  // verificar que tipo de usuario quiero ver
  Usuarios.find({ rol: 'ROL_GESTOR' }, (err, usuariosEncontrados) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!usuariosEncontrados) return res.status(500).send({ mensaje: "Error al ver los usuarios" });
    return res.status(200).send({ usuario: usuariosEncontrados });
  })
}

/* Ver usuario propio del ROL_GESTOR*/
function getUsuarioIdRolGestor(req, res) {
  if (req.user.rol !== 'ROL_ADMIN') {
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
  }
  // buscar por id
  var idFacturador = req.params.ID;

  Usuarios.findById(idFacturador, (err, usuariosEncontrados) => {
    if (err) return res.status(500).send({ mensaje: "Error en la petición" });
    if (!usuariosEncontrados) return res.status(500).send({ mensaje: "Error al ver los usuarios" });
    return res.status(200).send({ usuario: usuariosEncontrados })
  })
}

/* Siempre mandar a llamar a las funciones aqui */
module.exports = {
  Login,
  agregarUsuario,
  /*MODULOS CLIENTE*/
  editarUsuarioRolCliente,
  eliminarUsuarioRolCliente,
  getUsuariosRolCliente,
  getUsuarioIdRolCliente,
  /*MODULOS ADMINISTRADOR*/
  editarUsuarioRolAdmin,
  agregarFacturador,
  agregarEmpleado,
  agregarGestor,
  getUsuariosRolFacturador,
  getUsuariosRolEmpleado,
  getUsuariosRolGestor,
  getUsuarioIdRolAdministrador,
  /*MODULOS FACTURADOR*/
  editarUsuarioRolFacturador,
  eliminarUsuarioRolFacturador,
  getUsuariosRolFacturador,
  getUsuarioIdRolFacturador,
  /*MODULO GESTOR*/
  editarUsuarioRolGestor,
  eliminarUsuarioRolGestor,
  getUsuariosRoLGestor,
  getUsuarioIdRolGestor,
  agregarClienteRolAdmin,
  solicitarCodigoRestablecimiento,
  restablecerPassword
}



