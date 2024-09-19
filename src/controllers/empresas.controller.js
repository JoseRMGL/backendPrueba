const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const Empresas = require('../models/empresas.model');
const empresasModel = require('../models/empresas.model');

function agregarEmpresaRolAdmin(req, res) {
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    
      }
      var parametros = req.body;
      var empresasModel = new Empresas();
    




      
      if(parametros.nombreEmpresa && parametros.direccion && parametros.telefono) {
        empresasModel.nombreEmpresa = parametros.nombreEmpresa;
        empresasModel.direccion = parametros.direccion;
        empresasModel.telefono = parametros.telefono;
        empresasModel.mision = parametros.mision;
        empresasModel.vision = parametros.vision;
        empresasModel.historia = parametros.historia;
        empresasModel.idUsuario = req.user.sub;
    
        Empresas.find({ nombreEmpresa : parametros.nombreEmpresa }, (err, empresaEncontrada) => {
          if ( empresaEncontrada.length == 0 ) {
            empresasModel.save((err, empresaGuardada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if(!empresaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la empresa'});
                
                return res.status(200).send({ empresas: empresaGuardada });
            })
    } else {
        return res.status(500).send({ mensaje: 'Este nombre de empresa, ya  se encuentra utilizado.' });
    }
    
        })
      }else{
        return res.status(500).send({ mensaje: 'Debe llenar los campos necesarios'});
    }


}


function editarEmpresaRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    
      }

    var parametros=req.body;
    var idAdmin = req.params.ID;    

    Empresas.findByIdAndUpdate(idAdmin, parametros, {new:true},(err, empresasEncontradas)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!empresasEncontradas)return res.status(500).send({mensaje : "Error al editar la Empresa"});
        return res.status(200).send({empresas: empresasEncontradas}); 
    })
}

function eliminarEmpresaRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    
      }

    var idAdmin = req.params.ID;
    Empresas.findByIdAndDelete(idAdmin,(err, eliminarEmpresa)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!eliminarEmpresa)return res.status(500).send({mensaje : "Error al eliminar la Empresa"});
        return res.status(200).send({empresas: eliminarEmpresa});
    })
}

function getEmpresaRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    
      }

    Empresas.find({ rol: 'ROL_ADMIN'}, (err, empresaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la petición"});
        if(!empresaEncontrada) return res.status(500).send({ mensaje: "Error al ver las empresas"});
        return res.status(200).send({ empresas: empresaEncontrada});
      })
}

function getEmpresaIdRolAdmin(req,res){
    if (req.user.rol !== 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción" });
    
    }
    var idAdmin = req.params.ID;

    Empresas.findById(idAdmin, (err,empresaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la petición"});
        if(!empresaEncontrada) return res.status(500).send({ mensaje: "Error al ver las empresas"});
        return res.status(200).send({ empresas: empresaEncontrada});
    })

}

/*ROL_GESTOR */
function agregarEmpresaRolGestor(req, res) {
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR  puede realizar esta acción" });
    
      }
    var parametros = req.body;
    var empresasModel = new Empresas();

    if (parametros.nombreEmpresa && parametros.direccion &&
        parametros.telefono && parametros.mision !="" && parametros.vision !="" && parametros.historia !="") {
        Empresas.findOne({ nombreEmpresa: parametros.nombreEmpresa }, (err, empresaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!empresaEncontrada) return res.status(500).send({ mensaje: 'Esta empresa o sucursal no existe intente nuevamente' });
            empresasModel.nombreEmpresa = parametros.nombreEmpresa;
            empresasModel.direccion = parametros.direccion;
            empresasModel.telefono = parametros.telefono;
            empresasModel.mision = parametros.mision;
            empresasModel.vision = parametros.vision;
            empresasModel.historia = parametros.historia;
           

            empresasModel.save((err, empresaGuardada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!empresaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la empresa' });
                return res.status(200).send({ empresas: empresaGuardada });
            });
        });
    } else {
        return res.status(500)
            .send({ mensaje: 'Llene correctamente todos los campos' });
    }
}

function editarEmpresaRolGestor(req,res){
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }

    var parametros=req.body;
    var idGestor = req.params.ID;    

    Empresas.findByIdAndUpdate(idGestor, parametros, {new:true},(err, empresasEncontradas)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!empresasEncontradas)return res.status(500).send({mensaje : "Error al editar la Empresa"});
        return res.status(200).send({empresas: empresasEncontradas}); 
    })
}

function eliminarEmpresaRolGestor(req,res){
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }

    var idGestor = req.params.ID;
    Empresas.findByIdAndDelete(idGestor,(err, eliminarEmpresa)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!eliminarEmpresa)return res.status(500).send({mensaje : "Error al eliminar la Empresa"});
        return res.status(200).send({empresas: eliminarEmpresa});
    })
}
function getEmpresaRolGestor(req,res){
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }

    Empresas.find({rol: 'ROL_GESTOR'}, (err, empresaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la petición"});
        if(!empresaEncontrada) return res.status(500).send({ mensaje: "Error al ver las categorias"});
        return res.status(200).send({ empresas: empresaEncontrada});
      })
}

function getEmpresaIdRolGestor(req,res){
    if (req.user.rol !== 'ROL_GESTOR') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción " });
    }
    var idGestor = req.params.ID;

    Empresas.findById(idGestor, (err,empresaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la petición"});
        if(!empresaEncontrada) return res.status(500).send({ mensaje: "Error al ver las empresas"});
        return res.status(200).send({ empresas: empresaEncontrada});
    })

}


module.exports ={
    agregarEmpresaRolAdmin,
    editarEmpresaRolAdmin,
    eliminarEmpresaRolAdmin,
    getEmpresaRolAdmin,
    getEmpresaIdRolAdmin,
    agregarEmpresaRolGestor,
    editarEmpresaRolGestor,
    eliminarEmpresaRolGestor,
    getEmpresaRolGestor,
    getEmpresaIdRolGestor

}