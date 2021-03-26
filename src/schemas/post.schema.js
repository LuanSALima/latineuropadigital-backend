const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const postSchema = new Schema({
	owner: {
		type: String,
		required: [true, 'É necessário informar a quem pertence esta publicação'],
	},
	title: {
		type: String,
		required: [true, 'É necessário informar o título'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'É necessário informar a descrição'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'É necessário cadastrar uma imagem']
	},
	tags: {
		type: [String],
		required: [true, 'É necessário informar as tags']
	},
	views: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});

postSchema.pre("remove", async function (next) {
	try {
		fileSystem.unlinkSync(__basedir+"/public"+this.imagePath);
	} catch (error) {
		//Erro ao excluir a imagem
		console.log(error);
	}
  	next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;