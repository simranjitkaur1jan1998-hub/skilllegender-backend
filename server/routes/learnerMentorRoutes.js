const router = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });
const learnerMentorController = require("../api/learnerMentor/learnerMentorController");
const userController = require("../api/user/userController");
const skillController = require("../api/skills/skillController");
const sessionController = require("../api/sessions/sessionController");
const requestController = require("../api/request/requestController");
const paymentController = require("../api/payment/paymentController");
const aiController = require("../api/ai/aiController");
const reviewController = require("../api/reviews/reviewController");
const chatController = require("../api/chat/chatController");
const contactController = require("../api/contact/contactController");

// User Routes
router.post("/login", userController.login);
router.post("/changePassword", userController.changePassword);
router.post("/register", fileUpload.single("profile"), learnerMentorController.register);

// AI Routes
router.post("/ai/ask", aiController.askAI);
router.post("/ai/recommend", aiController.recommendSkills);

// Public Routes
router.post("/skills/all", skillController.all);
router.post("/all", learnerMentorController.all);
router.post("/session/all", sessionController.all);
router.post("/review/getByMentor", reviewController.getByMentor);
router.post("/contact/add", contactController.add);

router.use(require("../middleware/tokenChecker"));

router.post("/mentor/dashboard", learnerMentorController.mentorDashboard);
router.post("/learner/dashboard", learnerMentorController.learnerDashboard);
router.post("/profile/get", learnerMentorController.getSingleProfile);
router.post("/profile/update", fileUpload.single("profile"), learnerMentorController.updateProfile);


// Chat Routes
router.post("/chat/send", chatController.send);
router.post("/chat/getConversation", chatController.getConversation);
router.post("/chat/getChatList", chatController.getChatList);

// Review Routes
router.post("/review/add", reviewController.add);

// Request Routes
router.post("/request/add", requestController.add);
router.post("/request/all", requestController.all);
router.post("/request/updateStatus", requestController.updateStatus);

// Payment Routes
router.post("/payment/createOrder", paymentController.createOrder);
router.post("/payment/verifyPayment", paymentController.verifyPayment);

// Sessions Routes
router.post("/session/add", fileUpload.single("image"), sessionController.add);
router.post("/session/single", sessionController.single);
router.post("/session/update", fileUpload.single("image"), sessionController.update);
router.post("/session/delete", sessionController.softDelete);

module.exports = router;
