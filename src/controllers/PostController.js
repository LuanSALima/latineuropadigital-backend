let Post = require('../schemas/post.schema');
let Tags = require('../schemas/tags.schema');

const handleErrors = require('../helpers/error-handler');

const jwt = require('../helpers/jwt');
const Roles = require('../helpers/roles');

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

	async findByTag(request, response) {
		try {
			const tag = request.params.tag;

			if(!tag) {
				throw new Error("Tag buscada não especificada");
			}

			if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }})) {
				//Tag Existe
			} else {
				//Tag não existe
				throw new Error("Esta tag não existe");
			}

			//Tags são cadastradas com acentos e na busca deve ser escrito com acento também
			const posts = await Post.find({tags: { '$regex' : tag, '$options' : 'i' }});

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
			let {tags} = request.body;
			
			const owner = request.user.id;

			if(!owner) {
				throw new Error("É necessário estar logado para saber a quem pertence este Post");
			}

			//Check if has at least 1 item on files
			if (!request.files) {
		       throw new Error("É necessário cadastrar uma imagem");
		    }

		    if(!request.files.image) {
		    	throw new Error("Não foi encontrada a imagem no name 'image'");
		    }

		    const image = request.files.image;
		    	
	    	const validMimetypes = ["image/jpeg", "image/png"];

	    	if(validMimetypes.indexOf(image.mimetype) === -1){
		        throw new Error("O arquivo tem que ser uma imagem .jpg/.jpeg/.png");
		    }

		    if(typeof(tags) === "undefined") {
				throw new Error("É necessário colocar pelo menos 1 tag");
			}
			if(typeof(tags) === "string") {
				tags = new Array(tags);
			}

			let tagsNotFound = [];

			for (const tag of tags) {
				if(await Tags.exists({title: tag})) {
					//Tag Existe
				} else {
					//Tag Não Existe
					tagsNotFound.push(tag);
				}
			}

			if(tagsNotFound.length) {
				throw new Error("Tags: "+tagsNotFound.toString()+" não existem");
			}

		    //__basedir is a Global Variable that we assigned at our server.js that return the root path of the project
		    const imageName = `${Date.now()}-${image.name}`;
		    const imagePath = `${__basedir}/public/posts/${imageName}`;

			const post = await Post.create({
				owner,
				title,
				imagePath: '/posts/'+imageName,
				description,
				tags
			});

		    //move the image to the path 'imagePath'
		    image.mv(imagePath, function (err) {
		        if (err) {
		            throw new Error("Ocorreu um erro ao cadastrar a imagem");
		        }
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

			//Se não estiver logado
			if(!jwt.checkToken(request)) {
				post.views = post.views + 1;
				post.save();
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
			const post = await Post.findById(request.params.id);
			
			if (!post) {
		        throw new Error("Publicação Não Existe!");
		    }

		    await post.remove();

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