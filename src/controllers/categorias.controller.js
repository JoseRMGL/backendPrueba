const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');

/* agregar,  editar, eliminar  ROL_GESTOR, leer, leer por id, */

/*Agregar Categoria*/
function AgregarCategoria(req, res){

  if(req.user.rol !== 'ROL_GESTOR'){
    return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción "});
  }
  var parametros = req.body;
  var categoriasModel = new Categorias();

  if(parametros.nombreCategoria && parametros.descripcionCategoria) {
    categoriasModel.nombreCategoria = parametros.nombreCategoria;
    categoriasModel.descripcionCategoria = parametros.descripcionCategoria;
    categoriasModel.imagen = null;
    categoriasModel.idUsuario = req.user.sub;

    Categorias.find({ nombreCategoria : parametros.nombreCategoria }, (err, categoriaEncontrada) => {
      if ( categoriaEncontrada.length == 0 ) {
        categoriasModel.save((err, categoriaGuardada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!categoriaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la categoria'});
            
            return res.status(200).send({ categorias: categoriaGuardada });
        })
} else {
    return res.status(500).send({ mensaje: 'Este nombre de categoría, ya  se encuentra utilizado. Según la política de la empresa, no es posible repetir nombres de categoría.' });
}

    })
  }else{
    return res.status(500).send({ mensaje: 'Debe llenar los campos necesarios'});
}
}


function ObtenerCategorias (req, res) {

  if(req.user.rol !== 'ROL_GESTOR'){
    return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción "});
  }

    Categorias.find((err, CategoriasGuardadas) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        return res.send({ categorias: CategoriasGuardadas })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */ 
    })
}

/*Editar Categoria*/
function editarCategoria(req, res){
    
  if(req.user.rol !== 'ROL_GESTOR'){
    return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción "});
  }

    
    var parametros = req.body;
    var idGestor = req.params.ID;
    Categorias.findByIdAndUpdate(idGestor, parametros, {new:true}, (err, categoriaEncontrada)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!categoriaEncontrada)return res.status(500).send({mensaje : "Error al editar la Categoria"});
        return res.status(200).send({categorias:categoriaEncontrada}); 
    })
}

function eliminarCategoriaRolGestor(req, res){
    if(req.user.rol !== 'ROL_GESTOR'){
      return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción "});
    }
  
    var idGestor = req.params.ID;
    Categorias.findByIdAndDelete(idGestor, (err, eliminarCategoria)=>{
  
      if (err) return res.status(500).send({ mensaje: "Error en la petición"});
      if(!eliminarCategoria) return res.status(500).send({ mensaje: "Error al eliminar la categoria"});
      return  res.status(200).send({ categorias: eliminarCategoria});
  
    })
  }


/*Ver categorias*/
function getCategoriaIdRolGestor(req, res){
  if(req.user.rol!== 'ROL_GESTOR'){
    return res.status(500).send({ mensaje: "Unicamente el ROL_GESTOR puede realizar esta acción"});
  }

  // buscar por id
  var idGestor = req.params.ID;

  Categorias.findById(idGestor, (err, categoriasEncontradas)=>{
    if(err) return res.status(500).send({ mensaje: "Error en la petición"});
    if(!categoriasEncontradas) return res.status(500).send({ mensaje: "Error al ver los usuarios"});
    return res.status(200).send({ categorias: categoriasEncontradas})
  })
}


  /*TAREA DE ROL ADMIN */

/* agregar,  editar eliminar  ROL_ADMIN, leer, leer por id, */
function AgregarCategoriaRolAdmin(req, res){

  if(req.user.rol !== 'ROL_ADMIN'){
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción "});
  }

  var parametros = req.body;
  var categoriasModel = new Categorias();

  if(parametros.nombreCategoria && parametros.descripcionCategoria) {
    categoriasModel.nombreCategoria = parametros.nombreCategoria;
    categoriasModel.descripcionCategoria = parametros.descripcionCategoria;
    categoriasModel.imagen = null;
    categoriasModel.idUsuario = req.user.sub;

    Categorias.find({ nombreCategoria : parametros.nombreCategoria }, (err, categoriaEncontrada) => {
      if ( categoriaEncontrada.length == 0 ) {
        categoriasModel.save((err, categoriaGuardada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!categoriaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la categoria'});
            
            return res.status(200).send({ categorias: categoriaGuardada });
        })
} else {
    return res.status(500).send({ mensaje: 'Este nombre de categoría, ya  se encuentra utilizado. Según la política de la empresa, no es posible repetir nombres de categoría.' });
}

    })
  }else{
    return res.status(500).send({ mensaje: 'Debe llenar los campos necesarios'});
}
}
function editarCategoriaRolAdmin(req, res){
    
  if(req.user.rol !== 'ROL_ADMIN'){
    return res.status(500).send({ mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción "});
  }

    
    var parametros = req.body;
    var idCatAdmin = req.params.ID;
    Categorias.findByIdAndUpdate(idCatAdmin, parametros, {new:true}, (err, categoriaEncontrada)=>{
        if (err) return res.status(500).send({mensaje: "Error en la peticion"});
        if (!categoriaEncontrada)return res.status(500).send({mensaje : "Error al editar la Categoria"});
        return res.status(200).send({categorias:categoriaEncontrada}); 
    })
}
/* si se elimina una categoria entonces se crea una categoria por defecto y se almacena alli */
function eliminarCategoriaRolAdmin(req, res){
  const idCat = req.params.idCategoria;

  if (req.user.rol === "ROL_CLIENTE") {
      return res.status(500).send({ mensaje: 'No tiene acceso a eliminar Categorías. Únicamente el Administrador puede hacerlo' });
  }

  Categorias.findOne({ _id: idCat }, (err, categoriaExistente) => {
      if (err || !categoriaExistente) {
          return res.status(404).send({ mensaje: 'Error, la categoría no existe. Verifique el ID' });
      }

      // Verifica si hay productos que referencian la categoría
      Productos.find({ 'descripcionCategoria.idCategoria': idCat }, (err, productosEncontrados) => {
          if (err) {
              return res.status(404).send({ mensaje: 'Error al buscar productos.' });
          }

          if (productosEncontrados.length === 0) {
              // Eliminar categoría si no hay productos referenciando
              Categorias.findByIdAndDelete(idCat, (err, categoriaEliminada) => {
                  if (err || !categoriaEliminada) {
                      return res.status(400).send({ mensaje: 'Error en la petición al eliminar la categoría' });
                  }
                  return res.status(200).send({ mensaje: "CATEGORÍA ELIMINADA", categoria: categoriaEliminada });
              });
          } else {
              // La categoría se encuentra referenciada en productos
              Categorias.findOne({ nombreCategoria: "CATEGORÍA - POR DEFECTO" }, (err, categoriaEncontrada) => {
                  if (err) {
                      return res.status(400).send({ mensaje: 'Error al buscar la categoría por defecto' });
                  }

                  if (!categoriaEncontrada) {
                      // Crear categoría por defecto si no existe
                      const nuevaCategoria = new Categorias({
                          nombreCategoria: "CATEGORÍA - POR DEFECTO",
                          descripcionCategoria: "Categorías por defecto",
                          idUsuario: null
                      });

                      nuevaCategoria.save((err, categoriaGuardada) => {
                          if (err || !categoriaGuardada) {
                              return res.status(400).send({ mensaje: 'Error al guardar la categoría por defecto' });
                          }

                          // Actualizar productos a la nueva categoría por defecto
                          Productos.updateMany(
                              { 'descripcionCategoria.idCategoria': idCat },
                              { $set: { 'descripcionCategoria.$[elem].idCategoria': categoriaGuardada._id, 'descripcionCategoria.$[elem].nombreCategoria': categoriaGuardada.nombreCategoria } },
                              { arrayFilters: [{ 'elem.idCategoria': idCat }] },
                              (err) => {
                                  if (err) {
                                      return res.status(400).send({ mensaje: 'Error al actualizar productos' });
                                  }
                                  // Eliminar la categoría original
                                  Categorias.findByIdAndDelete(idCat, (err, categoriaEliminada) => {
                                      if (err || !categoriaEliminada) {
                                          return res.status(400).send({ mensaje: 'Error al eliminar la categoría' });
                                      }
                                      return res.status(200).send({ mensaje: "CATEGORÍA POR DEFECTO CREADA Y CATEGORÍA ORIGINAL ELIMINADA", categoriaGuardada });
                                  });
                              }
                          );
                      });
                  } else {
                      // Actualizar productos a la categoría existente por defecto
                      Productos.updateMany(
                          { 'descripcionCategoria.idCategoria': idCat },
                          { $set: { 'descripcionCategoria.$[elem].idCategoria': categoriaEncontrada._id, 'descripcionCategoria.$[elem].nombreCategoria': categoriaEncontrada.nombreCategoria } },
                          { arrayFilters: [{ 'elem.idCategoria': idCat }] },
                          (err) => {
                              if (err) {
                                  return res.status(400).send({ mensaje: 'Error al actualizar productos' });
                              }
                              // Eliminar la categoría original
                              Categorias.findByIdAndDelete(idCat, (err, categoriaEliminada) => {
                                  if (err || !categoriaEliminada) {
                                      return res.status(400).send({ mensaje: 'Error al eliminar la categoría' });
                                  }
                                  return res.status(200).send({ mensaje: "CATEGORÍA ELIMINADA Y PRODUCTOS ACTUALIZADOS", categoriaEliminada });
                              });
                          }
                      );
                  }
              });
          }
      });
  });
}

function getCategoriaRolAdmin(req, res){

  if(req.user.rol!== 'ROL_ADMIN'){
    return res.status(500).send({mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción"});

  }

  Categorias.find({ rol: 'ROL_ADMIN'}, (err, categoriaEncontrada)=>{
    if(err) return res.status(500).send({ mensaje: "Error en la petición"});
    if(!categoriaEncontrada) return res.status(500).send({ mensaje: "Error al ver las categorias"});
    return res.status(200).send({ categorias: categoriaEncontrada});
  })
}

function getCategoriaIDRolAdmin(req, res){
   
  if(req.user.rol!== 'ROL_ADMIN'){
    return res.status(500).send({mensaje: "Unicamente el ROL_ADMIN puede realizar esta acción"});

  }

  // buscar por id
  var idCatAdmin = req.params.ID;

  Categorias.findById(idCatAdmin, (err, categoriaEncontrada)=>{
    if(err) return res.status(500).send({ mensaje: "Error en la petición"});
    if(!categoriaEncontrada) return res.status(500).send({ mensaje: "Error al ver las categorias"});
    return res.status(200).send({ categorias: categoriaEncontrada})
  })
}

module.exports = {
AgregarCategoria,
editarCategoria,
ObtenerCategorias,
eliminarCategoriaRolGestor,
getCategoriaIdRolGestor,
AgregarCategoriaRolAdmin,
editarCategoriaRolAdmin,
eliminarCategoriaRolAdmin,
getCategoriaRolAdmin,
getCategoriaIDRolAdmin
}