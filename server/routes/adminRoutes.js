const express = require("express");
const router = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

// User Routes
const userController = require("../api/user/userController");
router.post("/login", userController.login);

router.use(require("../middleware/tokenChecker"));

//adminDashboard Route 
const dashboardController = require("../api/dashboard/adminDashboardController")
router.post("/dashboard", dashboardController.adminDashboard);

// Contact Routes
const contactController = require("../api/contact/contactController");
router.post("/contact/all", contactController.all);
router.post("/contact/markRead", contactController.markRead);
router.post("/contact/delete", contactController.remove);


// skill route
const skillController = require("../api/skills/skillController");
// const skillStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "server/public/skill");
//   },
//   filename: function (req, file, cb) {
//     console.log("Multer", file);
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + unique + file.originalname);
//   },
// });
// const skillUpload = multer({ storage: skillStorage });
router.post("/skill/add", fileUpload.single("image"), skillController.add);
router.post("/skill/all", skillController.all);
router.post("/skill/single", skillController.single);

router.post(
  "/skill/update",
  fileUpload.single("image"),
  skillController.update,
);
router.post("/skill/hardDelete", skillController.hardDelete);
router.post("/skill/delete", skillController.softDelete);


//view all users
const learnerMentorController = require("../api/learnerMentor/learnerMentorController");
router.post("/users/all", learnerMentorController.all);
router.post("/user/blockUnblock",learnerMentorController.blockUnblockUser)

// Admin Bookings (all requests)
const requestController = require("../api/request/requestController");
router.post("/bookings/all", requestController.all);

// Admin Sessions
const adminSessionController = require("../api/sessions/sessionController");
router.post("/sessions/all", adminSessionController.all);

// Admin Payments (paid bookings)
router.post("/payments/all", requestController.allPayments);

// Admin Reviews
const adminReviewController = require("../api/reviews/reviewController");
router.post("/reviews/all", adminReviewController.all);


//sessions
const sessionController = require("../api/sessions/sessionController");
router.post("/session/all", sessionController.all);
router.post("/session/add", fileUpload.single("image"), skillController.add);
router.post("/session/single", skillController.single);
router.post(
  "/session/update",
  fileUpload.single("image"),
  sessionController.update,
);
router.post("/session/hardDelete", sessionController.hardDelete);
router.post("/session/delete", sessionController.softDelete);





//if i make invalid address --- called wildcard route
//  router.all(/(.*)/, (req, res) => {
//   res.send({
//     success: false,
//     status: 404,
//     message: "Invalid address",
//   });
// });

module.exports = router;
