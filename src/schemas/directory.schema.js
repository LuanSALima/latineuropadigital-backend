const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Schema = mongoose.Schema;

const directorySchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, 'Es necesario informar quien publicó este directorio'],
	},
	title: {
		type: String,
		required: [true, 'Es necesario informar el título de este directorio'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'Es necesario informar el subtítulo de este directorio'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'Es necesario informar el contenido de este directorio'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'Es necesario informar una imagen de este directorio']
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

directorySchema.pre("remove", async function (next) {
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

const Directory = mongoose.model('Directory', directorySchema);

module.exports = Directory;