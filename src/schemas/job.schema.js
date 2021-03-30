const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const jobSchema = new Schema({
	professionalName: {
		type: String,
		required: [true, 'É necessário informar o nome do profissional'],
		trim: true,
	},
	professionalContact: {
		type: String,
		required: [true, 'É necessário informar os contatos do profissional'],
		trim: true,
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
	status: {
		type: String,
		required: [true, 'É necessário saber qual o status da Oportunidade']
	}
}, {
	timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;