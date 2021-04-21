let Job = require('../schemas/job.schema');
let User = require('../schemas/user.schema');
let JobType = require('../schemas/jobtype.schema');

const handleErrors = require('../helpers/error-handler');

class JobController {
	async list(request, response) {
		try {
			/*
			const jobs = await Job.find({status: 'accepted'}).populate({ path: 'jobTypes', select: 'title -_id' }).lean();

			if (jobs.length === 0) {
		        throw new Error("¡No hay trabajos aceptados en la base de datos!");
		    }

		    for(const job of jobs) {
		    	const jobTypes = [];
		    	for(const jobType of job.jobTypes) {
		    		jobTypes.push(jobType.title);
		    	}
		    	job.jobTypes = jobTypes;
		    }
		    */
		    const query = Job.find({status : 'accepted'});

		    query.sort({createdAt: 'desc'});

		    if(request.query.types) {
				const types = request.query.types;

				query.where('jobTypes').all(types);
			}

		    let results = 30;

			if(request.query.results) {
				results = parseInt(request.query.results);
				if(!Number.isInteger(results)) {
					throw new Error("El número de resultados debe ser un número");
				}
				if(results < 1) {
					throw new Error("El número de resultados debe ser un número mayor que 0");
				}
			}
			query.limit(results);

			if(request.query.page) {
				const page = parseInt(request.query.page);
				if(!Number.isInteger(page)) {
					throw new Error("La página debe ser un número");
				}
				if(page < 1) {
					throw new Error("La página debe ser un número mayor que 0");
				}
				query.skip((page-1)*results);
			}

			const jobs = await query.exec();

		    if (jobs.length === 0) {
		    	if(request.query.types) {
		    		throw new Error("No hay trabajos que tengan estos tipos seleccionados");
		    	} else if (request.query.page){
		    		throw new Error("Esta página no tiene trabajos aceptados");
		    	} else {
		    		throw new Error("¡No hay trabajos aceptados en la base de datos!");
		    	}
		    }

		    let totalJobs = 0;

		    if(request.query.types) {
		    	totalJobs = await Job.countDocuments({status: 'accepted'}).where('jobTypes').all(request.query.types);
		    } else {
		    	totalJobs = await Job.countDocuments({status: 'accepted'});
		    }

			return response.status(200).json({
				success: true,
				jobs,
				totalJobs
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async listAll(request, response) {
		try {
			/*
			const jobs = await Job.find().populate({ path: 'jobTypes', select: 'title -_id' }).lean();

			if (jobs.length === 0) {
		        throw new Error("¡No hay trabajos registrados en la base de datos!");
		    }

		    for(const job of jobs) {
		    	const jobTypes = [];
		    	for(const jobType of job.jobTypes) {
		    		jobTypes.push(jobType.title);
		    	}
		    	job.jobTypes = jobTypes;
		    }
		    */
		    const jobs = await Job.find();

		    if (jobs.length === 0) {
		        throw new Error("¡No hay trabajos registrados en la base de datos!");
		    }

			return response.status(200).json({
				success: true,
				jobs
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async listByStatus(request, response) {
		try {
			/*
			const jobs = await Job.find({status: request.params.status}).populate({ path: 'jobTypes', select: 'title -_id' }).lean();

			if (jobs.length === 0) {
		        throw new Error("¡No hay trabajos "+(request.params.status)+" en la base de datos!");
		    }

		    for(const job of jobs) {
		    	const jobTypes = [];
		    	for(const jobType of job.jobTypes) {
		    		jobTypes.push(jobType.title);
		    	}
		    	job.jobTypes = jobTypes;
		    }
		    */
		    const query = Job.find({status: request.params.status});

		    query.sort({createdAt: 'desc'});

		    let results = 30;

			if(request.query.results) {
				results = parseInt(request.query.results);
				if(!Number.isInteger(results)) {
					throw new Error("El número de resultados debe ser un número");
				}
				if(results < 1) {
					throw new Error("El número de resultados debe ser un número mayor que 0");
				}
			}
			query.limit(results);

			if(request.query.page) {
				const page = parseInt(request.query.page);
				if(!Number.isInteger(page)) {
					throw new Error("La página debe ser un número");
				}
				if(page < 1) {
					throw new Error("La página debe ser un número mayor que 0");
				}
				query.skip((page-1)*results);
			}

			const jobs = await query.exec();

		    if (jobs.length === 0) {
				if (request.query.page){
		    		throw new Error("Esta página no tiene trabajos "+(request.params.status));
		    	} else {
		    		throw new Error("¡No hay trabajos "+(request.params.status)+" en la base de datos!");
		    	}
		    }

		    const totalJobs = await Job.countDocuments({status: request.params.status});

			return response.status(200).json({
				success: true,
				jobs,
				totalJobs
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async create(request, response) {
		try {
			const { professionalName, professionalContact, title, description, jobTypes, link } = request.body;

			/*
		    if(typeof(jobTypes) === "undefined") {
				throw new Error("Es necesario poner al menos 1 tipo de obra");
			}
			if(typeof(jobTypes) === "string") {
				jobTypes = new Array(jobTypes);
			}

			let jobTypesNotFound = [];
			let idJobTypes = [];

			for (const jobType of jobTypes) {
				const jobTypeBCD = await JobType.findOne({title: jobType});
				if(jobTypeBCD) {
					//Tag Existe
					idJobTypes.push(jobTypeBCD._id);
				} else {
					//Tag Não Existe
					jobTypesNotFound.push(jobType);
				}
			}

			if(jobTypesNotFound.length) {
				throw new Error("Tipos de trabajo: "+jobTypesNotFound.ToString()+" no existe");
			}

			const job = await Job.create({
				professionalName,
				professionalContact,
				title,
				description,
				status: 'pendent',
				jobTypes: idJobTypes
			});
			*/

			if(typeof(jobTypes) === "undefined") {
				throw new Error("Es necesario poner al menos 1 tipo de obra");
			}
			if(typeof(jobTypes) === "string") {
				jobTypes = new Array(jobTypes);
			}

			const job = await Job.create({
				professionalName,
				professionalContact,
				title,
				description,
				status: 'pendent',
				jobTypes,
				link
			});
			

			return response.status(200).json({
				success: true,
				job
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async jobTypesUsed(request, response) {
		try {
			const usedTypes = await Job.distinct('jobTypes');

			return response.status(200).json({
				success: true,
				jobTypes: usedTypes
			});
			
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			/*
			const job = await Job.findById(request.params.id).populate({ path: 'jobTypes', select: 'title -_id' });

			if (!job) {
				throw new Error("Trabajo no encontrado");
			}

			const jobJSON = job.toJSON();

	    	const jobTypes = [];
	    	for(const jobType of jobJSON.jobTypes) {
	    		jobTypes.push(jobType.title);
	    	}
	    	jobJSON.jobTypes = jobTypes; //Instead of sending a array of objects, send a array of strings

	    	return response.json({
				success: true,
				job: jobJSON
			});
			*/

			const job = await Job.findById(request.params.id);

			if (!job) {
				throw new Error("Trabajo no encontrado");
			}

			return response.json({
				success: true,
				job
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { professionalName, professionalContact, title, description, status, jobTypes, link } = request.body;

			const job = await Job.findById(request.params.id);

			if(!job) {
				throw new Error("Trabajo no encontrado");
			}

			if(typeof(jobTypes) === "undefined") {
				throw new Error("Es necesario poner al menos 1 tipo de obra");
			}
			if(typeof(jobTypes) === "string") {
				jobTypes = new Array(jobTypes);
			}

			/*
			let jobTypesNotFound = [];
			let idJobTypes = [];

			for (const jobType of jobTypes) {
				const jobTypeBCD = await JobType.findOne({title: jobType});
				if(jobTypeBCD) {
					//Tag Existe
					idJobTypes.push(jobTypeBCD._id);
				} else {
					//Tag Não Existe
					jobTypesNotFound.push(jobType);
				}
			}

			if(jobTypesNotFound.length) {
				throw new Error("Tipos de trabajo: "+jobTypesNotFound.ToString()+" no existe");
			}

			const validStatus = ["pendent", "accepted"];

			if(validStatus.indexOf(status) === -1){
				throw new Error("Estado inválido");
			}

			job.professionalName = professionalName;
			job.professionalContact = professionalContact;
			job.title = title;
			job.description = description;
			job.status = status;
			job.jobTypes = idJobTypes;
			*/

			const validStatus = ["pendent", "accepted"];

			if(validStatus.indexOf(status) === -1){
				throw new Error("Estado inválido");
			}

			job.professionalName = professionalName;
			job.professionalContact = professionalContact;
			job.title = title;
			job.description = description;
			job.status = status;
			job.jobTypes = jobTypes;
			job.link = link;

			await job.save();

			return response.json({
				success: true,
				job
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {

			const job = await Job.findById(request.params.id);
			
			if (!job) {
		        throw new Error("Trabajo no encontrado");
		    }

			await job.remove();

			return response.json({
				success: true,
				message: 'Trabajo eliminado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async deleteAll(request, response) {
		try {
			await Job.deleteMany();
      
			return response.status(200).json({
				success: true,
				message: "Todas las oportunidades han sido eliminadas"
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new JobController();