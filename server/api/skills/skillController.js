const skillModel = require("./skillModel");
const learnerMentorModel = require("../learnerMentor/learnerMentorModel");
const { uploadImg } = require("../../utilities/helper");
const Joi = require("joi");

//  ADD SKILL..........................................................
const add = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
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
        message: "Image is required",
      });
    }
    let existingSkill = await skillModel.findOne({
      name: value.name,
      isDeleted: false,
    });
    if (existingSkill) {
      return res.send({
        success: false,
        status: 400,
        message: "Skill Already Exists",
      });
    }
    let image = "no_image.jpg";
    try {
      const imageUrl = await uploadImg(req.file.buffer, `skill-ledger/${Date.now()}`);
      image = imageUrl;
    } catch (err) {
      return res.send({
        success: false,
        status: 500,
        message: "Image upload failed",
      });
    }
    let totalSkills = await skillModel.countDocuments();
    let newSkill = new skillModel({
      autoId: totalSkills + 1,
      name: value.name,
      image: image,
    });
    if (req.decoded?.addedById) {
      newSkill.addedById = req.decoded.addedById;
    }
    let savedSkill = await newSkill.save();
    return res.send({
      status: 201,
      success: true,
      message: "Skill Added Successfully",
      data: savedSkill,
    });
  } catch (err) {
    return res.send({
      status: 500,
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   GET ALL SKILLS
========================= */
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
      filter.name = { $regex: filter.search, $options: 'i' };
      delete filter.search;
    }
    let skills = await skillModel.find(filter).skip(skip).limit(limit)
    let total = await skillModel.countDocuments(filter)
    res.send({
      status: 200,
      success: true,
      data: skills,
      message: "All Skills Loaded",
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

/* =========================
   GET SINGLE SKILL
========================= */
const single = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.send({
        success: false,
        status: 400,
        message: "_id is required",
      });
    }

    let skill = await skillModel.findOne({
      _id: req.body._id,
      isDeleted: false,
    });

    if (!skill) {
      return res.send({
        success: false,
        status: 404,
        message: "Skill Not Found",
      });
    }

    return res.send({
      success: true,
      status: 200,
      message: "Skill Loaded Successfully",
      data: skill,
    });

  } catch (error) {
    return res.send({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

/* =========================
   UPDATE SKILL
========================= */
const update = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.send({
        success: false,
        status: 400,
        message: "_id is required",
      });
    }

    let skill = await skillModel.findOne({
      _id: req.body._id,
      isDeleted: false,
    });

    if (!skill) {
      return res.send({
        success: false,
        status: 404,
        message: "Skill Not Found",
      });
    }

    if (req.body.name) {
      skill.name = req.body.name;
    }

    if (req.file) {
      try {
        const imageUrl = await uploadImg(
          req.file.buffer,
          `skill-ledger/${Date.now()}`
        );
        skill.image = imageUrl;
      } catch (err) {
        return res.send({
          success: false,
          status: 500,
          message: "Image upload failed",
        });
      }
    }

    skill.updatedAt = Date.now();

    let updatedSkill = await skill.save();

    return res.send({
      success: true,
      status: 200,
      message: "Skill Updated",
      data: updatedSkill,
    });

  } catch (err) {
    return res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

/* =========================
   GET USERS BY SKILL (MAIN FEATURE)
========================= */
// GET /api/users/:skill

const getUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.params;

    const users = await learnerMentorModel.find({
      isDeleted: false,
      skillsOffered: {
        $elemMatch: {
          $regex: skill,
          $options: "i"
        }
      }
    });

    res.send({
      success: true,
      data: users
    });

  } catch (err) {
    res.send({ success: false, message: err.message });
  }
};
/* =========================
   DELETE
========================= */
const hardDelete = async (req, res) => {
  try {
    await skillModel.deleteOne({ _id: req.body._id });

    return res.send({
      success: true,
      status: 200,
      message: "Skill Deleted",
    });

  } catch (err) {
    return res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

const softDelete = async (req, res) => {
  try {
    let skill = await skillModel.findOne({ _id: req.body._id });

    if (!skill) {
      return res.send({
        success: false,
        status: 404,
        message: "Skill Not Found",
      });
    }

    skill.isDeleted = true;
    await skill.save();

    return res.send({
      success: true,
      status: 200,
      message: "Skill Deleted Successfully",
    });

  } catch (err) {
    return res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

module.exports = {
  add,
  all,
  single,
  update,
  getUsersBySkill,
  hardDelete,
  softDelete,
};