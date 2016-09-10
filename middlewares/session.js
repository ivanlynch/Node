var User = require("../models/user").User;

module.exports = function(solicitud, respuesta, next){
	if(!solicitud.session.user_id){
		respuesta.redirect("/login");
	}
	else{
		User.findById(solicitud.session.user_id, function(error, user){
			if(error){
				console.log(error);
				respuesta.redirect("/login");
			}
			else{
				respuesta.locals = { user: user };
				next();
			}
		});
		

	}
}