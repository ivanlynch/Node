var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
var session = require("express-session");
var router_app = require("./routes_app.js");
var session_middleware = require("./middlewares/session");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime.js");

var methodOverride = require("method-override");

var app = express();
var server = http.Server(app);

var sessionMiddleware = session({
	store: new RedisStore({}),
	secret:"super ultra secret word"
});

realtime(server, sessionMiddleware);

app.use("/public",express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use(methodOverride("_method"));



app.use(sessionMiddleware);

app.use(formidable.parse({ keepExtensions: true }));

app.set("view engine", "jade");

//Verbos http ==> GET / POST

app.get("/", function(solicitud, respuesta){
	respuesta.render("index");

});

app.get("/singup", function(solicitud, respuesta){

	User.find(function(error, resultado){
		console.log(resultado);
		respuesta.render("singup");
	})
	
});

app.get("/login", function(solicitud, respuesta){
	respuesta.render("login");	
});

app.post("/users", function(solicitud, respuesta){
	var user = new User({
						 email: solicitud.body.email,
						 password: solicitud.body.password, 
						 password_confirmation: solicitud.body.password_confirmation,
						 username: solicitud.body.username
						});
	user.save().then(function(user){
		respuesta.send("Guardamos el usuario exitosamente");
	}, function(error){
		console.log(String(error));
		respuesta.send("No pudimos guardar la informacion");
	})
});

app.post("/sessions", function(solicitud, respuesta){

	User.findOne({email: solicitud.body.email, password:solicitud.body.password}, function(error, user){
		
		solicitud.session.user_id = user._id;
		respuesta.redirect("/app");

	});

});

app.use("/app", session_middleware);
app.use("/app", router_app);

server.listen(8080);