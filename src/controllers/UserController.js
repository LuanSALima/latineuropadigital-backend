let User = require('../schemas/user.schema.js');

const handleErrors = require('../modules/error-handler');

const bcrypt = require("bcryptjs"); /*Método de encriptamento da senha*/

class UserController {
	async getAllUsers(request, response) {
		try {
	      const users = await User.find();
	      if (users.length === 0) {
	        throw new Error("Não há Usuários Cadastrados no Banco de Dados!");
	      }

	      return response.status(200).json({
	        success: true,
	        users
	      });
	    } catch (error) {
	      return response.status(400).json(handleErrors(error));
	    }
	}

	async find (request, response) {
		try {
			const user = await User.findById(request.params.id);

			if (!user) {
				throw new Error("Usuário não encontrado");
			}

			return response.json({
				success: true,
				user
			});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async delete (request, response) {
		try {
			const user = await User.findByIdAndDelete(request.params.id);
			
			if (!user) {
		        throw new Error("Usuário Não Existe!");
		     }

			return response.json({
				success: true,
				message: 'Usuário deletado!'
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update (request, response) {
		try {
			const { username, email, password } = request.body;

			const user = await User.findById(request.params.id);

			if (!user) {
				throw new Error("Usuário não encontrado");
			}

			user.username = username;
			user.email = email;
			user.password = password;

			await user.save();
				
			return response.json({
				success: true,
				message: 'Usuário atualizado!'
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new UserController();