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
				throw new Error("Usuário não encontrado");
			}

			if (!(await bcrypt.compare(password, user.password))) {
				throw new Error("Senha incorreta");
			}

			user.password = undefined;

			return response
				.status(200)
				.json({
					success: true,
					user,
					token: jwt.generateToken(user._id, user.role)
				});
	    } catch (error) {
	    	return response.status(400).json(handleErrors(error));
	    }
	}

	async signUp(request, response) {
		try {
			const { username, email, phone, password } = request.body;

			const user = await User.create({
				username,
				email,
				phone,
				password,
				role: Roles.User
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
}

module.exports = new AuthController();