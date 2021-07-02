require("dotenv").config();

export default {
  jwtUserSecret: process.env.JWT_USER_SECRET || "shhh",
};
