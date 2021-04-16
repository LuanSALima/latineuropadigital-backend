const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const jobSchema = new Schema({
	professionalName: {
		type: String,
		required: [true, 'Es necesario informar el nombre del profesional'],
		trim: true,
	},
	professionalContact: {
		type: String,
		required: [true, 'Es necesario informar los contactos del profesional'],
		trim: true,
	},
	title: {
		type: String,
		required: [true, 'Es necesario informar el título de la oportunidad'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Es necesario informar la descripción de la oportunidad'],
		trim: true
	},
	status: {
		type: String,
		enum: ['accepted', 'pendent'],
		required: [true, 'Es necesario informar cuál es el estado de la oportunidad']
	},
	/*
	jobTypes: [{
		type: Schema.Types.ObjectId,
		ref: "JobType"
	}]
	*/
	jobTypes: {
		type: [String],
		required: [true, 'É necessário informar os tipos de trabalhos']
	}
}, {
	timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;