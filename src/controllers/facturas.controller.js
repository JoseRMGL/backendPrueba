

const Facturas = require('../models/facturas.model');
const Carritos = require('../models/carritos.model');
const Productos = require('../models/productos.model');
const Usuarios = require('../models/usuarios.model');

// const GenerarPDF = require('../generarPDF/generarPDF');

function GenerarFactura(req,res){
    var parametros = req.body;
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción " });
    }

    Carritos.findOne({idUsuario:req.user.sub},(err, carritoUsuario)=>{
        if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
        if(!carritoUsuario) return res.status(500).send({ mensaje:"El usuario no posee carritos, no puede acceder a crear facturas, debe crear un carrito"})
        if(carritoUsuario.compras.length==0) return res.status(500).send({mensaje:"No existen productos en el carrito del usuario "})

        
        if(!parametros.nit||parametros.nit==""){
            return res.status(500).send({ mensaje:"Debe llenar el campo nit para generar la factura"})
        }else{


            for (let i = 0; i <carritoUsuario.compras.length;i++){
                //console.log("ENtra a ford ")
                Productos.findOne({_id:carritoUsuario.compras[i].idProducto},(err,productoVerificacion)=>{
                    if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                    if(!carritoUsuario) return res.status(500).send({ mensaje:"Busqeuda de producto inexistente"})

                    if(carritoUsuario.compras[i].cantidad>productoVerificacion.stock){
                        //console.log("PROCESO ANULADO ")


                        return res.status(500).send({ factura:"PROCESO DE FACTURACIÓN ANULADO",advertencia:"Su carrito posee el producto "+
                        carritoUsuario.compras[i].nombreProducto+" con una cantidad mayor al stock actual. ",
                        mensaje:"Debe editar la cantidad de su carrito o eliminar el producto de su compra para generar una nueva factura."})
                    }else{
                        

                        if ( carritoUsuario.idUsuario == req.user.sub){
                           
                            var restarStock = (carritoUsuario.compras[i].cantidad * -1)
                            ////console.log(restarStock)
                            var cantidadVendido = carritoUsuario.compras[i].cantidad
                                    Productos.findByIdAndUpdate(carritoUsuario.compras[i].idProducto, { $inc : { stock: restarStock,vendido:cantidadVendido } }, { new: true },
                                        (err, productoModificado) => {
                                            if(!productoModificado) return res.status(500).send({ mensaje: 'Error al editar editar productos'});
                                            if(err) return res.status(500).send({ mensaje:"Error en la peticion"})


                                    })
                                    

                        }else{
                            return res.status(200).send({mensaje:"Verifique los datos de su carrito",})
                        }
                    }

                })

            }

            const modelFactura = new Facturas()
            modelFactura.nit = parametros.nit
            modelFactura.fecha =  (new Date())
            modelFactura.compras = carritoUsuario.compras
            modelFactura.total =carritoUsuario.total
            modelFactura.idUsuario = req.user.sub
            let limpiarCarrito = []
            Carritos.findOneAndUpdate({_id:carritoUsuario._id},  { compras: limpiarCarrito , total: 0 }, { new: true }, 
                (err, carritoVacio)=>{

                modelFactura.save((err,agregarFactura)=>{  
                                       
                    if(err) return res.status(500).send({ mensaje:"Erro, no se puede guardar el carrito"})
                    if(!agregarFactura) return res.status(500).send({ mensaje:"No se puede guardar el carrito"})
                 

                })
            })
            
        }

    })
}

//esta es la que funciona
function CrearFacturaCliente(req, res) {
    var parametros = req.body;
    if (req.user.rol !== 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: "Unicamente el ROL_CLIENTE puede realizar esta acción" });
    }

    Carritos.findOne({ idUsuario: req.user.sub }, (err, carritoUsuario) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!carritoUsuario) return res.status(500).send({ mensaje: "El usuario no posee carritos, no puede acceder a crear facturas, debe crear un carrito" });
        if (carritoUsuario.compras.length == 0) return res.status(500).send({ mensaje: "No existen productos en el carrito del usuario" });

        if (!parametros.nit || parametros.nit == "") {
            return res.status(500).send({ mensaje: "Debe llenar el campo nit para generar la factura" });
        } else {
            let productosValidos = true; // Variable para controlar si todos los productos son válidos
            const updates = []; // Array para almacenar las promesas de actualización de stock

            // Verificar stock de los productos
            for (let i = 0; i < carritoUsuario.compras.length; i++) {
                const productoId = carritoUsuario.compras[i].idProducto;
                const cantidad = carritoUsuario.compras[i].cantidad;

                // Verificar el stock del producto
                const verificacion = Productos.findOne({ _id: productoId }).exec();
                updates.push(verificacion); // Guardamos la promesa

                verificacion.then(productoVerificacion => {
                    if (!productoVerificacion || cantidad > productoVerificacion.stock) {
                        productosValidos = false; // Hay un problema con el stock
                        res.status(500).send({
                            factura: "PROCESO DE FACTURACIÓN ANULADO",
                            advertencia: "Su carrito posee el producto " + carritoUsuario.compras[i].nombreProducto + " con una cantidad mayor al stock actual.",
                            mensaje: "Debe editar la cantidad de su carrito o eliminar el producto de su compra para generar una nueva factura."
                        });
                    }
                });
            }

            // Cuando todas las verificaciones de stock se completen
            Promise.all(updates).then(() => {
                if (!productosValidos) return; // Si hubo un problema, no continuamos

                // Obtener datos del usuario
                Usuarios.findById(req.user.sub, (err, usuario) => {
                    if (err) return res.status(500).send({ mensaje: "Error al obtener datos del usuario" });
                    if (!usuario) return res.status(500).send({ mensaje: "Usuario no encontrado" });

                    const modelFactura = new Facturas();
                    modelFactura.nit = parametros.nit;
                    modelFactura.fecha = new Date();
                    modelFactura.datosUsuario = [{
                        idUsuario: usuario._id,
                        nombre: usuario.nombre,
                        apellido: usuario.apellido, // Asegúrate de tener el campo apellido en tu modelo de usuario
                        email: usuario.email
                    }];
                    modelFactura.compras = carritoUsuario.compras;
                    modelFactura.total = carritoUsuario.total;

                    // Actualizar el carrito
                    Carritos.findOneAndUpdate({ _id: carritoUsuario._id }, { compras: [], total: 0 }, { new: true }, (err, carritoVacio) => {
                        if (err) return res.status(500).send({ mensaje: "Error al vaciar el carrito" });

                        modelFactura.save((err, agregarFactura) => {
                            if (err) return res.status(500).send({ mensaje: "Error, no se puede guardar la factura" });
                            if (!agregarFactura) return res.status(500).send({ mensaje: "No se puede guardar la factura" });

                            return res.status(200).send({ factura: agregarFactura });
                        });
                    });
                });
            });
        }
    });
}

module.exports={
    GenerarFactura,
    CrearFacturaCliente
}





