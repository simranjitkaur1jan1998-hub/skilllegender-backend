const userModel = require("./userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;

const login = async (req, res) => {
  try {
    let validation = "";
    if (!req.body.email) {
      validation += "Email is required";
    }
    if (!req.body.password) {
      validation += "Password is required";
    }
    if (!!validation) {
      res.send({
        success: false,
        status: 400,
        message: validation,
      });
    } else {
      let user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        res.send({
          success: false,
          status: 404,
          message: "User Not Found",
        });
      } else {
        let isMatch = bcrypt.compareSync(req.body.password, user.password);
        if (isMatch) {
          if (user.isBlocked) {
            res.send({
              success: false,
              status: 400,
              message: "Your Account is Blocked",
            });
          } else if (user.isDeleted) {
            res.send({
              success: false,
              status: 400,
              message: "Your Account is Deleted or Not Found",
            });
          } else if (user.status == false) {
            return res.send({
              success: false,
              status: 400,
              message: "Your Account is inactive , Please Contact Admin",
            });
          } else {
            let payload = {
              _id: user._id,
              name: user.name,
              email: user.email,
              userType: user.userType,
              phone: user.phone,
            };
            let token = jwt.sign(payload, secretKey);
            return res.send({
              success: true,
              status: 200,
              message: "Login Successfull",
              token: token,
              data: user,
            });
          }
        } else {
          return res.send({
            success: false,
            status: 400,
            message: "Invalid Password",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    let validation = "";
    if (!req.body._id) {
      validation += "_id is required ";
    }
    if (!req.body.currentPassword) {
      validation += "Current Password is required";
    }
    if (!req.body.newPassword) {
      validation += "New Password is required";
    }
    if (!req.body.confirmPassword) {
      validation += "Confirm Password is required";
    }

    if (!!validation) {
      return res.send({
        success: false,
        status: 400,
        message: validation,
      });
    } else {
      let user = await userModel.findOne({ _id: req.body._id });
      if (!user) {
        return res.send({
          success: false,
          status: 404,
          message: "User not found",
        });
      } else {
        if (req.body.newPassword !== req.body.confirmPassword) {
          res.send({
            success: false,
            status: 400,
            message: "New Password & Confirm Passowrd does not match",
          });
        } else {
          let isMatch = bcrypt.compareSync(
            req.body.currentPassword,
            user.password,
          );
          if (isMatch) {
            user.password = bcrypt.hashSync(req.body.newPassword, 10);
            let savedUserd = await user.save();
            return res.send({
              success: true,
              status: 200,
              message: "Password Changed",
            });
          } else {
            return res.send({
              success: false,
              status: 400,
              message: "Invalid Password",
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: 500,
      success: false,
      message: error,
    });
  }
};
module.exports = {
  login,
  changePassword,
};
