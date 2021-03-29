const router = require('express').Router();

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const PostController = require('./controllers/PostController');
const JobController = require('./controllers/JobController');
const TagsController = require('./controllers/TagsController');
const NoticeController = require('./controllers/NoticeController');

const Role = require('./helpers/roles');
const authorized = require('./middlewares/authorize');

router.post("/auth/authenticate", AuthController.authenticate);
//router.post("/auth/signup", AuthController.signUp);

router.get("/user/list", UserController.getAllUsers);
router.get("/user/:id", UserController.find);
router.put("/user/:id", UserController.update);
router.delete("/user/:id", UserController.delete);
router.post("/user/addAdmin", UserController.create); /*Única forma de criar um usuário ADM*/

router.get("/post/list", PostController.list);
router.get("/post/:id", PostController.find);
router.post("/post/create", authorized(Role.Admin), PostController.create);
router.put("/post/:id", authorized(Role.Admin), PostController.update);
router.delete("/post/:id", authorized(Role.Admin), PostController.delete);
router.get("/posts/:tag", PostController.findByTag);

router.get("/notice/list", NoticeController.list);
router.get("/notice/:id", NoticeController.find);
router.post("/notice/create", authorized(Role.Admin), NoticeController.create);
router.put("/notice/:id", authorized(Role.Admin), NoticeController.update);
router.delete("/notice/:id", authorized(Role.Admin), NoticeController.delete);
router.get("/notices/tags", NoticeController.tagsUsed);

router.get("/job/list", JobController.list);
router.get("/job/:id", JobController.find);
router.post("/job/create", JobController.create);
router.put("/job/:id", authorized(Role.Admin), JobController.update);
router.delete("/job/:id", authorized(Role.Admin), JobController.delete);

router.get("/jobs/all", authorized(Role.Admin), JobController.listAll);
router.get("/jobs/:status", authorized(Role.Admin), JobController.listByStatus);
//router.get("/jobs/wipe", JobController.deleteAll);

router.get("/tag/list", TagsController.list);
router.get("/tag/:id", TagsController.find);
router.post("/tag/create", TagsController.create);
router.put("/tag/:id", TagsController.update);
router.delete("/tag/:id", TagsController.delete);
//router.get("/tags/wipe", TagsController.deleteAll);

router.use("/", (req, res, next) => {
  res.status("404").json({success: false, message: "Route not found"});
});

module.exports = router;