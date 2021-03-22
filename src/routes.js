const router = require('express').Router();

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');

const authMiddleware = require('./middlewares/auth');

router.post("/auth/authenticate", AuthController.authenticate);
router.post("/auth/signup", AuthController.signUp);

router.get("/user/list", UserController.getAllUsers);
router.get("/user/:id", UserController.find);
router.post("/user/update/:id", UserController.update);
router.delete("/user/:id", UserController.delete);

router.route('/auth/testAuthMiddleware')
	.get(
		authMiddleware, 
		(request, response) => {
			response.status(200).json({
				success: true,
				message: 'Rota acessada!'
			});
		}
	);

module.exports = router;