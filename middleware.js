const jwt = require("jsonwebtoken");
const multer = require('multer')
const path = require('path')
require('dotenv').config()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "./images/");
  },
  filename: function(req,file,cb) {
      cb(null, file.fieldname + '_' + new Date().getTime()  + path.extname(file.originalname))
  }
})
exports.upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true)
    } else {
      cb(null, false)
      return cb(new Error("Only .png, .jpg, and .jpeg format allowed"))
    }
  },
  limits: {
    fileSize: 4 * 1024 * 1024
  }
})
exports.authenticated = (req, res, next) => {
  try {
    let tokenHeader = req.headers["authorization"];
    let token = tokenHeader.slice(7, tokenHeader.length);

    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
        if (err) {
          return res.status(200).json({
            success: false,
            message: "token is not valid"
          });
        } else {
          req.user_id = decode.id;
          req.expired = decode.iat;
          next();
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "You are not login"
      });
    }
  } catch (error) {
    res.send({
      message: "token is not defined",
      success: false
    });
  }
};
