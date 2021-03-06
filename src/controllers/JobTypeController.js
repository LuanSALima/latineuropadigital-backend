let JobType = require('../schemas/jobtype.schema');

const handleErrors = require('../helpers/error-handler');

class JobTypeController {
	async list(request, response) {
		try {
			const jobTypes = await JobType.find({}, {_id: 1, title: 1, description: 1});

			if (jobTypes.length === 0) {
		        throw new Error("¡No hay tipos de oportunidades registradas en la base de datos!");
		    }

			return response.status(200).json({
				success: true,
				jobTypes
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async create(request, response) {
		try {
			const { title, description } = request.body;

			const jobType = await JobType.create({
				title,
				description
			});

			return response.status(200).json({
				success: true,
				jobType
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find(request, response) {
		try {
			const jobType = await JobType.findById(request.params.id);

			if (!jobType) {
				throw new Error("Tipo de trabajo no encontrado");
			}

			return response.json({
				success: true,
				jobType
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update(request, response) {
		try {
			const { title, description } = request.body;

			const jobType = await JobType.findById(request.params.id);

			if(!jobType) {
				throw new Error("Tipo de trabajo no encontrado");
			}

			jobType.title = title;
			jobType.description = description;

			await jobType.save();

			return response.json({
				success: true,
				jobType
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete(request, response) {
		try {

			const jobType = await JobType.findById(request.params.id);
			
			if (!jobType) {
		        throw new Error("Tipo de trabajo no encontrado");
		    }

			await jobType.remove();

			return response.json({
				success: true,
				message: 'Tipo de trabajo eliminado'
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async deleteAll(request, response) {
		try {
			await JobType.deleteMany();
      
			return response.status(200).json({
				success: true,
				message: "Se han eliminado todos los tipos de trabajo"
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new JobTypeController();