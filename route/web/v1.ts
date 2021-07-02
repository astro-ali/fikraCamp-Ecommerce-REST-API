import * as express from "express";
import UserController from "../../controllers/web/v1/user.controller";
import otp from "../../middlewares/web/otp";

const route = express.Router();

// reg
route.post("/register", UserController.register);
// otp -> token + id + !isVerified
route.post("/otp", otp, UserController.checkOtp);

// login

// order AUTH

//

export default route;
