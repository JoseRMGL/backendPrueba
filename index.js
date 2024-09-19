const mongoose = require('mongoose');
const app = require('./app');
const bcrypt = require("bcrypt-nodejs");
const Usuarios = require('./src/models/usuarios.model');

// BASE DE DATOS
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/BACKEND_PASTELERIA', {useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{

    console.log('Se encuentra conectado a la base de datos.');

    app.listen(3000,function(req, res){
        console.log('El servidor corre sin problemas');  
        
    })

    RegistrarAdministradorDefecto();
}).catch(error =>console.log(error))


function RegistrarAdministradorDefecto(req, res){

    Usuarios.findOne({ email:"ADMIN" }, (err, AdministradorEncontrado) => {
        
        if(!AdministradorEncontrado==null){
            console.log('Ya se encuentra registrado el administrador')
        }
  
        if(err) console.log('error en la peticion de la base de datos')
  
        if(!AdministradorEncontrado){
            var usuarioModel = new Usuarios();
  
            usuarioModel.nombre = 'ADMIN';
            usuarioModel.apellido = 'ADMIN'
            usuarioModel.email = 'ADMIN';
            usuarioModel.password = '123456'
            usuarioModel.rol = 'ROL_ADMIN';
            usuarioModel.telefono = 12345678;
            usuarioModel.direccion = 'Calle Doreteo Guamuch Zona 5';
            usuarioModel.departamento = 'Guatemala';
            usuarioModel.municipio = 'Guatemala';
            usuarioModel.imagen = "";

  
            Usuarios.find({ email : 'ADMIN'}, (err, usuarioEncontrado) => {
                if ( usuarioEncontrado.length == 0 ) {
  
                    bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
  
                        usuarioModel.password = passwordEncriptada;
  
                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(404).send({ mensaje: 'Error en la función al agregar'});
                        });
                    }); 
  
                } else{
                    console.log('Ya existe el usuario ADMIN');
                    
                }
            })
        }
  
    })
  
  }