const router = require('express').Router();

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const JobController = require('./controllers/JobController');
const TagsController = require('./controllers/TagsController');
const NoticeController = require('./controllers/NoticeController');
const DirectoryController = require('./controllers/DirectoryController');
const EventController = require('./controllers/EventController');
const CourseController = require('./controllers/CourseController');
const JobTypeController = require('./controllers/JobTypeController');

const Role = require('./helpers/roles');
const authorized = require('./middlewares/authorize');

router.post("/auth/authenticate", AuthController.authenticate);
//router.post("/auth/signup", AuthController.signUp);

router.get("/user/list", UserController.getAllUsers);
router.get("/user/:id", UserController.find);
router.put("/user/:id", UserController.update);
router.delete("/user/:id", UserController.delete);
router.post("/user/addAdmin", UserController.create); /*Única forma de criar um usuário ADM*/

router.get("/notice/list", NoticeController.list);
router.get("/notice/:id", NoticeController.find);
router.post("/notice/create", authorized(Role.Admin), NoticeController.create);
router.put("/notice/:id", authorized(Role.Admin), NoticeController.update);
router.delete("/notice/:id", authorized(Role.Admin), NoticeController.delete);
router.get("/notices/tags", NoticeController.tagsUsed);

router.get("/directory/list", DirectoryController.list);
router.get("/directory/:id", DirectoryController.find);
router.post("/directory/create", authorized(Role.Admin), DirectoryController.create);
router.put("/directory/:id", authorized(Role.Admin), DirectoryController.update);
router.delete("/directory/:id", authorized(Role.Admin), DirectoryController.delete);
router.get("/directories/tags", DirectoryController.tagsUsed);

router.get("/event/list", EventController.list);
router.get("/event/:id", EventController.find);
router.post("/event/create", authorized(Role.Admin), EventController.create);
router.put("/event/:id", authorized(Role.Admin), EventController.update);
router.delete("/event/:id", authorized(Role.Admin), EventController.delete);
router.get("/events/tags", EventController.tagsUsed);

router.get("/course/list", CourseController.list);
router.get("/course/:id", CourseController.find);
router.post("/course/create", authorized(Role.Admin), CourseController.create);
router.put("/course/:id", authorized(Role.Admin), CourseController.update);
router.delete("/course/:id", authorized(Role.Admin), CourseController.delete);
router.get("/courses/tags", CourseController.tagsUsed);

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
router.post("/tag/create", authorized(Role.Admin), TagsController.create);
router.put("/tag/:id", authorized(Role.Admin), TagsController.update);
router.delete("/tag/:id", authorized(Role.Admin), TagsController.delete);
//router.get("/tags/wipe", TagsController.deleteAll);

router.get("/jobtype/list", JobTypeController.list);
router.get("/jobtype/:id", JobTypeController.find);
router.post("/jobtype/create", authorized(Role.Admin), JobTypeController.create);
router.put("/jobtype/:id", authorized(Role.Admin), JobTypeController.update);
router.delete("/jobtype/:id", authorized(Role.Admin), JobTypeController.delete);
//router.get("/tags/wipe", JobTypeController.deleteAll);

router.use("/", (req, res, next) => {
  res.status("404").json({success: false, message: "Route not found"});
});

module.exports = router;