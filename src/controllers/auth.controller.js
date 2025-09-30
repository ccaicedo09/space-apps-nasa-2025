import bcrypt from "bcrypt";
import config from "../config/config.js"
import User from "../models/user.model.js"
import userModel from "../models/user.model.js";

export const register = async (req, res) => {
  const { email, pass } = req.body;

  const passwordHashed = await bcrypt.hash(pass, config.salt);
  let passHashed = passwordHashed;

  try {
    const userSaved = await User.findOne({ email });

    if (userSaved) return res.status(409).send(`This email: ${email} is already associated with an existing account!`);

    const newUser = new User({
      email,
      pass: passHashed
    });

    await newUser.save();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error is happened to save user" });
  }

  res.status(201).send({ message: "register successfully!" });
}

export const login = async (req, res) => {
  let userSaved = undefined;
  const { email, pass } = req.body;

  console.log(`User try access with email:${email} pass:${pass}`);

  try {
    userSaved = await User.findOne({ email });

    if (!userSaved) return res.status(404).send(`User not founded with email: ${email}`);

    const isMatch = await bcrypt.compare(pass, userSaved.pass);

    if (!isMatch) return res.status(401).send({ error: "Incorrect password!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error is happened to login!" });
  }
  userSaved.recoveryCode = null;
  userSaved.save();

  res.cookie("_id_user", userSaved._id, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24  // 24h
  });

  res.send({ message: "login successfully!" })
}

export const logout = (req, res) => {
  res.clearCookie("_id_user");
  res.send({ message: "logout successfully!" });
}