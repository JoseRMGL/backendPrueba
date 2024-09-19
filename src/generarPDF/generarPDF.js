

const fs = require("fs");
const PDFDocument = require("pdfkit");
const Usuarios = require("../models/usuarios.model");
const Facturas = require("../models/facturas.model");
// const imagen = "./src/generarPDF/images/LCS KINAL.png"


function facturasPDF(idUsuario,idFac,req, res){

  Usuarios.findOne({_id:idUsuario},(err,nombreIdEncontrado)=>{
    Usuarios.find({_id:idUsuario },(err, facturaEncontradaUsuario)=>{
      if(err) return res.status(500).send({ error: `Error en la peticion ${err}`})
      if(facturaEncontradaUsuario !== null){

          Facturas.findOne({idUsuario: idUsuario},(err, datosFacturaEncontrados)=>{
            if(err) return res.status(500).send({ error: `Error en la peticion ${err}`})
            if(datosFacturaEncontrados === null) return res.status(404).send({error: `Error la factura no existe`})
            console.log(datosFacturaEncontrados)
            var nombreDoc=nombreIdEncontrado.nombre+" "+nombreIdEncontrado.apellido+" - "+idFac;
            // DIRECCIONAMIENTO
            var path = "./src/docPDF/"+nombreDoc+".pdf";
            estructuraDocumento(facturaEncontradaUsuario,datosFacturaEncontrados, path);
            console.log("El PDf del usuario "+ nombreDoc +" se ha creado exitosamente")
          })
      }
    })
  })

}


function estructuraDocumento(usuario,facturas, path) {
  let doc = new PDFDocument({ size: "A4", margin: 15 });
  cabeceraDocumento(doc,usuario);
  informacionUsuario(doc, usuario);
  encabezadoTabla(doc, facturas);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}


function cabeceraDocumento(doc,usuario) {
  usuario.forEach(element=>{
    doc
    .image("./src/generarPDF/images/FondoDocumentoPDF.png",2,2, { width: 591,height: 837, align: "center"})
     // .image(imagen, 70, 45, { width: 60 })
    .fillColor("#212F3C")
    .fontSize(9)
    .font('Helvetica-BoldOblique')
    .text(fechaDocumento(new Date()), 220, 40, { align: "right" })
    .text(" Venta Online", 220, 90, { align: "right" })
    .text("Pasteleria", 220, 110, { align: "right" })
    .text("Guatemala", 220, 130, { align: "right" })
    .moveDown();
  })
}

function informacionUsuario(doc, usuario) {
  doc
    .fillColor("#B03A2E")
    .fontSize(34)
    .font('Courier-BoldOblique')
    .text("Factura", 22, 50,{ align: "center" })
    .text("Usuario", 22, 95,{ align: "center" });

  separadorUsuario(doc, 170);

  usuario.forEach(element=>{
    doc
    .fillColor("#273746")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("ID:", 70, 180)
      .font("Helvetica")
      .text(element._id, 190, 180)
      .font("Helvetica-Bold")
      .text("Nombre:", 70, 200)
      .font("Helvetica")
      .text(element.nombre+" "+element.apellido, 190, 200)
      .font("Helvetica-Bold")
      .text("Email:", 70, 240)
      .font("Helvetica")
      .text(element.email,190,240)
      .font("Helvetica-Bold")
      .text("Rol:", 70, 220)
      .font("Helvetica")
      .text(element.rol, 190, 220)
      .image("./src/generarPDF/images/logo_empresa2.png", 475, 180, { width: 70, align: "right"})
      .moveDown();
  })

  separadorUsuario(doc, 258);
}

function encabezadoTabla ( doc, facturas) {
    const invoiceTableTop = 300;

    doc
      doc
      .font("Helvetica-BoldOblique")
      .fontSize(11)
      .fillColor("#154360")
      .text("ID Factura:   "+facturas._id+"             ",30,305)
      .text("NIT:   "+facturas.nit+"             ",30,329)
      .fontSize(12)
      .fillColor("#A93226")
      .text("TOTAL A PAGAR:  Q "+facturas.total+"             ",320,300)
      .fillColor("#515A5A")
      .fontSize(8)
      .text("Fecha:   "+fechaDocumento(facturas.fecha)+"             ",285,325),

      invoiceTableTop,

      
      separadorSubtitulos(doc, invoiceTableTop + 20);
    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("black");

        console.log("Entra a el y a ford  "+facturas.compras.length)

        console.log("Cantidad "+facturas.compras.length)

        for (var i = 0; i < facturas.compras.length; i++) {
          const position = invoiceTableTop +(i*150)
          //const position = invoiceTableTop + (i + 1) * 50;
          console.log("Cantidad dentro ford"+facturas.compras.length+" i"+i)

          filaRegistro(

            doc,
            position ,
            facturas.compras[i].idProducto,
            facturas.compras[i].nombreProducto,
            facturas.compras[i].cantidad,
            facturas.compras[i].precio,
            facturas.compras[i].subTotal,

          )
        
        }  
}

function generateFooter(doc) {
  doc
    // .image("./src/generarPDF/images/LLS KINAL.png", 35, 770, { width: 70, align: "left"})
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
      "PASTELERIA CLICK",
      50,
      785,
      { align: "center", width: 500 }
    )
    .font("Helvetica-Oblique")
    .fillColor("#1C2833")
    .text("Ciudad de Guatemala", 50, 800, { align: "center" })
    // .image("./src/generarPDF/images/LLS KINAL.png", 490, 770, { width: 70, align: "right"})

}

function filaRegistro(
  doc,
  y,
  idProducto,
  nombreProducto,
  cantidad,
  precio,
  subTotal,
) {
  doc
  .fillColor("#1F618D")
  .fontSize(13)
  .fillColor("#273746")
  .font("Helvetica-Bold")
  .fontSize(11)
  .text(" PRODUCTO:", 60, y+50)
  //DATOS PRODUCTOS
  .fillColor("#17202A")
  .fontSize(11)
  .font("Helvetica-Bold")
  .text("ID producto:", 100, y+70)
  .font("Helvetica")
  .text(idProducto, 220, y+70)

  .font("Helvetica-Bold")
  .text("Nombre producto:", 120, y+90)
  .font("Helvetica")
  .text(nombreProducto,240,y+90)

  .font("Helvetica-Bold")
  .text("Cantidad:", 120, y+110)
  .font("Helvetica")
  .text(cantidad, 240, y+110)

  .font("Helvetica-Bold")
  .text("Precio:", 120, y+130)
  .font("Helvetica")
  .text(precio, 240, y+130)

  .font("Helvetica-Bold")
  .text("SubTotal:", 120, y+150)
  .font("Helvetica")
  .text("Q "+subTotal, 240, y+150)
  .text(" - - - - - - - - - - - - - - - - - - - - - - - - ",95,y+160)

}

function separadorUsuario(doc, y) {
  doc
    .strokeColor("#154360")
    .lineWidth(1)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}

function separadorSubtitulos(doc, y) {
  doc
    .strokeColor("#17202A")
    .lineWidth(2)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}

function fechaDocumento(date) {
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return day + "/" + month + "/" + year;

}


module.exports = {
  facturasPDF
};