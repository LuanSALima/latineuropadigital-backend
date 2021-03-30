let Course = require('../schemas/course.schema');
let Tags = require('../schemas/tags.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class CourseController {
	async list(request, response) {
		try {
			const courses = await Course.find();

			if (courses.length === 0) {
		        throw new Error("Não há Cursos Cadastradas no Banco de Dados!");
		    }

			return response.status(200).json({
				success: true,
				courses
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async tagsUsed(request, response) {
		try {
			const allTags = await Tags.find({}, {_id: 1, title: 1, description: 1});

			const usedTags = new Array();
			
			for(const tag of allTags) {
				if(await Course.exists({tags: { '$regex' : tag.title, '$options' : 'i' }})) {
					usedTags.push(tag);
				}
			}

			return response.status(200).json({
				success: true,
				tags: usedTags
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

			validation.validateImage(request.files);

		    const image = request.files.image;

			if(!owner) {
				throw new Error("É necessário estar logado para saber a quem pertence este Curso");
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
		    const imagePath = `${__basedir}/public/images/courses/${imageName}`;

			const course = await Course.create({
				owner,
				title,
				imagePath: '/images/courses/'+imageName,
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
				course
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const course = await Course.findById(request.params.id);

			if (!course) {
				throw new Error("Curso não encontrada");
			}

			//Se não estiver logado
			if(!jwt.checkToken(request)) {
				course.views = course.views + 1;
				course.save();
			}

			return response.json({
				success: true,
				course
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {

			const { title, description } = request.body;
			let {tags} = request.body;

			const course = await Course.findById(request.params.id);

			if(!course) {
				throw new Error("Curso não encontrada");
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

			if (request.files) {
				validation.validateImage(request.files);

		    	const image = request.files.image;

		    	//__basedir is a Global Variable that we assigned at our server.js that return the root path of the project

		    	//Removendo a imagem antiga
		    	fileSystem.unlinkSync(__basedir+"/public"+course.imagePath);

			    const imageName = `${Date.now()}-${image.name}`;
			    const imagePath = `${__basedir}/public/images/courses/${imageName}`;

				course.imagePath = '/images/courses/'+imageName;

			    //Adicionando a imagem nova
			    image.mv(imagePath, function (err) {
			        if (err) {
			            throw new Error("Ocorreu um erro ao cadastrar a imagem");
			        }
			    });
			}

			course.title = title;
			course.description = description;
			course.tags = tags;

			await course.save();

			return response.json({
				success: true,
				course
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {
			const course = await Course.findById(request.params.id);
			
			if (!course) {
		        throw new Error("Curso Não Existe!");
		    }

		    await course.remove();

			return response.json({
				success: true,
				message: 'Curso deletado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new CourseController();