let Course = require('../schemas/course.schema');
let Tags = require('../schemas/tags.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class CourseController {
	async list(request, response) {
		try {
			const query = Course.find();

			//If have a query for page or results
			if(request.query.page || request.query.results) {

				//check if both exists
				if(request.query.page && request.query.results) {

					//Assign page value at a constant and parse for int
					const page = parseInt(request.query.page);
					//if page value is not a integer
					if(!Number.isInteger(page)) {
						throw new Error("Página deve ser um número");
					}
					//if page value is less than 1
					if(page < 1) {
						throw new Error("Página deve ser um número maior que 0");
					}

					//Assign results value at a constant and parse for int
					const results = parseInt(request.query.results);
					//if results value is not a integer
					if(!Number.isInteger(results)) {
						throw new Error("Quantidade de resultados deve ser um número");
					}
					//if results value is less than 1
					if(results < 1) {
						throw new Error("Quantidade de resultados deve ser um número maior que 0");
					}

					//Assign to query a limit of results and skip by page and results
					query.limit(results).skip((page-1)*results);
				} else {
					//Either page dont exist or results not exist
					if(!request.query.page) {
						throw new Error("Necessário informar qual página está");
					} else {
						throw new Error("Necessário informar a quantidade de resultados");
					}
				}
			}

			if(request.query.views) {
				switch(request.query.views) {
					case 'daily' :
						var today = new Date();
						var yesterday = new Date();
	  					yesterday.setDate(today.getDate()-1);

	  					query.where({createdAt: {"$gte": yesterday, "$lt": today}}).sort({views: 'desc'});
						break;
					case 'weekly' :
						var today = new Date();
						var lastWeek = new Date();
	  					lastWeek.setDate(today.getDate()-7);

	  					query.where({createdAt: {"$gte": lastWeek, "$lt": today}}).sort({views: 'desc'});
						break;
					case 'monthly' :
						var today = new Date();
						var lastMonth = new Date();
	  					lastMonth.setDate(1);
	  					lastMonth.setMonth(today.getMonth());
	  					lastMonth.setHours(0);
	  					lastMonth.setMinutes(0);

	  					query.where({createdAt: {"$gte": lastMonth, "$lt": today}}).sort({views: 'desc'});
						break;
					case 'allTime' :
	  					query.sort({views: 'desc'});
						break;
					default:
						throw new Error(request.query.views+" não é uma data válida");
				}
			} else {
				query.sort({createdAt: 'desc'});
			}

			const courses = await query.exec();

			if (courses.length === 0) {
				if(request.query.page) {
					throw new Error("Nestá página não possui Cursos");
				} else if(request.query.views) {
					throw new Error("Não há Cursos Cadastrados dentro do espaço de tempo: "+request.query.views);
				} else {
					throw new Error("Não há Cursos Cadastrados no Banco de Dados!");
				}
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
			const { title, subtitle, content } = request.body;
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
				subtitle,
				content,
				imagePath: '/images/courses/'+imageName,
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
				course.save({ validateBeforeSave: false });
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

			const { title, subtitle, content } = request.body;
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
			course.subtitle = subtitle;
			course.content = content;
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