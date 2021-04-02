const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, 'É necessário informar quem publicou este Evento'],
	},
	title: {
		type: String,
		required: [true, 'É necessário informar o título do Evento'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'É necessário informar o subtítulo do Evento'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'É necessário informar o conteudo do Evento'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'É necessário cadastrar uma imagem do Evento']
	},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: "Tag"
	}],
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