let Directory = require('../schemas/directory.schema');
let Tags = require('../schemas/tags.schema');
let Featured = require('../schemas/featured.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class DirectoryController {
	async list(request, response) {
		try {
			const query = Directory.find({status: 'accepted'});

			query.populate({ path: 'tags', select: 'title -_id' });

			if(request.query.tag) {
				const tag = request.query.tag;

				if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }, types: 'Directory'})) {
					query.find({tags: {'$regex': tag, '$options': 'i'}});
				} else {
					//Tag não existe
					throw new Error("La etiqueta ("+tag+") no existe como una etiqueta de directorio");
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
			const directories = await query.exec();

			if (directories.length === 0) {
				if(request.query.page) {
					throw new Error("Esta página no tiene directorios aceptados");
				} else {
					throw new Error("¡No hay directorios aceptados en la base de datos!");
				}
		    }

		    for(const directory of directories) {
		    	const tags = [];
		    	for(const tag of directory.tags) {
		    		tags.push(tag.title);
		    	}

		    	if(directory.tags) {
		    		directory.tags = tags; //Instead of sending a array of objects, send a array of strings
		    	} else {
		    		directory.tags = ['Etiquetas excluidas'];
		    	}
		    }

		    const totalDirectories = await Directory.countDocuments({status: 'accepted'});

			return response.status(200).json({
				success: true,
				totalDirectories,
				directories
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async listAll(request, response) {
		try {
			const query = Directory.find();

			query.populate({ path: 'tags', select: 'title -_id' });

			if(request.query.tag) {
				const tag = request.query.tag;

				if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }, types: 'Directory'})) {
					query.find({tags: {'$regex': tag, '$options': 'i'}});
				} else {
					//Tag não existe
					throw new Error("La etiqueta ("+tag+") no existe como una etiqueta de directorio");
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

			query.lean(); //Transform the Mongoose Documents into a plain javascript object. That way we can set the property the way we want
			const directories = await query.exec();

			if (directories.length === 0) {
				if(request.query.page) {
					throw new Error("Esta página no tiene directorios");
				} else {
					throw new Error("¡No hay directorios registrados en la base de datos!");
				}
		    }

		    for(const directory of directories) {
		    	const tags = [];
		    	for(const tag of directory.tags) {
		    		tags.push(tag.title);
		    	}

		    	if(directory.tags) {
		    		directory.tags = tags; //Instead of sending a array of objects, send a array of strings
		    	} else {
		    		directory.tags = ['Etiquetas excluidas'];
		    	}
		    }

		    const totalDirectories = await Directory.countDocuments({});

			return response.status(200).json({
				success: true,
				totalDirectories,
				directories
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async listByStatus(request, response) {
		try {
			const query = Directory.find({status: request.params.status});

			query.populate({ path: 'tags', select: 'title -_id' });

			if(request.query.tag) {
				const tag = request.query.tag;

				if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }, types: 'Directory'})) {
					query.find({tags: {'$regex': tag, '$options': 'i'}});
				} else {
					//Tag não existe
					throw new Error("La etiqueta ("+tag+") no existe como una etiqueta de directorio");
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

			query.lean(); //Transform the Mongoose Documents into a plain javascript object. That way we can set the property the way we want
			const directories = await query.exec();

			if (directories.length === 0) {
				if(request.query.page) {
					throw new Error("Esta página no tiene directorios "+(request.params.status));
				} else {
					throw new Error("¡No hay directorios "+(request.params.status)+" en la base de datos!");
				}
		    }

		    for(const directory of directories) {
		    	const tags = [];
		    	for(const tag of directory.tags) {
		    		tags.push(tag.title);
		    	}

		    	if(directory.tags) {
		    		directory.tags = tags; //Instead of sending a array of objects, send a array of strings
		    	} else {
		    		directory.tags = ['Etiquetas excluidas'];
		    	}
		    }

		    const totalDirectories = await Directory.countDocuments({status: request.params.status});

			return response.status(200).json({
				success: true,
				totalDirectories,
				directories
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
				if(await Directory.exists({tags: tag._id})) {
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
			const { 
				businessName,
				businessAddress,
				businessCity,
				businessProvince,
				businessPostalCode,
				businessPhone,
				businessWebsite,
				businessDescription,
				contactName,
				contactPhone,
				businessSecondPhone,
				contactEmail,
				contactRole
			} = request.body;

			let {tags} = request.body;

			if(typeof(tags) === "undefined") {
				throw new Error("Se requieren al menos 1 etiquetas");
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

		    //__basedir is a Global Variable that we assigned at our server.js that return the root path of the project
		    const imageName = `${Date.now()}-${image.name}`;
		    const imagePath = `${__basedir}/public/images/directories/${imageName}`;

			const directory = await Directory.create({
				businessName,
				businessAddress,
				businessCity,
				businessProvince,
				businessPostalCode,
				businessPhone,
				businessWebsite,
				businessDescription,
				contactName,
				contactPhone,
				businessSecondPhone,
				contactEmail,
				contactRole,
				imagePath : '/images/directories/'+imageName,
				status: 'pendent',
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
				directory
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const directory = await Directory.findById(request.params.id)
				.populate({ path: 'tags', select: 'title -_id' });

			if (!directory) {
				throw new Error("Directorio no encontrado");
			}

			if(directory.status === 'pendent') {
				if(!jwt.checkToken(request)) {
					throw new Error("Directorio no encontrado");
				}
			}

			//Se não estiver logado
			if(!jwt.checkToken(request)) {
				directory.views = directory.views + 1;
				directory.save({ validateBeforeSave: false });
			}

			const directoryJSON = directory.toJSON();

	    	const tags = [];
	    	for(const tag of directoryJSON.tags) {
	    		tags.push(tag.title);
	    	}

	    	if(directoryJSON.tags) {
	    		directoryJSON.tags = tags; //Instead of sending a array of objects, send a array of strings
	    	} else {
	    		directoryJSON.tags = ['Etiquetas excluidas'];
	    	}

	    	const featured = await Featured.findOne({post: directoryJSON._id});

			return response.json({
				success: true,
				featured,
				directory: directoryJSON
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { 
				businessName,
				businessAddress,
				businessCity,
				businessProvince,
				businessPostalCode,
				businessPhone,
				businessWebsite,
				businessDescription,
				contactName,
				contactPhone,
				businessSecondPhone,
				contactEmail,
				contactRole,
				status
			} = request.body;

			let {tags} = request.body;

			const directory = await Directory.findById(request.params.id);

			if(!directory) {
				throw new Error("Directorio no encontrado");
			}

			if(typeof(tags) === "undefined") {
				throw new Error("Se requieren al menos 1 etiquetas");
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
		    	fileSystem.unlinkSync(__basedir+"/public"+directory.imagePath);

			    const imageName = `${Date.now()}-${image.name}`;
			    const imagePath = `${__basedir}/public/images/directories/${imageName}`;

				directory.imagePath = '/images/directories/'+imageName;

			    //Adicionando a imagem nova
			    image.mv(imagePath, function (err) {
			        if (err) {
			            throw new Error("Hubo un error al registrar la imagen.");
			        }
			    });
			}

			directory.businessName = businessName;
			directory.businessAddress = businessAddress;
			directory.businessCity = businessCity;
			directory.businessProvince = businessProvince;
			directory.businessPostalCode = businessPostalCode;
			directory.businessPhone = businessPhone;
			directory.businessWebsite = businessWebsite;
			directory.businessDescription = businessDescription;
			directory.contactName = contactName;
			directory.contactPhone = contactPhone;
			directory.businessSecondPhone = businessSecondPhone;
			directory.contactEmail = contactEmail;
			directory.contactRole = contactRole;
			directory.status = status;
			directory.tags = idTags;

			await directory.save();

			return response.json({
				success: true,
				directory
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {
			const directory = await Directory.findById(request.params.id);
			
			if (!directory) {
		        throw new Error("¡El directorio no existe!");
		    }

		    await directory.remove();

			return response.json({
				success: true,
				message: 'Directorio eliminado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new DirectoryController();