let Notice = require('../schemas/notice.schema');
let Tags = require('../schemas/tags.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class NoticeController {
	async list(request, response) {
		try {
			const query = Notice.find();

			query.populate({ path: 'tags', select: 'title -_id' });
			query.populate({ path: 'author', select: 'username -_id'});

			if(request.query.tag) {
				const tag = request.query.tag;

				if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }, types: 'Notice'})) {
					query.find({tags: {'$regex': tag, '$options': 'i'}});
				} else {
					//Tag não existe
					throw new Error("La etiqueta ("+tag+") no existe como etiqueta de noticias");
				}
			}

			//If have a query for page or results
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

				const results = 30;
				
				//Assign to query a limit of results and skip by page and results
				query.limit(results).skip((page-1)*results);
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
			const notices = await query.exec();

			if (notices.length === 0) {
				if(request.query.page) {
					throw new Error("Esta página no tiene noticias");
				} else if(request.query.views) {
					throw new Error("No hay noticias registradas dentro del período de tiempo: "+request.query.views);
				} else {
					throw new Error("¡No hay noticias registradas en la base de datos!");
				}
		    }

		    for(const notice of notices) {
		    	const tags = [];
		    	for(const tag of notice.tags) {
		    		tags.push(tag.title);
		    	}

		    	if(notice.tags) {
		    		notice.tags = tags; //Instead of sending a array of objects, send a array of strings
		    	} else {
		    		notice.tags = ['Etiquetas excluidas'];
		    	}

		    	if(notice.author) {
		    		notice.author = notice.author.username; //Instead of sending a object of user, send the username
		    	} else {
		    		notice.author = 'Autor eliminado';
		    	}
		    	
		    }

		    const totalNotices = await Notice.countDocuments({});

			return response.status(200).json({
				success: true,
				totalNotices,
				notices
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
				if(await Notice.exists({tags: tag._id})) {
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
			
			const userLogged = request.user.id;

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

			if(!userLogged) {
				throw new Error("Debe iniciar sesión para saber quién publicó esta Noticia");
			}

		    //__basedir is a Global Variable that we assigned at our server.js that return the root path of the project
		    const imageName = `${Date.now()}-${image.name}`;
		    const imagePath = `${__basedir}/public/images/notices/${imageName}`;

			const notice = await Notice.create({
				author: userLogged,
				title,
				subtitle,
				content,
				imagePath: '/images/notices/'+imageName,
				tags: idTags
			});

		    //move the image to the path 'imagePath'
		    image.mv(imagePath, function (err) {
		        if (err) {
		            throw new Error("Hubo un error al registrar la imagen.");
		        }
		    });

			return response.status(200).json({
				success: true,
				notice
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const notice = await Notice.findById(request.params.id)
				.populate({ path: 'tags', select: 'title -_id' })
				.populate({ path: 'author', select: 'username -_id' });

			if (!notice) {
				throw new Error("Noticias no encontradas");
			}

			//Se não estiver logado
			if(!jwt.checkToken(request)) {
				notice.views = notice.views + 1;
				notice.save({ validateBeforeSave: false });
			}

			const noticeJSON = notice.toJSON();

	    	const tags = [];
	    	for(const tag of noticeJSON.tags) {
	    		tags.push(tag.title);
	    	}

	    	if(noticeJSON.tags) {
	    		noticeJSON.tags = tags; //Instead of sending a array of objects, send a array of strings
	    	} else {
	    		noticeJSON.tags = ['Etiquetas excluidas'];
	    	}

	    	if(noticeJSON.author) {
	    		noticeJSON.author = noticeJSON.author.username; //Instead of sending a object of user, send the username
	    	} else {
	    		noticeJSON.author = 'Autor eliminado';
	    	}
	    	

			return response.json({
				success: true,
				notice: noticeJSON
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {

			const { title, subtitle, content } = request.body;
			let {tags} = request.body;

			const notice = await Notice.findById(request.params.id);

			if(!notice) {
				throw new Error("Noticias no encontradas");
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
		    	fileSystem.unlinkSync(__basedir+"/public"+notice.imagePath);

			    const imageName = `${Date.now()}-${image.name}`;
			    const imagePath = `${__basedir}/public/images/notices/${imageName}`;

				notice.imagePath = '/images/notices/'+imageName;

			    //Adicionando a imagem nova
			    image.mv(imagePath, function (err) {
			        if (err) {
			            throw new Error("Hubo un error al registrar la imagen.");
			        }
			    });
			}

			notice.title = title;
			notice.subtitle = subtitle;
			notice.content = content;
			notice.tags = idTags;

			await notice.save();

			return response.json({
				success: true,
				notice
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {
			const notice = await Notice.findById(request.params.id);
			
			if (!notice) {
		        throw new Error("¡La noticia no existe!");
		    }

		    await notice.remove();

			return response.json({
				success: true,
				message: 'Noticias eliminadas'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new NoticeController();