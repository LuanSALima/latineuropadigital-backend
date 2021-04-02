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
const FeaturedController = require('./controllers/FeaturedController');

const Role = require('./helpers/roles');
const authorized = require('./middlewares/authorize');

router.post("/auth/authenticate", AuthController.authenticate);
//router.post("/auth/signup", AuthController.signUp);

router.get("/user/list", authorized(Role.User), UserController.getAllUsers);
router.get("/user/:id", authorized(Role.Admin), UserController.find);
router.put("/user/:id", authorized(Role.Admin), UserController.update);
router.delete("/user/:id", authorized(Role.Admin), UserController.delete);
router.post("/user/create", authorized(Role.Admin), UserController.create);
//router.post("/user/createAdm", authorized(Role.Admin), UserController.createAdm); /*Única forma de criar um usuário ADM*/

router.get("/notice/list", NoticeController.list);
router.get("/notice/:id", NoticeController.find);
router.post("/notice/create", authorized(Role.User), NoticeController.create);
router.put("/notice/:id", authorized(Role.User), NoticeController.update);
router.delete("/notice/:id", authorized(Role.User), NoticeController.delete);
router.get("/notices/tags", NoticeController.tagsUsed);

router.get("/directory/list", DirectoryController.list);
router.get("/directory/:id", DirectoryController.find);
router.post("/directory/create", authorized(Role.User), DirectoryController.create);
router.put("/directory/:id", authorized(Role.User), DirectoryController.update);
router.delete("/directory/:id", authorized(Role.User), DirectoryController.delete);
router.get("/directories/tags", DirectoryController.tagsUsed);

router.get("/event/list", EventController.list);
router.get("/event/:id", EventController.find);
router.post("/event/create", authorized(Role.User), EventController.create);
router.put("/event/:id", authorized(Role.User), EventController.update);
router.delete("/event/:id", authorized(Role.User), EventController.delete);
router.get("/events/tags", EventController.tagsUsed);

router.get("/course/list", CourseController.list);
router.get("/course/:id", CourseController.find);
router.post("/course/create", authorized(Role.User), CourseController.create);
router.put("/course/:id", authorized(Role.User), CourseController.update);
router.delete("/course/:id", authorized(Role.User), CourseController.delete);
router.get("/courses/tags", CourseController.tagsUsed);

router.get("/job/list", JobController.list);
router.get("/job/:id", JobController.find);
router.post("/job/create", JobController.create);
router.put("/job/:id", authorized(Role.User), JobController.update);
router.delete("/job/:id", authorized(Role.User), JobController.delete);

router.get("/jobs/all", authorized(Role.User), JobController.listAll);
router.get("/jobs/:status", authorized(Role.User), JobController.listByStatus);
//router.get("/jobs/wipe", authorized(Role.Admin), JobController.deleteAll);

router.get("/tag/list", TagsController.list);
router.get("/tag/:id", TagsController.find);
router.post("/tag/create", authorized(Role.User), TagsController.create);
router.put("/tag/:id", authorized(Role.User), TagsController.update);
router.delete("/tag/:id", authorized(Role.User), TagsController.delete);
//router.get("/tags/wipe", authorized(Role.Admin), TagsController.deleteAll);
router.get("/tags/:type", TagsController.listByType);

router.get("/jobtype/list", JobTypeController.list);
router.get("/jobtype/:id", JobTypeController.find);
router.post("/jobtype/create", authorized(Role.User), JobTypeController.create);
router.put("/jobtype/:id", authorized(Role.User), JobTypeController.update);
router.delete("/jobtype/:id", authorized(Role.User), JobTypeController.delete);
//router.get("/tags/wipe", JobTypeController.deleteAll);

router.get("/featured/list", FeaturedController.list);
router.get("/featured/:id", FeaturedController.find);
router.post("/featured/create", authorized(Role.User), FeaturedController.create);
router.put("/featured/:id", authorized(Role.User), FeaturedController.update);
router.put("/featured/:id/position", authorized(Role.User), FeaturedController.changePosition);
router.delete("/featured/:id", authorized(Role.User), FeaturedController.delete);

router.use("/", (req, res, next) => {
  res.status("404").json({success: false, message: "Route not found"});
});

module.exports = router;