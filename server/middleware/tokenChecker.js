const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;

module.exports = (req, res, next) => {
  let token = req.headers["authorization"];
  // console.log(token);
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      // console.log(decoded);
      if (err) {
        res.send({
          success: false,
          status: 403,
          message: "Unauthorized",
        });
      } else {
        req.decoded = decoded;
        req.decoded.addedById = req.decoded._id;
        req.decoded.updatedById = req.decoded._id;
        next();
      }
    });
  } else {
    res.send({
      success: false,
      status: 404,
      message: "Token not found",
    });
  }
};
