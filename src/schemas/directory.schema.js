const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const directorySchema = new Schema({
	owner: {
		type: String,
		required: [true, 'É necessário informar quem publicou este Diretório'],
	},
	title: {
		type: String,
		required: [true, 'É necessário informar o título do Diretório'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'É necessário informar o subtítulo do Diretório'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'É necessário informar o conteudo do Diretório'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'É necessário cadastrar uma imagem do Diretório']
	},
	tags: {
		type: [String],
		required: [true, 'É necessário informar as tags do Diretório']
	},
	views: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});

directorySchema.pre("remove", async function (next) {
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

const Directory = mongoose.model('Directory', directorySchema);

module.exports = Directory;