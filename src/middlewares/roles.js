// VERIFICACIONES DE BUSQUEDAS
exports.varCliente = function(req, res, next){

    if(req.user.rol != 'ROL_CLIENTE') return res.status(400).send({ mensaje: "El cliente cuenta con los permisos" });

    next();
}

exports.varAdmin = function(req, res, next){
    
    if(req.user.rol != 'ROL_ADMIN') return res.status(400).send({ mensaje: "El administrador cuenta con los permisos" });

    next();
}
