const userModel = require("../api/user/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

userModel
  .findOne({ email: "admin@gmail.com" })
  .then((a) => {
    if (a) {
      console.log("Admin Already Exists");
    } else {
      let admin = new userModel();
      admin.autoId = 1;
      admin.email = "admin@gmail.com";
      admin.name = "admin";
      admin.password = bcrypt.hashSync("123", saltRounds);
      admin.userType = 1;
      admin.phone = 89877976886;
      admin
        .save()
        .then((savedAdmin) => {
          console.log("Admin Created");
        })
        .catch((err) => {
          console.log("Error in save admin", err);
        });
    }
  })
  .catch((err) => {
    console.log("Error in finding admin", err);
  });
