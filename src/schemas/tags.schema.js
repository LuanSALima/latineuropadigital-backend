const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
	title: {
		type: String,
		required: [true, 'É necessário informar o nome da Tag'],
		trim: true,
	}
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;