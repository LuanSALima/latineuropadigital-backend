let Featured = require('../schemas/featured.schema.js');

let Event = require('../schemas/event.schema');
let Directory = require('../schemas/directory.schema');
let Course = require('../schemas/course.schema');
let Notice = require('../schemas/notice.schema');

const handleErrors = require('../helpers/error-handler');

async function sortPositions(oldPosition, newPosition, featuredUpdated) {
	const allFeatureds = await Featured.find().sort({position: 'asc'});

    for(const actualFeatured of allFeatureds) {
    	const actualFeaturedPosition = actualFeatured.position;

    	if(actualFeaturedPosition.toString() === newPosition.toString() && actualFeatured._id.toString() !== featuredUpdated._id.toString()) {
    		if(actualFeaturedPosition > oldPosition) {
    			actualFeatured.position = actualFeaturedPosition-1;
    		} else {
    			actualFeatured.position = actualFeaturedPosition+1;
    		}
    	} else {
    		if(actualFeaturedPosition === oldPosition && actualFeatured._id.toString() === featuredUpdated._id.toString()) {
    			actualFeatured.position = newPosition;
    		} else {
    			if(actualFeaturedPosition < oldPosition && actualFeaturedPosition > newPosition) {
		    		actualFeatured.position = actualFeaturedPosition+1;
		    	}
		    	if(actualFeaturedPosition > oldPosition && actualFeaturedPosition < newPosition) {
		    		actualFeatured.position = actualFeaturedPosition-1;
		    	}
    		}
    	}
    	actualFeatured.save();
    }
}

class FeaturedController {
	async list(request, response) {
		try {
			let query = Featured.find();;

			if(request.query.type) {
				query = Featured.find({
					$or: [
						{postType: {'$regex' : request.query.type, '$options' : 'i' }},
						{prioritized: 'true'}
					]	
				});
			}

			query.sort({position: 'asc'}).populate('post').lean();

			let results = 10;
			if(request.query.results) {
				results = parseInt(request.query.results);
				if(!Number.isInteger(results)) {
					throw new Error("El número de resultados debe ser un número");
				}
				if(results < 1) {
					throw new Error("El número de resultados debe ser un número mayor que 0");
				}
			}
			query.limit(results);

			const featureds = await query.exec();

			for(const featured of featureds) {
				if(featured.post) {
					if(featured.post.status) {
						if(featured.post.status !== 'accepted'){
							featured.post=null;
						}
					}
				}
			}

			if (featureds.length === 0) {
				throw new Error("No a destacados registrados");
			}

			return response.status(200).json({
				success: true,
				featureds
			});
		} catch(error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async listAll(request, response) {
		try {
			const featureds = await Featured.find().sort({position: 'asc'}).populate('post').lean();

			for(const featured of featureds) {
				if(featured.post) {
					if(featured.post.status) {
						if(featured.post.status !== 'accepted'){
							featured.isPendent = true;
						}
					}
				}
			}

			if (featureds.length === 0) {
				throw new Error("No a destacados registrados");
			}

			return response.status(200).json({
				success: true,
				featureds
			});
		} catch(error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async create(request, response) {
		try {
			const {postType} = request.body;
			let {post} = request.body;

			switch(postType) {
				case 'Notice':
					post = await Notice.findById(post);
					break;
				case 'Directory':
					post = await Directory.findById(post);
					break;
				case 'Event':
					post = await Event.findById(post);
					break;
				case 'Course':
					post = await Course.findById(post);
					break;
				default:
					throw new Error('Tipo de publicación no válida');
			}

			if(post.status && post.status !== 'accepted') {
				throw new Error("Lo destacado no puede ser un "+postType+" con estado pendiente");
			}

			const numFeatureds = await Featured.countDocuments({});

			const featured = await Featured.create({
				position: numFeatureds+1,
				post: post._id,
				postType
			});

			return response.status(200).json({
				success: true,
				featured
			});
		} catch(error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const featured = await Featured.findById(request.params.id).populate('post');

			if (!featured) {
				throw new Error("Destacado no encontrado");
			}

			return response.json({
				success: true,
				featured
			});
		} catch(error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async changePosition(request, response) {
		try {
			const featured = await Featured.findById(request.params.id);

			if(!featured) {
				throw new Error("Destacado no encontrado");
			}

			const newPosition = parseInt(request.body.position);
			const oldPosition = featured.position;

			if(!Number.isInteger(newPosition)) {
				throw new Error("La posición debe ser un número");
			}

			if(newPosition < 1) {
				throw new Error("La página debe ser un número mayor que 0");
			}

			const featuredAtPosition = await Featured.findOne({position: newPosition});

			if(!featuredAtPosition) {
				throw new Error("No hay destacado en esta posición");
			}

			featuredAtPosition.position = oldPosition;
			featured.position = newPosition;

			await featuredAtPosition.save();
			await featured.save();

			return response.json({
				success: true,
				message: 'Posición destacada actualizada'
			});
		} catch(error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const {position, post, postType, prioritized} = request.body;

			const featured = await Featured.findByIdAndUpdate(request.params.id, {
	  			'$set': {
	  				position,
	  				post,
	  				postType,
	  				prioritized
	  			}
  			}, {
        		new: false, // {new: false} Para retornar a versão antiga do bcd, 
       			runValidators: true, // {runValidators: true} Para validar os campos antes do update
      		});

      		if(featured.position !== position) {
      			await sortPositions(featured.position, position, featured);
      		}

			if(!featured) {
				throw new Error("Destacado no encontrado");
			}

			return response.json({
				success: true,
				message: 'Destacado cambiado con éxito'
			});
		} catch(error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {
			const featured = await Featured.findById(request.params.id);
			
			if (!featured) {
		        throw new Error("¡El destacado no existe!");
		    }

		    await featured.remove();

			return response.json({
				success: true,
				message: 'Destacado eliminado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new FeaturedController();