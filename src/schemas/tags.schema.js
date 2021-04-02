const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Es necesario informar el nombre de la etiqueta'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Es necesario informar la descripción de la etiqueta'],
		trim: true,
	},
	types: {
		type: [String],
		enum: ['Notice', 'Directory', 'Event', 'Course'],
		required: [true, 'Es necesario informar a qué tipo de publicación pertenece esta etiqueta']
	}
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;