const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
	owner: {
		type: String,
		required: [true, 'É necessário informar quem publicou este Evento'],
	},
	title: {
		type: String,
		required: [true, 'É necessário informar o título do Evento'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'É necessário informar a descrição do Evento'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'É necessário cadastrar uma imagem do Evento']
	},
	tags: {
		type: [String],
		required: [true, 'É necessário informar as tags do Evento']
	},
	views: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});

eventSchema.pre("remove", async function (next) {
	/*
	fileSystem.unlinkSync(__basedir+"/public"+this.imagePath);
	next();
	*/
	try {
		fileSystem.unlinkSync(__basedir+"/public"+this.imagePath);
	} catch (error) {

	}
  	next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;