import dotenv from "dotenv";
dotenv.config();

const {
  PORT,
  USER_DB,
  PASS_DB,
  SERVER_DB,
} = process.env

export default {
  port: PORT || 3000,
  databaseUrl: `mongodb+srv://${USER_DB}:${PASS_DB}@${SERVER_DB}.ugygvvt.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSpaceApps2025`,
}