const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require("bcryptjs"); /*Utilizado para encriptar a senha*/

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: [true, 'É necessário informar o nome do usuário'],
		unique: true,
		trim: true,
		minlength: 3
	},
	email: {
		type: String,
		required: [true, 'É necessário informar o email'],
		unique: true,
		trim: true,
		lowercase: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} não é um email válido',
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
		required: [true, 'É necessário informar a senha'],
		trim: true,
		minlength: 3,
		select: false,
		/*
		validate: {
	        validator: (value) => {
	          //Password possui pelo menos 1 numero, 1 letra minúscula, 1 letra maiúscula, 1 caracter especial e no minimo de 8 caracteres 
	          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/.test(value);
	        },
	        message: "Senha muito fraca"
	    }
	    */
	},
	role: {
		type: String,
		required: [true, "É necessário informar o tipo de Usuário"]
	},
	isProfessional: {
		type: String,
		default: "false"
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