const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const directorySchema = new Schema({
	businessName: {
		type: String,
		required: [true, 'Es necesario informar el nombre de la empresa'],
		trim: true,
	},
	businessAdress: {
		type: String,
		required: [true, 'Es necesario informar la dirección comercial'],
		trim: true,
	},
	businessCity: {
		type: String,
		required: [true, 'Es necesario informar la ciudad de la empresa'],
		trim: true,
	},
	businessProvince: {
		type: String,
		required: [true, 'Es necesario informar la provincia de la empresa'],
		trim: true,
	},
	businessPostalCode: {
		type: String,
		required: [true, 'Es necesario informar el código postal de la empresa'],
		trim: true,
	},
	businessPhone: {
		type: String,
		required: [true, 'Es necesario informar al número de teléfono de la empresa'],
		trim: true,
	},
	businessWebsite: {
		type: String,
		trim: true,
	},
	businessDescription: {
		type: String,
		required: [true, 'Es necesario informar la descripción de la empresa'],
		trim: true,
	},
	contactName: {
		type: String,
		required: [true, 'Es necesario informar el nombre del contacto'],
		trim: true,
	},
	contactPhone: {
		type: String,
		required: [true, 'Es necesario informar el número de teléfono de contacto'],
		trim: true,
	},
	contactEmail: {
		type: String,
		required: [true, 'Es necesario informar el correo electrónico de contacto'],
		trim: true,
	},
	contactRole: {
		type: String,
		required: [true, 'Es necesario informar la ocupación del contacto'],
		trim: true,
	},
	status: {
		type: String,
		enum: ['accepted', 'pendent'],
		required: [true, 'Es necesario informar cuál es el estado del directorio']
	},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: "Tag"
	}]
}, {
	timestamps: true,
});

const Directory = mongoose.model('Directory', directorySchema);

module.exports = Directory;