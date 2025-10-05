import mongoose from "mongoose"
import config from "./config.js"

const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUrl);
    console.log("Connection is successfully!")
  } catch (error) {
    console.error(`An error ocurred in the dabase connection ${error}`);
    process.exit(1);
  }
}

export default connectDB