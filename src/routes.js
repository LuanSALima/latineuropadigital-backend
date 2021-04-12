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

router.get("/user/list", authorized() ,UserController.getAllUsers);
router.get("/user/:id", authorized(Role.Admin), UserController.find);
router.post("/user/create", authorized(Role.Admin), UserController.create);
router.put("/user/:id", authorized(Role.Admin), UserController.update);
router.delete("/user/:id", authorized(Role.Admin), UserController.delete);
router.get("/createFirstAdmin", UserController.createAdmin); /*Única forma de criar um usuário ADM*/


router.get("/notice/list", NoticeController.list);
router.get("/notice/:id", NoticeController.find);
router.post("/notice/create", authorized(), NoticeController.create);
router.put("/notice/:id", authorized(), NoticeController.update);
router.delete("/notice/:id", authorized(), NoticeController.delete);
router.get("/notices/tags", NoticeController.tagsUsed);


router.get("/directory/list", DirectoryController.list);
router.get("/directory/:id", DirectoryController.find);
router.post("/directory/create", DirectoryController.create);
router.put("/directory/:id", authorized(), DirectoryController.update);
router.delete("/directory/:id", authorized(), DirectoryController.delete);

router.get("/directories/tags", DirectoryController.tagsUsed);
router.get("/directories/all", authorized(), DirectoryController.listAll);
router.get("/directories/:status", authorized(), DirectoryController.listByStatus);


router.get("/event/list", EventController.list);
router.get("/event/:id", EventController.find);
router.post("/event/create", EventController.create);
router.put("/event/:id", authorized(), EventController.update);
router.delete("/event/:id", authorized(), EventController.delete);

router.get("/events/tags", EventController.tagsUsed);
router.get("/events/all", authorized(), EventController.listAll);
router.get("/events/:status", authorized(), EventController.listByStatus);


router.get("/course/list", CourseController.list);
router.get("/course/:id", CourseController.find);
router.post("/course/create", authorized(), CourseController.create);
router.put("/course/:id", authorized(), CourseController.update);
router.delete("/course/:id", authorized(), CourseController.delete);
router.get("/courses/tags", CourseController.tagsUsed);


router.get("/job/list", JobController.list);
router.get("/job/:id", JobController.find);
router.post("/job/create", JobController.create);
router.put("/job/:id", authorized(), JobController.update);
router.delete("/job/:id", authorized(), JobController.delete);

router.get("/jobs/all", authorized(), JobController.listAll);
router.get("/jobs/:status", authorized(), JobController.listByStatus);
//router.get("/jobs/wipe", JobController.deleteAll);


router.get("/tag/list", TagsController.list);
router.get("/tag/:id", TagsController.find);
router.post("/tag/create", authorized(), TagsController.create);
router.put("/tag/:id", authorized(), TagsController.update);
router.delete("/tag/:id", authorized(), TagsController.delete);
//router.get("/tags/wipe", TagsController.deleteAll);
router.get("/tags/:type", TagsController.listByType);


router.get("/jobtype/list", JobTypeController.list);
router.get("/jobtype/:id", JobTypeController.find);
router.post("/jobtype/create", authorized(), JobTypeController.create);
router.put("/jobtype/:id", authorized(), JobTypeController.update);
router.delete("/jobtype/:id", authorized(), JobTypeController.delete);
//router.get("/tags/wipe", JobTypeController.deleteAll);


router.get("/featured/list", FeaturedController.list);
router.get("/featured/:id", FeaturedController.find);
router.post("/featured/create", authorized(), FeaturedController.create);
router.put("/featured/:id", authorized(), FeaturedController.update);
router.put("/featured/:id/position", authorized(), FeaturedController.changePosition);
router.delete("/featured/:id", authorized(), FeaturedController.delete);

router.get("/featureds/all", authorized(), FeaturedController.listAll);

router.use("/", (req, res, next) => {
  res.status("404").json({success: false, message: "Route not found"});
});

module.exports = router;