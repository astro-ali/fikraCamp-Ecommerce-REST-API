require("dotenv").config();

export default {
  jwtUserSecret: process.env.JWT_USER_SECRET || "sheeeeeesh",
  jwtOtpSecret: process.env.JWT_OTP_SECRET || "looooooool",
  email: process.env.EMAIL,
  password: process.env.PASSWORD
};
