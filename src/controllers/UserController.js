let User = require('../schemas/user.schema.js');

const handleErrors = require('../helpers/error-handler');

class UserController {
	async getAllUsers(request, response) {
		try {
	      const users = await User.find();
	      if (users.length === 0) {
	        throw new Error("¡No hay usuarios registrados en la base de datos!");
	      }

	      return response.status(200).json({
	        success: true,
	        users
	      });
	    } catch (error) {
	      return response.status(400).json(handleErrors(error));
	    }
	}

	async create(request, response) {
		try {
			const { username, email, phone, password } = request.body;

			const user = await User.create({
				username,
				email,
				phone,
				password,
				role: "Admin"
			});

			return response
				.status(200)
				.json({
					success: true
				});
		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async find (request, response) {
		try {
			const user = await User.findById(request.params.id);

			if (!user) {
				throw new Error("Usuario no encontrado");
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
		        throw new Error("¡El usuario no existe!");
		     }

			return response.json({
				success: true,
				message: '¡Usuario eliminado!'
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}

	async update (request, response) {
		try {
			const { username, email, phone, password } = request.body;

			const user = await User.findById(request.params.id).select("+password");

			if (!user) {
				throw new Error("Usuario no encontrado");
			}

			if(password) {
				user.username = username;
				user.email = email;
				user.phone = phone;
				user.password = password;

				await user.save();
			} else {
				await User.findByIdAndUpdate(user.id, {
		  			'$set': {
		  				username,
		  				email,
		  				phone
		  			}
		  		});
			}
				
			return response.json({
				success: true,
				message: 'Usuario actualizado!'
			});

		} catch (error) {
			return response.status(400).json(handleErrors(error));
		}
	}
}

module.exports = new UserController();