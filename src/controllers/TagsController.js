let Tags = require('../schemas/tags.schema');

const handleErrors = require('../helpers/error-handler');

class TagsController {
	async list(request, response) {
		try {
			const tags = await Tags.find({}, {_id: 1, title: 1});

			if (tags.length === 0) {
		        throw new Error("Não há Tags Cadastradas no Banco de Dados!");
		    }

			return response.status(200).json({
				success: true,
				tags
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async create(request, response) {
		try {
			const { title } = request.body;

			const tag = await Tags.create({
				title
			});

			return response.status(200).json({
				success: true,
				tag
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const tag = await Tags.findById(request.params.id);

			if (!tag) {
				throw new Error("Tag não encontrada");
			}

			return response.json({
				success: true,
				tag
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { title } = request.body;

			const tag = await Tags.findById(request.params.id);

			if(!tag) {
				throw new Error("Tag não encontrada");
			}

			tag.title = title;

			await tag.save();

			return response.json({
				success: true,
				tag
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {

			const tag = await Tags.findById(request.params.id);
			
			if (!tag) {
		        throw new Error("Tag não Encontrada");
		    }

			await tag.remove();

			return response.json({
				success: true,
				message: 'Tag deletada'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async deleteAll(request, response) {
		try {
			await Tags.deleteMany();
      
			return response.status(200).json({
				success: true,
				message: "Todas as tags foram deletadas"
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new TagsController();