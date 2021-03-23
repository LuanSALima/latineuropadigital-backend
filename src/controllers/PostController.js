let Post = require('../schemas/post.schema');

const handleErrors = require('../helpers/error-handler');

class PostController {
	async list(request, response) {
		try {
			const posts = await Post.find();

			if (posts.length === 0) {
		        throw new Error("Não há Publicações Cadastradas no Banco de Dados!");
		    }

			return response.status(200).json({
				success: true,
				posts
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async create(request, response) {
		try {
			const { title, description } = request.body;

			const owner = request.user.id;

			if(!owner) {
				throw new Error("É necessário estar logado para saber a quem pertence este Post");
			}

			const post = await Post.create({
				owner,
				title,
				description
			});

			return response.status(200).json({
				success: true,
				post
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const post = await Post.findById(request.params.id);

			if (!post) {
				throw new Error("Publicação não encontrada");
			}

			return response.json({
				success: true,
				post
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { title, description } = request.body;

			const post = await Post.findById(request.params.id);

			if(!post) {
				throw new Error("Publicação não encontrada");
			}

			post.title = title;
			post.description = description;

			await post.save();

			return response.json({
				success: true,
				post
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {
			const post = await Post.findByIdAndDelete(request.params.id);
			
			if (!post) {
		        throw new Error("Publicação Não Existe!");
		     }

			return response.json({
				success: true,
				message: 'Publicação deletada'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new PostController();