let Event = require('../schemas/event.schema');
let Tags = require('../schemas/tags.schema');
let Featured = require('../schemas/featured.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class EventController {
	async list(request, response) {
		try {
			const query = Event.find();

			query.populate({ path: 'tags', select: 'title -_id' });

			if(request.query.tag) {
				const tag = request.query.tag;

				if(await Tags.exists({title: { '$regex' : tag, '$options' : 'i' }, types: 'Event'})) {
					query.find({tags: {'$regex': tag, '$options': 'i'}});
				} else {
					//Tag não existe
					throw new Error("La etiqueta ("+tag+") no existe como etiqueta de eventos");
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
			const events = await query.exec();

			if (events.length === 0) {
				if(request.query.page) {
					throw new Error("Esta página no tiene eventos");
				} else {
					throw new Error("¡No hay eventos registrados en la base de datos!");
				}
		    }

		    for(const event of events) {
		    	const tags = [];
		    	for(const tag of event.tags) {
		    		tags.push(tag.title);
		    	}

		    	if(event.tags) {
		    		event.tags = tags; //Instead of sending a array of objects, send a array of strings
		    	} else {
		    		event.tags = ['Etiquetas excluidas'];
		    	}
		    }

		    const totalEvents = await Event.countDocuments({});

			return response.status(200).json({
				success: true,
				totalEvents,
				events
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
				if(await Event.exists({tags: tag._id})) {
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
				eventName,
				eventOrganizedBy,
				eventLocation,
				eventAddress,
				eventDate,
				eventTime,
				eventTicketPrice,
				eventMoreInfo,
				eventDescription,
				contactName,
				contactPhone,
				contactEmail,
				contactRole
			} = request.body;

			let {tags} = request.body;

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

		    //__basedir is a Global Variable that we assigned at our server.js that return the root path of the project
		    const imageName = `${Date.now()}-${image.name}`;
		    const imagePath = `${__basedir}/public/images/events/${imageName}`;

			const event = await Event.create({
				eventName,
				eventOrganizedBy,
				eventLocation,
				eventAddress,
				eventDate,
				eventTime,
				eventTicketPrice,
				eventMoreInfo,
				eventDescription,
				contactName,
				contactPhone,
				contactEmail,
				contactRole,
				imagePath: '/images/events/'+imageName,
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
				event
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const event = await Event.findById(request.params.id)
				.populate({ path: 'tags', select: 'title -_id' });

			if (!event) {
				throw new Error("Evento no encontrado");
			}

			const eventJSON = event.toJSON();

	    	const tags = [];
	    	for(const tag of eventJSON.tags) {
	    		tags.push(tag.title);
	    	}

	    	if(eventJSON.tags) {
	    		eventJSON.tags = tags; //Instead of sending a array of objects, send a array of strings
	    	} else {
	    		eventJSON.tags = ['Etiquetas excluidas'];
	    	}

	    	const featured = await Featured.findOne({post: eventJSON._id});

			return response.json({
				success: true,
				featured,
				event: eventJSON
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { 
				eventName,
				eventOrganizedBy,
				eventLocation,
				eventAddress,
				eventDate,
				eventTime,
				eventTicketPrice,
				eventMoreInfo,
				eventDescription,
				contactName,
				contactPhone,
				contactEmail,
				contactRole,
				status
			} = request.body;

			let {tags} = request.body;

			const event = await Event.findById(request.params.id);

			if(!event) {
				throw new Error("Evento no encontrado");
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
		    	fileSystem.unlinkSync(__basedir+"/public"+event.imagePath);

			    const imageName = `${Date.now()}-${image.name}`;
			    const imagePath = `${__basedir}/public/images/events/${imageName}`;

				event.imagePath = '/images/events/'+imageName;

			    //Adicionando a imagem nova
			    image.mv(imagePath, function (err) {
			        if (err) {
			            throw new Error("Hubo un error al registrar la imagen.");
			        }
			    });
			}

			event.eventName = eventName;
			event.eventOrganizedBy = eventOrganizedBy;
			event.eventLocation = eventLocation;
			event.eventAddress = eventAddress;
			event.eventDate = eventDate;
			event.eventTime = eventTime;
			event.eventTicketPrice = eventTicketPrice;
			event.eventMoreInfo = eventMoreInfo;
			event.eventDescription = eventDescription;
			event.contactName = contactName;
			event.contactPhone = contactPhone;
			event.contactEmail = contactEmail;
			event.contactRole = contactRole;
			event.status = status;
			event.tags = idTags;

			await event.save();

			return response.json({
				success: true,
				event
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {
			const event = await Event.findById(request.params.id);
			
			if (!event) {
		        throw new Error("¡El evento no existe!");
		    }

		    await event.remove();

			return response.json({
				success: true,
				message: 'Evento eliminado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new EventController();