let User = require('../schemas/user.schema.js');

const handleErrors = require('../modules/error-handler');

const bcrypt = require("bcryptjs"); /*Método de encriptamento da senha*/
const jwt = require("jsonwebtoken"); /*Método para geração do token de autenticação*/

//Método para gerar o token jwt, necessário passar o id
function generateToken(id) {
	return jwt.sign({ id: id }, process.env.JWT_HASH, {
    	expiresIn: 86400, /*(1 dia)Tempo em segundo para o expiramento do token*/
    });
}

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
					token: generateToken(user._id)
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
				password
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