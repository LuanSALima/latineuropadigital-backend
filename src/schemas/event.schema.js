const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Featured = require('./featured.schema');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
	eventName: {
		type: String,
		required: [true, 'Es necesario informar el nombre del evento'],
		trim: true,
	},
	eventOrganizedBy: {
		type: String,
		required: [true, 'Es necesario informar quién es el organizador del evento'],
		trim: true,
	},
	eventLocation: {
		type: String,
		required: [true, 'Es necesario informar la ubicación del evento'],
		trim: true,
	},
	eventAddress: {
		type: String,
		required: [true, 'Es necesario informar la dirección del evento'],
		trim: true,
	},
	eventDate: {
		type: String,
		required: [true, 'Es necesario informar la dirección del evento'],
		trim: true,
	},
	eventTime: {
		type: String,
		required: [true, 'Es necesario informar la hora del evento'],
		trim: true,
	},
	eventTicketPrice: {
		type: String,
		required: [true, 'Es necesario informar el precio del evento'],
		trim: true,
	},
	eventMoreInfo: {
		type: String,
		required: [true, 'Es necesario informar más información sobre el evento'],
		trim: true,
	},
	eventDescription: {
		type: String,
		required: [true, 'Es necesario informar la descripción del evento'],
		trim: true,
		maxlength: [215, "Descripción muy larga del evento"],
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
	imagePath: {
		type: String,
		required: [true, 'Es necesario informar una imagen de este evento']
	},
	status: {
		type: String,
		enum: ['accepted', 'pendent'],
		required: [true, 'Es necesario informar cuál es el estado del evento']
	},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: "Tag"
	}],
	link: {
		type: String
	},
	views: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});

eventSchema.pre("remove", async function (next) {
	/*
	fileSystem.unlinkSync(__basedir+"/public"+this.imagePath);
	next();
	*/
	try {
		fileSystem.unlinkSync(__basedir+"/public"+this.imagePath);
	} catch (error) {}

	const thisFeatured = await Featured.findOne({post: this._id});

	if(thisFeatured) {
		await thisFeatured.remove();
	}

  	next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;