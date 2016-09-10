var Imagen = require("../models/imagenes");
var owner_check = require("./image_permission");

module.exports = function(solicitud, respuesta, next){
	Imagen.findById(solicitud.params.id)
		.populate("creator")
		.exec(function(error, imagen){
			if(imagen != null && owner_check(imagen, solicitud, respuesta)){
				respuesta.locals.imagen = imagen;
				next();
			}
			else{
				respuesta.redirect("/app");
			}
		})
}