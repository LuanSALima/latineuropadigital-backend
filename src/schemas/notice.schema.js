const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const noticeSchema = new Schema({
	owner: {
		type: String,
		required: [true, 'É necessário informar quem publicou esta Notícia'],
	},
	title: {
		type: String,
		required: [true, 'É necessário informar o título da Notícia'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'É necessário informar o subtítulo da Notícia'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'É necessário informar o conteudo da Notícia'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'É necessário cadastrar uma imagem da Notícia']
	},
	tags: {
		type: [String],
		required: [true, 'É necessário informar as tags da Notícia']
	},
	views: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});

noticeSchema.pre("remove", async function (next) {
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

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;