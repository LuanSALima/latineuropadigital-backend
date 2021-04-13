const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const featuredSchema = new Schema({
	position: {
		type: Number,
		required: [true, 'Es necesario informar la posición del destacado'],
	},
	post: {
		type: Schema.Types.ObjectId,
		required: [true, 'Es necesario informar al publicación destacado'],
		refPath: 'postType'
	},
	postType: {
		type: String,
		required: [true, 'Es necesario informar el tipo de publicación destacada'],
		enum: ['Notice', 'Directory', 'Event', 'Course']
	},
	prioritized: {
		type: String,
		enum: ['true', 'false'],
		default: 'false'
	}
});

featuredSchema.pre('remove', async function(next) {
	const deletePosition = this.position;

    const allFeatureds = await Featured.find().sort({position: 'asc'});

    for(const actualFeatured of allFeatureds) {
    	if(actualFeatured.position > deletePosition) {
    		actualFeatured.position = actualFeatured.position-1;
    		await actualFeatured.save();
    	}
    }

    next();
});

const Featured = mongoose.model('Featured', featuredSchema);

module.exports = Featured;