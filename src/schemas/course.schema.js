const mongoose = require('mongoose');
const validator = require('validator');

const fileSystem = require('fs');

const Featured = require('./featured.schema');

const Schema = mongoose.Schema;

const courseSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, 'Es necesario informar quien publicó este curso'],
	},
	title: {
		type: String,
		required: [true, 'Es necesario informar el título de este curso'],
		trim: true,
	},
	subtitle: {
		type: String,
		required: [true, 'Es necesario informar el subtítulo de este curso'],
		trim: true
	},
	content: {
		type: String,
		required: [true, 'Es necesario informar el contenido de este curso'],
		trim: true
	},
	imagePath: {
		type: String,
		required: [true, 'Es necesario informar una imagen de este curso']
	},
	link: {
		type: String,
		required: [true, 'Es necesario informar o link']
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

courseSchema.pre("remove", async function (next) {
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

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;