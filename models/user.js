var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/fotos");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var posibles_valores = ["M", "F"];
var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Coloca un email válido"];
var password_validation = {
			validator: function(p){
				return this.password_confirmation == p;
			},
			message: "Las contraseñas no son iguales"
		};


var user_schema = new Schema({
	name: String,
	last_name: String,
	username: {type: String, required: true, maxlength: [50, "Username muy grande"]},
	password: {
		type: String, 
		minlength: [8, "El password es muy corto"],
		validate: password_validation
	},
	age: {type: Number, min: [5, "La edad no puede ser menor a 5"], max: [100, "La edad no puede ser mayor a 100"]},
	email: {type: String, required: "El correo es obligatorio", match: email_match},
	date_of_birth: Date,
	sex: {type: String, enum:{values: posibles_valores, message: "Opcion no valida"}}
});

user_schema.virtual("password_confirmation").get(function(){
	return this.p_c;
}).set(function(password){
	this.p_c = password;
});


var User = mongoose.model("User", user_schema);

module.exports.User = User;