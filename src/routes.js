const router = require('express').Router();

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const PostController = require('./controllers/PostController');

const Role = require('./helpers/roles');
const authorized = require('./middlewares/authorize');

router.post("/auth/authenticate", AuthController.authenticate);
router.post("/auth/signup", AuthController.signUp);

router.get("/user/list", UserController.getAllUsers);
router.get("/user/:id", UserController.find);
router.put("/user/update/:id", UserController.update);
router.delete("/user/:id", UserController.delete);
router.post("/user/addAdmin", UserController.create); /*Única forma de criar um usuário ADM*/

router.get("/post/list", PostController.list);
router.get("/post/:id", PostController.find);
router.post("/post/create", authorized(Role.Admin), PostController.create);
router.put("/post/:id", authorized(Role.Admin), PostController.update);
router.delete("/post/:id", authorized(Role.Admin), PostController.delete);

router.route('/auth/testAuthMiddleware')
	.get(
		authorized(Role.Admin), 
		(request, response) => {
			response.status(200).json({
				success: true,
				message: 'Rota acessada!'
			});
		}
	);

module.exports = router;