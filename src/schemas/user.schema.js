const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require("bcryptjs"); /*Utilizado para encriptar a senha*/

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: [true, 'Es necesario informar el nombre de usuario'],
		unique: true,
		trim: true,
		minlength: 3
	},
	email: {
		type: String,
		required: [true, 'Es necesario informar al correo electrónico'],
		unique: true,
		trim: true,
		lowercase: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} no es un email valido',
			isAsync: false
		}
	},
	phone: {
		type: String,
		required: false,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, 'Es necesario informar la contraseña'],
		trim: true,
		minlength: 3,
		select: false,
		/*
		validate: {
	        validator: (value) => {
	          //Password possui pelo menos 1 numero, 1 letra minúscula, 1 letra maiúscula, 1 caracter especial e no minimo de 8 caracteres 
	          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/.test(value);
	        },
	        message: "Contraseña demasiado debil"
	    }
	    */
	},
	role: {
		type: String,
		enum: ['Admin', 'User'],
		required: [true, 'Es necesario informar el tipo de usuario']
	}
}, {
	timestamps: true,
});

userSchema.pre("save", async function (next) {
  this.password = bcrypt.hashSync(this.password);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;