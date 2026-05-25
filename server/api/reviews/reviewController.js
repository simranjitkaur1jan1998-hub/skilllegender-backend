const reviewModel = require("./reviewModel");
const requestModel = require("../request/requestModel");

// ADD REVIEW
const add = async (req, res) => {
  try {
    const { requestId, mentorId, learnerId, sessionId, rating, comment } = req.body;

    const existing = await reviewModel.findOne({ requestId });
    if (existing) {
      return res.send({ success: false, message: "You have already reviewed this session" });
    }

    let total = await reviewModel.countDocuments();
    let newReview = new reviewModel();
    newReview.autoId = total + 1;
    newReview.requestId = requestId;
    newReview.mentorId = mentorId;
    newReview.learnerId = learnerId;
    newReview.sessionId = sessionId;
    newReview.rating = rating;
    newReview.comment = comment;

    await newReview.save();

    // Update request to mark as reviewed
    await requestModel.findByIdAndUpdate(requestId, { isReviewed: true });

    res.send({
      success: true,
      status: 201,
      message: "Review submitted successfully",
      data: newReview,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// GET REVIEWS BY MENTOR
const getByMentor = async (req, res) => {
  try {
    const { mentorId } = req.body;
    const data = await reviewModel.find({ mentorId, isDeleted: false })
      .populate("learnerId")
      .sort({ createdAt: -1 });
    res.send({
      success: true,
      status: 200,
      data: data,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// GET ALL REVIEWS
const all = async (req, res) => {
  try {
    let limit = parseInt(req.body.limit) || 8;
    let skip = parseInt(req.body.startPoint) || 0;
    let filter = { isDeleted: false };

    const total = await reviewModel.countDocuments(filter);
    const data = await reviewModel.find(filter)
      .populate("learnerId")
      .populate("mentorId")
      .populate("sessionId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.send({
      success: true,
      status: 200,
      data: data,
      total: total,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

module.exports = {
  add,
  getByMentor,
  all,
};
