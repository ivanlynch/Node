var Imagen = require("../models/imagenes");

module.exports = function(imagen, solicitud, respuesta){

	if(solicitud.method === "GET" && solicitud.path.indexOf("edit") < 0){
		return true;
	}

	if(typeof imagen.creator == "undefined") return false;

	if(imagen.creator._id.toString() == respuesta.locals.user._id){
		return true;
	}

	return false;

}