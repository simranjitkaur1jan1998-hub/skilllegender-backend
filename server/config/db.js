const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Db Connected");
  })
  .catch((err) => {
    console.log("Error", err);
  });