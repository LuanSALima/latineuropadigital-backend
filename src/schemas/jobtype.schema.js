const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const jobtypeSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Es necesario informar el nombre del tipo de oportunidad'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Es necesario informar la descripción del tipo de oportunidad'],
		trim: true,
	}
});

const JobType = mongoose.model('JobType', jobtypeSchema);

module.exports = JobType;