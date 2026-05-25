const sessionModel = require("./sessionModel");
const { uploadImg } = require("../../utilities/helper");
const Joi = require("joi");
const mongoose = require("mongoose");

// ADD SESSION
const add = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    skillId: Joi.string().required(),
    duration: Joi.string().required(),
    linkOption: Joi.string().valid('youtube', 'meeting').required(),
    price: Joi.when("sessionType", {
      is: "paid",
      then: Joi.number().min(1).required(),
      otherwise: Joi.forbidden(),
    }),
    youtubeLinks: Joi.when('linkOption', {
      is: 'youtube',
      then: Joi.array().items(Joi.string().uri().allow('')).min(1).required(),
      otherwise: Joi.forbidden(),
    }),
    image: Joi.any().optional(),
    sessionType: Joi.string().valid("free", "paid").required(),
    mentorId: Joi.string().required(),
    description: Joi.string().optional().allow(""),
  });

  if (req.body.youtubeLinks && typeof req.body.youtubeLinks === "string") {
    req.body.youtubeLinks = [req.body.youtubeLinks];
  }

  const { error, value } = schema.validate(req.body);
  console.log(error);

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
  } else {
    let existingSession = await sessionModel.findOne({
      name: value.name,
      isDeleted: false,
    });

    if (existingSession) {
      return res.send({
        success: false,
        status: 400,
        message: "Session Already Exist",
      });
    } else {
      let image = "no_image.jpg";
      try {
        const imageUrl = await uploadImg(req.file.buffer, `ecom/${Date.now()}`);
        image = imageUrl;
      } catch (err) {
        console.error("Image upload failed:", err);
        return res.json({
          success: false,
          status: 500,
          message: "Profile upload failed",
        });
      }

      let totalSessions = await sessionModel.countDocuments();
      let newSession = new sessionModel();
      newSession.autoId = totalSessions + 1;
      newSession.name = value.name;
      newSession.image = image;
      newSession.mentorId = value.mentorId;

      if (req.decoded?.addedById) {
        newSession.addedById = req.decoded.addedById;
      }

      newSession.duration = value.duration;
      newSession.sessionType = value.sessionType;
      newSession.price = value.price || 0;
      newSession.youtubeLinks = value.youtubeLinks || [];
      newSession.linkOption = value.linkOption;
      newSession.description = value.description;

      if (value.skillId && mongoose.Types.ObjectId.isValid(value.skillId)) {
        newSession.skillId = value.skillId;
      } else {
        newSession.skillId = null;
      }
      newSession
        .save()
        .then((savedSession) => {
          res.send({
            status: 201,
            success: true,
            message: "Session Added",
            data: savedSession,
          });
        })
        .catch((err) => {
          console.log(err);
          res.send({
            status: 500,
            success: false,
            message: err,
          });
        });
    }
  }
};

// VIEW ALL SESSIONS
const all = async (req, res) => {
  try {
    let formData = req.body || {};
    let skip = 0;
    let limit = 1000000;

    formData.isDeleted = false;

    if (formData.startPoint !== undefined) {
      skip = parseInt(formData.startPoint) || 0;
      delete formData.startPoint;
    }

    if (formData.limit !== undefined) {
      limit = parseInt(formData.limit) || 1000000;
      delete formData.limit;
    }

    let filter = { ...formData };

    if (filter.search) {
      if (typeof filter.search === "string") {
        filter.name = { $regex: filter.search, $options: "i" };
      } else if (typeof filter.search === "object") {
        Object.assign(filter, filter.search);
      }
      delete filter.search;
    }
    // console.log(filter,"filter");


    let sessions = await sessionModel
      .find(filter)
      .populate("skillId")
      .populate("mentorId")
      .skip(skip)
      .limit(limit);

    let total = await sessionModel.countDocuments(filter);

    res.send({
      status: 200,
      success: true,
      data: sessions,
      message: "All Sessions Loaded",
      total: total,
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// VIEW SINGLE SESSION
const single = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.send({
        success: false,
        status: 400,
        message: "_id is required",
      });
    }

    let session = await sessionModel
      .findOne({
        _id: req.body._id,
        isDeleted: false,
      })
      .populate("skillId");

    if (!session) {
      return res.send({
        success: false,
        status: 404,
        message: "Session Not Found",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Session Loaded Successfully",
      data: session,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

// UPDATE SESSION
const update = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.send({
        success: false,
        status: 400,
        message: "_id is required",
      });
    }

    let session = await sessionModel.findOne({
      _id: req.body._id,
      isDeleted: false,
    });

    if (!session) {
      return res.send({
        success: false,
        status: 404,
        message: "Session Not Found",
      });
    }

    if (req.body.name !== undefined) session.name = req.body.name;
    if (req.body.date !== undefined) session.date = req.body.date;
    if (req.body.time !== undefined) session.time = req.body.time;
    if (req.body.price !== undefined) session.price = req.body.price;
    if (req.body.duration !== undefined) session.duration = req.body.duration;
    if (req.body.sessionType !== undefined) session.sessionType = req.body.sessionType;
    if (req.body.meetingLink !== undefined) session.meetingLink = req.body.meetingLink;
    if (req.body.description !== undefined) session.description = req.body.description;
    if (req.body.linkOption !== undefined) session.linkOption = req.body.linkOption;
    if (req.body.youtubeLinks !== undefined) {
      if (typeof req.body.youtubeLinks === "string") {
        session.youtubeLinks = [req.body.youtubeLinks];
      } else {
        session.youtubeLinks = req.body.youtubeLinks;
      }
    }
    
    if (req.body.skillId !== undefined) {
      if (mongoose.Types.ObjectId.isValid(req.body.skillId)) {
        session.skillId = req.body.skillId;
      } else {
        session.skillId = null;
      }
    }

    // IMAGE UPDATE
    if (req.file) {
      try {
        const imageUrl = await uploadImg(req.file.buffer, `ecom/${Date.now()}`);
        session.image = imageUrl;
      } catch (err) {
        return res.json({
          success: false,
          status: 500,
          message: "Image upload failed",
        });
      }
    }

    session.updatedAt = Date.now();
    session.updatedById = req.body.updatedById;

    let updatedSession = await session.save();

    res.send({
      success: true,
      status: 200,
      message: "Session Updated",
      data: updatedSession,
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// HARD DELETE
const hardDelete = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.send({
        success: false,
        status: 400,
        message: "_id is required",
      });
    }

    let session = await sessionModel.findOne({ _id: req.body._id });

    if (!session) {
      return res.send({
        success: false,
        status: 404,
        message: "Session Not Found",
      });
    }

    let deletedItem = await sessionModel.deleteOne({
      _id: req.body._id,
    });

    res.send({
      success: true,
      status: 200,
      data: deletedItem,
      message: "Session Deleted",
    });
  } catch (err) {
    res.send({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

// SOFT DELETE
const softDelete = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.send({
        success: false,
        status: 400,
        message: "_id is required",
      });
    }

    let session = await sessionModel.findOne({ _id: req.body._id });

    if (!session) {
      return res.send({
        success: false,
        status: 404,
        message: "Session Not Found",
      });
    }

    session.isDeleted = true;

    let savedSession = await session.save();

    res.send({
      success: true,
      status: 200,
      data: savedSession,
      message: "Session Deleted Successfully!",
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
  all,
  single,
  update,
  hardDelete,
  softDelete,
};
