const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
	title: {
		type: String,
		required: [true, 'É necessário informar o nome da Tag'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'É necessário informar a descrição da Tag'],
		trim: true,
	},
	types: {
		type: [String],
		required: [true, 'É necessário informar que para que tipo de Publicação esta Tag pertence']
	}
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;