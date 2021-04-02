const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const featuredSchema = new Schema({
	position: {
		type: Number,
		required: [true, 'Es necesario informar la posición del destacado'],
	},
	post: {
		type: Schema.Types.ObjectId,
		required: [true, 'Es necesario informar al publicación destacado'],
		refPath: 'postType'
	},
	postType: {
		type: String,
		required: [true, 'Es necesario informar el tipo de publicación destacada'],
		enum: ['Notice', 'Directory', 'Event', 'Course']
	}
});

const Featured = mongoose.model('Featured', featuredSchema);

module.exports = Featured;