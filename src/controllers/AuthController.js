let User = require('../schemas/user.schema.js');

const handleErrors = require('../helpers/error-handler');
const Roles = require('../helpers/roles');

const bcrypt = require("bcryptjs"); /*Método de encriptamento da senha*/

const jwt = require('../helpers/jwt');

class AuthController {
	async authenticate(request, response) {
		try {
			const { email, password } = request.body;

			const user = await User.findOne({ email }).select('+password');

			if (!user) {
				throw new Error("Usuario no encontrado");
			}

			if (!(await bcrypt.compare(password, user.password))) {
				throw new Error("Contraseña incorrecta");
			}

			return response
				.status(200)
				.json({
					success: true,
					user: {
						username: user.username,
						role: user.role
					},
					token: jwt.generateToken(user._id, user.role)
				});
	    } catch (error) {
	    	return response.status(400).json(handleErrors(error));
	    }
	}

	async isLogged(request, response) {
		try {
			return response
				.status(200)
				.json({
					success: true
				});
	    } catch (error) {
	    	return response.status(400).json(handleErrors(error));
	    }
	}
}

module.exports = new AuthController();