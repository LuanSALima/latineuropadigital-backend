const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const jobtypeSchema = new Schema({
	title: {
		type: String,
		required: [true, 'É necessário informar o nome do Tipo de Oportunidade'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'É necessário informar a descrição do Tipo de Oportunidade'],
		trim: true,
	}
});

const JobType = mongoose.model('JobType', jobtypeSchema);

module.exports = JobType;