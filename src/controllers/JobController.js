let Job = require('../schemas/job.schema');
let User = require('../schemas/user.schema');
let JobType = require('../schemas/jobtype.schema');

const handleErrors = require('../helpers/error-handler');

class JobController {
	async list(request, response) {
		try {
			const jobs = await Job.find({status: 'accepted'});

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos Aceitos no Banco de Dados!");
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
			const jobs = await Job.find();

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos Cadastrados no Banco de Dados!");
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
			const jobs = await Job.find({status: request.params.status});

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos "+(request.params.status)+" no Banco de Dados!");
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

			for (const jobType of jobTypes) {
				if(await JobType.exists({title: jobType})) {
					//Tag Existe
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
				jobTypes
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
			const job = await Job.findById(request.params.id);

			if (!job) {
				throw new Error("Trabalho não encontrado");
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
			const { professionalName, professionalContact, title, description, status } = request.body;

			const job = await Job.findById(request.params.id);

			if(!job) {
				throw new Error("Publicação não encontrada");
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