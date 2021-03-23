let Job = require('../schemas/job.schema');

const handleErrors = require('../helpers/error-handler');

class JobController {
	async list(request, response) {
		try {
			const jobs = await Job.find();

			if (jobs.length === 0) {
		        throw new Error("Não há Trabalhos Cadastradas no Banco de Dados!");
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
			const { title, description } = request.body;

			const owner = request.user.id;

			if(!owner) {
				throw new Error("É necessário estar logado para saber a quem pertence este Trabalho");
			}

			const job = await Job.create({
				owner,
				title,
				description
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
			const { title, description } = request.body;

			const userLogged = request.user.id;

			if(!userLogged) {
				throw new Error("É necessário estar logado para alterar seu Trabalho");
			}

			const job = await Job.findById(request.params.id);

			if(!job) {
				throw new Error("Publicação não encontrada");
			}

			if(job.owner !== userLogged) {
				throw new Error("Este trabalho não pertence a você");
			}

			job.title = title;
			job.description = description;

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
			const userLogged = request.user.id;

			if(!userLogged) {
				throw new Error("É necessário estar logado para alterar seu Trabalho");
			}

			const job = await Job.findById(request.params.id);
			
			if (!job) {
		        throw new Error("Trabalho não Encontrado");
		    }

		    if(job.owner !== userLogged) {
				throw new Error("Este trabalho não pertence a você");
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
}

module.exports = new JobController();