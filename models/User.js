// const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secretOrKey = require('../config').secretOrKey;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      minlength: 5,
      maxlength: 50,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, `"username" is invalid`],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hash: String,
    salt: String,
  },
  { timestamps: true },
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  const payload = {
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  };

  return jwt.sign(payload, secretOrKey);
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image,
  };
};

mongoose.model('User', UserSchema);

// const validateLogin = user => {
//   const schema = Joi.object({
//     username: Joi.string()
//       .pattern(new RegExp(/^[a-zA-Z0-9]+$/))
//       .lowercase()
//       .min(5)
//       .max(50)
//       .required(),
//     email: Joi.string()
//       .pattern(new RegExp(/\S+@\S+\.\S+/))
//       .lowercase()
//       .required(),
//     bio: Joi.string(),
//     image: Joi.string(),
//   });

//   return schema.validate(user, { abortEarly: false });
// };

// exports.User = User;
// exports.validateLogin = validateLogin;