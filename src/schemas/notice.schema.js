const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Featured = require('./featured.schema');

const Schema = mongoose.Schema;

const noticeSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, 'Es necesario informar quien publicó esta noticia'],
	},
	title: {
		type: String,
		required: [true, 'Es necesario informar el título de la noticia'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'Es necesario informar el subtítulo de la noticia'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'Es necesario informar el contenido de la noticia'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'Es necesario informar una imagen de la noticia']
	},
	link: {
		type: String,
		required: [true, 'Es necesario informar o link']
	},
	tags: [{
		type: Schema.Types.ObjectId,
		ref: "Tag"
	}],
	/*
	url: {
		type: String,
		required: [true, 'Es necessario informar a url']
	},
	*/
	views: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});

noticeSchema.pre("remove", async function (next) {
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

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;