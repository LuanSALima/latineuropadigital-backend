const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, 'Es necesario informar quien publicó este evento'],
	},
	title: {
		type: String,
		required: [true, 'Es necesario informar el título de este evento'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'Es necesario informar el subtítulo de este evento'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'Es necesario informar el contenido de este evento'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'Es necesario informar una imagen de este evento']
	},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: "Tag"
	}],
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
	} catch (error) {

	}
  	next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;