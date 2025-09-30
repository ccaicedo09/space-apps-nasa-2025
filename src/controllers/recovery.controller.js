import bcrypt from "bcrypt";
import config from "../config/config.js"
import User from "../models/user.model.js"
import sendEmail from "../utils/senderEmail.js";

export const recoverPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).send({ error: `No user found with email: ${email}` });

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.recoveryCode = recoveryCode;
    await user.save();

    await sendEmail({
      to: email,
      subject: "RecoveryCode - Reset Your Password - CodeFanatics",
      text: `Here is your recovery code to reset your password: ${recoveryCode}\n\nIf you didn’t request this, please ignore this message.`
    });
    res.status(200).send({ message: "Recovery code generated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred while generating recovery code" });
  }
}

export const setPassword = async (req, res) => {
  const { email, newPass, recoveryCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).send({ error: `No user found with email: ${email}` });

    if (user.recoveryCode !== recoveryCode) return res.status(401).send({ error: "Invalid recovery code!" });

    const passwordHashed = await bcrypt.hash(newPass, config.salt);
    user.pass = passwordHashed;
    user.recoveryCode = null;

    await user.save();

    res.status(200).send({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred while updating the password" });
  }
}