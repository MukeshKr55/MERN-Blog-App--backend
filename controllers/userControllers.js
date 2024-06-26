const HttpError = require("../models/errorModel");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// ============================REGISTER A NEW USER
// POST : api/users/register
// UNPROTECTED
const registerUser = async (req, res, next) => {
  try {
    const { name, email, pass, pass2 } = req.body;
    if (!name || !email || !pass) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    if (pass.trim().length < 6) {
      return next(
        new HttpError("Password should be at least 6 characters", 422)
      );
    }

    if (pass != pass2) {
      return next(new HttpError("Password do not match", 422));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(pass, salt);

    const newUser = await User.create({
      name,
      email: newEmail,
      pass: hashedPass,
    });
    res.status(201).json(`New user ${newUser.email} registered`);
  } catch (error) {
    return next(new HttpError("User Registration Failed", 422));
  }
};

// ============================LOGIN A REGISTERED USER
// POST : api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();

    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Invaild credentials", 422));
    }

    const comparePass = await bcrypt.compare(pass, user.pass);
    if (!comparePass) {
      return next(new HttpError("Invalid credentials", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login failed. Please check your credentials", 422)
    );
  }
};

// ============================USER PROFILE
// GET : api/users/:id
// PROTECTED
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-pass");
    if (!user) {
      return next(new HttpError("User Not Found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// ============================GET AUTHORS
// GET : api/users
// UNPROTECTED
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-pass");
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// ============================CHANGE USER AVATAR (profile picture)
// POST : api/users/change-avatar
// PROTECTED
const changeAvatar = async (req, res, next) => {
  try {
    if (!req.files.avatar) {
      return next(new HttpError("Please choose an Image", 422));
    }

    // find user from database
    const user = await User.findById(req.user.id);

    // delete old avatar if exists
    if (user.avatar) {
      fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
        if (err) {
          return next(new HttpError(err));
        }
      });
    }

    const { avatar } = req.files;
    //check file size
    if (avatar.size > 3000000) {
      return next(
        new HttpError("Profile picture too big. Should be less than 3MB", 422)
      );
    }

    let fileName;
    fileName = avatar.name;
    let splittedFilename = fileName.split(".");
    let newFilename =
      splittedFilename[0] +
      uuid() +
      "." +
      splittedFilename[splittedFilename.length - 1];
    avatar.mv(
      path.join(__dirname, "..", "uploads", newFilename),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        }

        const updatedAvatar = await User.findByIdAndUpdate(
          req.user.id,
          { avatar: newFilename },
          { new: true }
        );
        if (!updatedAvatar) {
          return next(new HttpError("Avatar couldn't be changed", 422));
        }
        res.status(200).json(updatedAvatar);
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
};

// ============================EDIT USER DETAILS (from profile)
// POST : api/users/edit-user
// PROTECTED
const editUser = async (req, res, next) => {
  try {
    const { name, email, currPass, newPass, newConPass } = req.body;
    if (!name || !email || !currPass || !newPass) {
      return next(new HttpError("Fill in all fields", 422));
    }

    //get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User Not Found", 403));
    }

    //make sure new email doesn't already exist
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id != req.user.id) {
      return next(new HttpError("Email already exists", 422));
    }

    //compare current password to db password
    const validateUserPass = await bcrypt.compare(currPass, user.pass);
    if (!validateUserPass) {
      return next(new HttpError("Invalid current password", 422));
    }

    //compare new password with new confirm password
    if (newPass != newConPass) {
      return next(new HttpError("New passwords do not match", 422));
    }

    //hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPass, salt);

    //update user info in database
    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, pass: hash },
      { new: true }
    );
    res.status(200).json(newInfo);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
};
