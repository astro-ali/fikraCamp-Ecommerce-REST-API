import * as express from "express";
import UserController from "../../controllers/web/v1/user.controller";
import auth from "../../middlewares/web/auth";
import otp from "../../middlewares/web/otp";
import { User } from "../../src/entity/User";

const route = express.Router();

// register
route.post("/register", UserController.register);

// otp -> token + id + !isVerified
route.post("/otp", otp, UserController.checkOtp);

// login
route.get("/login", UserController.login);

//forget password and get the number first
route.get("/forget",UserController.forgetPassword);

// get the otp
route.post("/forget", UserController.getForgetPasswordOtp);

// set the new password
route.put("/forget", auth, UserController.setNewPassword);

// check if the user is logged in by check the token.
// every thing after this, the user should carray his token.
route.use(auth);

//rest password after logged in
route.put("/restPassword", UserController.restPassword);


// order AUTH

//

export default route;
