const mongoose = require('mongoose');
const validator = require('validator');

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
	tags: [{
	    type: String,
	    required: [true, 'É necessário informar as tags da publicação'] /*Não está funcionando*/
	}]
}, {
	timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;