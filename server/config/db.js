const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://simranjitkaur1jan1998_db_user:bX9BegPTU1KhY9qh@cluster0.npcbakt.mongodb.net/")
  .then(() => {
    console.log("Db Connected");
  })
  .catch((err) => {
    console.log("Error", err);
  });
