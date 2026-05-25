const learnerMentorModel = require("./learnerMentorModel");
const userModel = require("../user/userModel");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { uploadImg } = require("../../utilities/helper");
const skillModel = require("../skills/skillModel");
const sessionModel = require("../sessions/sessionModel");
const requestModel = require("../request/requestModel");
const saltRounds = 10;

const register = async (req, res) => {
  try {
    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = [req.body.skills];
    }

    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(3).required(),
      phone: Joi.number().required(),
      profession: Joi.string().required(),
      experience: Joi.string().required(),
      skills: Joi.array().items(Joi.string()).required(),
    });
    const { error, value } = schema.validate(req.body);
    const formData = value;
    if (error) {
      return res.send({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }
    if (!req.file) {
      return res.send({
        success: false,
        status: 400,
        message: "Profile image is required",
      });
    }
    /* ========= EMAIL CHECK ========= */
    let existingEmail = await userModel.findOne({ email: formData.email });
    if (existingEmail) {
      return res.send({
        success: false,
        status: 400,
        message: "Email Already Exists",
      });
    }
    /* ========= IMAGE UPLOAD ========= */
    let image = "no_image.jpg";
    try {
      const imageUrl = await uploadImg(req.file.buffer, `skill-ledger/${Date.now()}`);
      image = imageUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      return res.send({
        success: false,
        status: 500,
        message: "Profile upload failed",
      });
    }

    /* ========= CREATE USER ========= */
    let totalUser = await userModel.countDocuments();
    let newUser = new userModel({
      name: formData.name,
      autoId: totalUser + 1,
      email: formData.email,
      password: bcrypt.hashSync(formData.password, saltRounds),
      userType: 2,
    });
    let savedUser = await newUser.save();
    /* ========= CREATE LEARNER / MENTOR ========= */
    let totalCustomers = await learnerMentorModel.countDocuments();
    let newCustomer = new learnerMentorModel({
      autoId: totalCustomers + 1,
      name: formData.name,
      email: formData.email,
      profession: formData.profession,
      experience: formData.experience,
      phone: formData.phone,
      skills: formData.skills,
      profile: image,
      userId: savedUser._id,
    });
    let savedCustomer = await newCustomer.save();
    /* ========= LINK BOTH ========= */
    savedUser.learnerMentorId = savedCustomer._id;
    await savedUser.save();
    return res.send({
      success: true,
      status: 201,
      message: "User Registered Successfully",
      data: savedCustomer,
    });
  } catch (error) {
    return res.send({
      status: 500,
      success: false,
      message: error.message,
    });
  }
};

const all = async (req, res) => {
  try {
    let formData = req.body || {}
    let skip = 0
    let limit = 10000000
    formData.isDeleted = false
    if (formData.startPoint !== undefined) {
      skip = parseInt(formData.startPoint) || 0
      delete formData.startPoint
    }
    if (formData.limit !== undefined) {
      limit = parseInt(formData.limit) || 1000000;
      delete formData.limit
    }
    let filter = { ...formData }
    if (filter.search) {
      filter.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { profession: { $regex: filter.search, $options: 'i' } },
        { experience: { $regex: filter.search, $options: 'i' } }
      ];
      delete filter.search;
    }

    let learners = await learnerMentorModel.find(filter).skip(skip).limit(limit).populate("skills")
    let total = await learnerMentorModel.countDocuments(filter)
    res.send({
      status: 200,
      success: true,
      data: learners,
      message: "All Users Loaded",
      total: total
    })
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      status: 500,
      message: err.message
    })
  }
}

const blockUnblockUser = async (req, res) => {
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      isBlocked: Joi.boolean().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.send({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }
    else {
      let learner = await learnerMentorModel.findOne({
        _id: value._id,
        isDeleted: false,
      });
      let user = await userModel.findOne({
        _id: learner.userId,
        isDeleted: false,
      });
      if (!user) {
        return res.send({
          success: false,
          status: 404,
          message: "User Not Found",
        });
      }
      if (!learner) {
        return res.send({
          success: false,
          status: 404,
          message: "Learner/Mentor Not Found",
        });
      }
      learner.isBlocked = value.isBlocked;
      user.isBlocked = value.isBlocked;
      learner.updatedAt = Date.now();
      user.updatedAt = Date.now();
      if(req.decoded.updatedById){
        learner.updatedById = req.decoded.updatedById;
        user.updatedById = req.decoded.updatedById;
      }
      await learner.save();
      await user.save();
      res.send({
        success: true,
        status: 200,
        message: value.isBlocked ? "User Blocked" : "User Unblocked",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

const addSkill = async (req, res) => {
  try {
    const { userId, skill } = req.body;
    const user = await learnerMentorModel.findById(userId);
    if (!user) return res.send({ success: false, message: "User not found" });
    if (!user.skills.includes(skill)) user.skills.push(skill);
    await user.save();
    res.send({ success: true, message: "Skill added", data: user });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

const mentorDashboard = async (req, res) => {
  try {
    let skills = await skillModel.find({ mentorId: req.body.mentorId, isDeleted: false })
    let session = await sessionModel.find({ mentorId: req.body.mentorId, isDeleted: false })
    let booking = await requestModel.find({ mentorId: req.body.mentorId, isDeleted: false })
    res.send({
      success: true, status: 200, message: "Mentor Dashboard",
      data: { skillsCount: skills.length, sessionCount: session.length, bookingCount: booking.length }
    })
  } catch (error) {
    res.send({ success: false, status: 500, message: error.message });
  }
}

const learnerDashboard = async (req, res) => {
  try {
    const { learnerId } = req.body;
    if (!learnerId) return res.send({ success: false, message: "Learner ID is required" });
    const allRequests = await requestModel.find({ learnerId, isDeleted: false });
    res.send({
      success: true, status: 200, message: "Learner Dashboard Data",
      data: {
        totalBookings: allRequests.length,
        pendingBookings: allRequests.filter(r => r.status === "pending").length,
        acceptedBookings: allRequests.filter(r => r.status === "accepted").length,
        rejectedBookings: allRequests.filter(r => r.status === "rejected").length,
      }
    });
  } catch (error) {
    res.send({ success: false, status: 500, message: error.message });
  }
};

const getSingleProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.send({ success: false, message: "User ID is required" });
    const profile = await learnerMentorModel.findById(_id).populate("skills");
    const user = await userModel.findById(profile.userId);
    res.send({
      success: true,
      data: { ...profile._doc, name: user.name, email: user.email }
    });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { _id, name, phone, profession, experience, skills } = req.body;
    let profile = await learnerMentorModel.findById(_id);
    if (!profile) return res.send({ success: false, message: "Profile not found" });
    let user = await userModel.findById(profile.userId);
    let image = profile.profile;
    if (req.file) image = await uploadImg(req.file.buffer, `skill-ledger/${Date.now()}`);
    user.name = name || user.name;
    profile.phone = phone || profile.phone;
    profile.profession = profession || profile.profession;
    profile.experience = experience || profile.experience;
    profile.profile = image;
    if (skills) profile.skills = Array.isArray(skills) ? skills : [skills];
    await user.save();
    await profile.save();
    res.send({ success: true, message: "Profile Updated Successfully", data: profile });
  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  all,
  blockUnblockUser,
  addSkill,
  mentorDashboard,
  learnerDashboard,
  getSingleProfile,
  updateProfile
};