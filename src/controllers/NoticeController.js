let Notice = require('../schemas/notice.schema');
let Tags = require('../schemas/tags.schema');

const handleErrors = require('../helpers/error-handler');
const validation = require('../helpers/validation');

const jwt = require('../helpers/jwt');

const fileSystem = require('fs');

class NoticeController {
	async list(request, response) {
		try {
			let notices = undefined;

			if(request.query.views) {
				switch(request.query.views) {
					case 'daily' :
						var today = new Date();
						var yesterday = new Date();
	  					yesterday.setDate(today.getDate()-1);

	  					notices = await Notice.find({
	  						"createdAt": {
	  							"$gte": yesterday,
	  							"$lt": today
	  						}
	  					}).sort({views: 'desc'});
						break;
					case 'weekly' :
						var today = new Date();
						var lastWeek = new Date();
	  					lastWeek.setDate(today.getDate()-7);

	  					notices = await Notice.find({
	  						"createdAt": {
	  							"$gte": lastWeek,
	  							"$lt": today
	  						}
	  					}).sort({views: 'desc'});
						break;
					case 'monthly' :
						var today = new Date();
						var lastMonth = new Date();
	  					lastMonth.setDate(1);
	  					lastMonth.setMonth(today.getMonth());
	  					lastMonth.setHours(0);
	  					lastMonth.setMinutes(0);

	  					notices = await Notice.find({
	  						"createdAt": {
	  							"$gte": lastMonth,
	  							"$lt": today
	  						}
	  					}).sort({views: 'desc'});
						break;
					case 'allTime' :
	  					notices = await Notice.find({}).sort({views: 'desc'});
						break;
					default:
						throw new Error(request.query.views+" não é uma data válida");
				}
			} else {
				notices = await Notice.find().sort({createdAt: 'desc'});
			}

			if(!notices) {
				throw new Error("Não foi possível Buscar pelas Notícias");
			}

			if (notices.length === 0) {
				if(request.query.views) {
					throw new Error("Não há Notícias Cadastradas dentro do espaço de tempo: "+request.query.views);
				} else {
					throw new Error("Não há Notícias Cadastradas no Banco de Dados!");
				}
		    }

			return response.status(200).json({
				success: true,
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
				if(await Notice.exists({tags: { '$regex' : tag.title, '$options' : 'i' }})) {
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
				throw new Error("É necessário estar logado para saber a quem pertence este Notice");
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
		    const imagePath = `${__basedir}/public/images/notices/${imageName}`;

			const notice = await Notice.create({
				owner,
				title,
				subtitle,
				content,
				imagePath: '/images/notices/'+imageName,
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
				notice
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const notice = await Notice.findById(request.params.id);

			if (!notice) {
				throw new Error("Notícia não encontrada");
			}

			//Se não estiver logado
			if(!jwt.checkToken(request)) {
				notice.views = notice.views + 1;
				notice.save();
			}

			return response.json({
				success: true,
				notice
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
				throw new Error("Notícia não encontrada");
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
		    	fileSystem.unlinkSync(__basedir+"/public"+notice.imagePath);

			    const imageName = `${Date.now()}-${image.name}`;
			    const imagePath = `${__basedir}/public/images/notices/${imageName}`;

				notice.imagePath = '/images/notices/'+imageName;

			    //Adicionando a imagem nova
			    image.mv(imagePath, function (err) {
			        if (err) {
			            throw new Error("Ocorreu um erro ao cadastrar a imagem");
			        }
			    });
			}

			notice.title = title;
			notice.subtitle = subtitle;
			notice.content = content;
			notice.tags = tags;

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
		        throw new Error("Notícia Não Existe!");
		    }

		    await notice.remove();

			return response.json({
				success: true,
				message: 'Notícia deletada'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new NoticeController();