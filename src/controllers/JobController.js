let Job = require('../schemas/job.schema');
let User = require('../schemas/user.schema');
let JobType = require('../schemas/jobtype.schema');

const handleErrors = require('../helpers/error-handler');

class JobController {
	async list(request, response) {
		try {
			const jobs = await Job.find({status: 'accepted'}).populate({ path: 'jobTypes', select: 'title -_id' }).lean();

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos Aceitos no Banco de Dados!");
		    }

		    for(const job of jobs) {
		    	const jobTypes = [];
		    	for(const jobType of job.jobTypes) {
		    		jobTypes.push(jobType.title);
		    	}
		    	job.jobTypes = jobTypes;
		    }

			return response.status(200).json({
				success: true,
				jobs
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async listAll(request, response) {
		try {
			const jobs = await Job.find().populate({ path: 'jobTypes', select: 'title -_id' }).lean();

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos Cadastrados no Banco de Dados!");
		    }

		    for(const job of jobs) {
		    	const jobTypes = [];
		    	for(const jobType of job.jobTypes) {
		    		jobTypes.push(jobType.title);
		    	}
		    	job.jobTypes = jobTypes;
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
			const jobs = await Job.find({status: request.params.status}).populate({ path: 'jobTypes', select: 'title -_id' }).lean();

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos "+(request.params.status)+" no Banco de Dados!");
		    }

		    for(const job of jobs) {
		    	const jobTypes = [];
		    	for(const jobType of job.jobTypes) {
		    		jobTypes.push(jobType.title);
		    	}
		    	job.jobTypes = jobTypes;
		    }

			return response.status(200).json({
				success: true,
				jobs
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async create(request, response) {
		try {
			const { professionalName, professionalContact, title, description, jobTypes } = request.body;

		    if(typeof(jobTypes) === "undefined") {
				throw new Error("É necessário colocar pelo menos 1 tipo trabalho");
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
				throw new Error("Tipos de Trbalhos: "+jobTypesNotFound.toString()+" não existem");
			}

			const job = await Job.create({
				professionalName,
				professionalContact,
				title,
				description,
				status: 'pendent',
				jobTypes: idJobTypes
			});

			return response.status(200).json({
				success: true,
				job
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const job = await Job.findById(request.params.id).populate({ path: 'jobTypes', select: 'title -_id' });

			if (!job) {
				throw new Error("Trabalho não encontrado");
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
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { professionalName, professionalContact, title, description, status, jobTypes } = request.body;

			const job = await Job.findById(request.params.id);

			if(!job) {
				throw new Error("Publicação não encontrada");
			}

			if(typeof(jobTypes) === "undefined") {
				throw new Error("É necessário colocar pelo menos 1 tipo trabalho");
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
				throw new Error("Tipos de Trbalhos: "+jobTypesNotFound.toString()+" não existem");
			}

			const validStatus = ["pendent", "accepted"];

			if(validStatus.indexOf(status) === -1){
				throw new Error("Status inválido");
			}

			job.professionalName = professionalName;
			job.professionalContact = professionalContact;
			job.title = title;
			job.description = description;
			job.status = status;
			job.jobTypes = idJobTypes;

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
		        throw new Error("Trabalho não Encontrado");
		    }

			await job.remove();

			return response.json({
				success: true,
				message: 'Trabalho deletado'
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
				message: "Todas as oportunidades foram deletadas"
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new JobController();