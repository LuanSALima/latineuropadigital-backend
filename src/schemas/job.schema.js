const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const jobSchema = new Schema({
	owner: {
		type: String,
		required: [true, 'É necessário informar a quem pertence este Trabalho'],
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
}, {
	timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;