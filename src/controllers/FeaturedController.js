let Featured = require('../schemas/featured.schema.js');

const handleErrors = require('../helpers/error-handler');


class FeaturedController {
	async list(request, response) {
		try {
			const featureds = await Featured.find().sort({position: 'asc'}).populate('post');

			if (featureds.length === 0) {
				throw new Error("Não a Destaques cadastrados!");
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
			const {position, post, postType} = request.body;

			const featured = await Featured.create({
				position,
				post,
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
			const {position} = request.body;

			const featured = await Featured.findByIdAndUpdate(request.params.id, {
	  			'$set': {
	  				position
	  			}
  			}, {
        		new: true, // {new: false} Para retornar a versão antiga do bcd, 
       			runValidators: true, // {runValidators: true} Para validar os campos antes do update
      		});

			if(!featured) {
				throw new Error("Destacado no encontrado");
			}

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
			const {position, post, postType} = request.body;

			const featured = await Featured.findByIdAndUpdate(request.params.id, {
	  			'$set': {
	  				position,
	  				post,
	  				postType
	  			}
  			}, {
        		new: true, // {new: false} Para retornar a versão antiga do bcd, 
       			runValidators: true, // {runValidators: true} Para validar os campos antes do update
      		});

			if(!featured) {
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