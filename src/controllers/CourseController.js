let Course = require('../schemas/course.schema');
let Tags = require('../schemas/tags.schema');
let Featured = require('../schemas/featured.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class CourseController {
	async list(request, response) {
		try {
			const query = Course.find();

			query.populate({ path: 'tags', select: 'title -_id' });
			query.populate({ path: 'author', select: 'username -_id'});

			if(request.query.tag) {
				const tag = request.query.tag;

				if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }, types: 'Course'})) {
					query.find({tags: {'$regex': tag, '$options': 'i'}});
				} else {
					//Tag não existe
					throw new Error("La etiqueta ("+tag+") no existe como etiqueta de curso");
				}
			}

			let results = 30;

			//If have a query for results
			if(request.query.results) {
				//Assign results value and parse for int
				results = parseInt(request.query.results);
				//if results value is not a integer
				if(!Number.isInteger(results)) {
					throw new Error("El número de resultados debe ser un número");
				}
				//if results value is less than 1
				if(results < 1) {
					throw new Error("El número de resultados debe ser un número mayor que 0");
				}
			}
			//Assign to query a limit of results
			query.limit(results);

			//If have a query for page
			if(request.query.page) {
				//Assign page value at a constant and parse for int
				const page = parseInt(request.query.page);
				//if page value is not a integer
				if(!Number.isInteger(page)) {
					throw new Error("La página debe ser un número");
				}
				//if page value is less than 1
				if(page < 1) {
					throw new Error("La página debe ser un número mayor que 0");
				}
				//Assign to query skip by page and results
				query.skip((page-1)*results);
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
						throw new Error(request.query.views+" no es una fecha valida");
				}
			} else {
				query.sort({createdAt: 'desc'});
			}

			query.lean(); //Transform the Mongoose Documents into a plain javascript object. That way we can set the property the way we want
			const courses = await query.exec();

			if (courses.length === 0) {
				if(request.query.page) {
					throw new Error("Esta página no tiene cursos");
				} else if(request.query.views) {
					throw new Error("No hay cursos registrados dentro del marco de tiempo: "+request.query.views);
				} else {
					throw new Error("¡No hay cursos registrados en la base de datos!");
				}
		    }

		    for(const course of courses) {
		    	const tags = [];
		    	for(const tag of course.tags) {
		    		tags.push(tag.title);
		    	}

		    	if(course.tags) {
		    		course.tags = tags; //Instead of sending a array of objects, send a array of strings
		    	} else {
		    		course.tags = ['Etiquetas excluidas'];
		    	}

		    	if(course.author) {
		    		course.author = course.author.username; //Instead of sending a object of user, send the username
		    	} else {
		    		course.author = 'Autor eliminado';
		    	}
		    }

		    const totalCourses = await Course.countDocuments({});

			return response.status(200).json({
				success: true,
				totalCourses,
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
				if(await Course.exists({tags: tag._id})) {
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
			const { title, subtitle, content, link } = request.body;
			let {tags} = request.body;
			
			const loggedUser = request.user.id;

			if(typeof(tags) === "undefined") {
				throw new Error("Debes colocar al menos 1 etiqueta");
			}
			if(typeof(tags) === "string") {
				tags = new Array(tags);
			}

			let tagsNotFound = [];
			let idTags = [];

			for (const tag of tags) {
				const tagBCD = await Tags.findOne({title: tag});
				if(tagBCD) {
					idTags.push(tagBCD._id);
				} else {
					//Tag Não Existe
					tagsNotFound.push(tag);
				}
			}

			if(tagsNotFound.length) {
				throw new Error("Etiquetas: "+tagsNotFound.toString()+" no existen");
			}

			validation.validateImage(request.files);

		    const image = request.files.image;

			if(!loggedUser) {
				throw new Error("Debes iniciar sesión para saber a quién publico este curso");
			}

		    //__basedir is a Global Variable that we assigned at our server.js that return the root path of the project
		    const imageName = `${Date.now()}-${image.name}`;
		    const imagePath = `${__basedir}/public/images/courses/${imageName}`;

			const course = await Course.create({
				author: loggedUser,
				title,
				subtitle,
				content,
				imagePath: '/images/courses/'+imageName,
				link,
				tags: idTags
			});

		    //move the image to the path 'imagePath'
		    image.mv(imagePath, function (err) {
		        if (err) {
		            throw new Error("Hubo un error al registrar la imagen");
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
			const course = await Course.findById(request.params.id)
				.populate({ path: 'tags', select: 'title -_id' })
				.populate({ path: 'author', select: 'username -_id' });

			if (!course) {
				throw new Error("Curso no encontrado");
			}

			//Se não estiver logado
			if(!jwt.checkToken(request)) {
				course.views = course.views + 1;
				course.save({ validateBeforeSave: false });
			}

			const courseJSON = course.toJSON();

	    	const tags = [];
	    	for(const tag of courseJSON.tags) {
	    		tags.push(tag.title);
	    	}

	    	if(courseJSON.tags) {
	    		courseJSON.tags = tags; //Instead of sending a array of objects, send a array of strings
	    	} else {
	    		courseJSON.tags = ['Etiquetas excluidas'];
	    	}

	    	if(courseJSON.author) {
	    		courseJSON.author = courseJSON.author.username; //Instead of sending a object of user, send the username
	    	} else {
	    		courseJSON.author = 'Autor eliminado';
	    	}

	    	const featured = await Featured.findOne({post: courseJSON._id});

			return response.json({
				success: true,
				featured,
				course: courseJSON
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {

			const { title, subtitle, content, link } = request.body;
			let {tags} = request.body;

			const course = await Course.findById(request.params.id);

			if(!course) {
				throw new Error("Curso no encontrado");
			}

			if(typeof(tags) === "undefined") {
				throw new Error("Debes colocar al menos 1 etiqueta");
			}
			if(typeof(tags) === "string") {
				tags = new Array(tags);
			}

			let tagsNotFound = [];
			let idTags = [];

			for (const tag of tags) {
				const tagBCD = await Tags.findOne({title: tag});
				if(tagBCD) {
					idTags.push(tagBCD._id);
				} else {
					//Tag Não Existe
					tagsNotFound.push(tag);
				}
			}

			if(tagsNotFound.length) {
				throw new Error("Etiquetas: "+tagsNotFound.toString()+" no existen");
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
			            throw new Error("Hubo un error al registrar la imagen");
			        }
			    });
			}

			course.title = title;
			course.subtitle = subtitle;
			course.content = content;
			course.link = link;
			course.tags = idTags;

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
		        throw new Error("¡El curso no existe!");
		    }

		    await course.remove();

			return response.json({
				success: true,
				message: 'Curso eliminado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new CourseController();