var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();
var fs = require("fs");
var redis = require("redis");

var client = redis.createClient();

var image_finder_middleware = require("./middlewares/find_image");

router.get("/", function(solicitud, respuesta) {
	Imagen.find({})
		.populate("creator")
		.exec(function(error, imagenes){
			if(error) console.log(error);
			respuesta.render("app/home", {imagenes: imagenes});
		})
});

/* REST */

router.get("/imagenes/new", function(solicitud, respuesta){
	respuesta.render("app/imagenes/new");
});

router.all("/imagenes/:id*", image_finder_middleware);

router.get("/imagenes/:id/edit", function(solicitud, respuesta){
	respuesta.render("app/imagenes/edit");
});

router.route("/imagenes/:id")
	.get(function(solicitud, respuesta){
		client.publish("images", respuesta.locals.imagen.toString());
		respuesta.render("app/imagenes/show");
	})

	.put(function(solicitud, respuesta){
		respuesta.locals.imagen.title = solicitud.body.title;
		respuesta.locals.imagen.save(function(error){
			if(!error){
				respuesta.render("app/imagenes/show");
			}
			else
			{
				respuesta.render("app/imagenes/"+solicitud.params.id+"/edit");
			}
		})
	})

	.delete(function(solicitud, respuesta){
		Imagen.findOneAndRemove({_id: solicitud.params.id}, function(error){
			if(!error){
				respuesta.redirect("/app/imagenes");
			}
			else{
				console.log(error);
				respuesta.redirect("/app/imagenes"+solicitud.params.id);
			}
		})
	})



router.route("/imagenes")
	.get(function(solicitud, respuesta){
		Imagen.find({creator: respuesta.locals.user._id}, function(error, imagenes){
			if(error){respuesta.redirect("/app"); return;}
			respuesta.render("app/imagenes/index", {imagenes: imagenes})
		})
	})

	.post(function(solicitud, respuesta){
		var extension = solicitud.body.archivo.name.split(".").pop();
		var data = {

			title: solicitud.body.title,
			creator: respuesta.locals.user._id,
			extension: extension
		}

		var imagen = new Imagen(data);

		imagen.save(function(error){
			if(!error){
				client.publish("images", imagen.toString());
				fs.rename(solicitud.body.archivo.path, "public/imagenes/"+imagen._id+"."+extension)
				respuesta.redirect("/app/imagenes/"+imagen._id)
			}
			else
			{
				console.log(imagen);
				respuesta.render(error);
			}
		});


	})

module.exports = router;