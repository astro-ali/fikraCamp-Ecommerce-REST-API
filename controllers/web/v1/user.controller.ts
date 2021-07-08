import { Request, Response } from "express";
import { User } from "../../../src/entity/User";
import * as validate from "validate.js";
import Validator from "../../../utility/validation";
import { errRes, getOtp, okRes } from "../../../utility/util.service";
import PhoneFormat from "../../../utility/phoneFormat.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import CONFIG from "../../../config";
import { trace } from "console";

export default class UserController {
  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async register(req: Request, res: Response): Promise<object> {
    // get the body
    const body = req.body;
    // validate the req
    let notValid = validate(body, Validator.register());
    if (notValid) return errRes(res, notValid);

    // format to the number
    let phoneObj = PhoneFormat.getAllFormats(body.phone);
    if (!phoneObj.isNumber)
      return errRes(res, `Phone ${body.phone} is not valid`);

    body.phone = phoneObj.globalP;
    let phone = phoneObj.globalP;

    // hash the password
    let salt = await bcrypt.genSalt(12);
    let password = await bcrypt.hash(body.password, salt);
    // create otp
    let otp = getOtp();
    body.password = password;
    body.otp = otp;

    // check if the user already exists
    let user;
    user = await User.findOne({ where: { phone } });
    // if exists but not verified
    if (user) {
      if (!user.isVerified) {
        Object.keys(body).forEach((key) => {
          user[key] = body[key];
        });
      } else return errRes(res, `User ${phone} is already exist`);
    } else {
      user = await User.create({
        name: body.name,
        phone: body.phone,
        password: body.password,
        birthDate: body.birthDate,
        otp: body.otp,
      });
    }
    // save the user
    await user.save();
    // send sms

    let token = jwt.sign({ id: user.id }, CONFIG.jwtUserSecret);
    // return res
    return okRes(res, { token });
  }


  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async checkOtp(req, res): Promise<object> {
    // get the otp from body
    let otp = req.body.otp;
    if (!otp) return errRes(res, `Otp is required`);
    // check if they are the same DB
    let user = req.user;

    // if not -> delete the otp from DB + ask user to try again
    if (user.otp != otp) {
      user.otp = null;
      await user.save();
      return errRes(res, "otp is incorrect");
    }
    // if yes -> isVerified = true
    user.isVerified = true;
    await user.save();
    // return res
    return okRes(res, { user });
  }

  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async login(req, res): Promise<object> {
    // get body
    let body = req.body;

    // validate body
    let notValid = validate(body, Validator.login());
    if (notValid) return errRes(res, notValid);

    // format number
    let phoneObj = PhoneFormat.getAllFormats(body.phone);
    if (!phoneObj.isNumber)
      return errRes(res, `Phone ${body.phone} is not a valid phone number`);
    
    body.phone = phoneObj.globalP;
    let phone = phoneObj.globalP;
    // get user from db by phone + isVerified
    let user;
    try {
      user = await User.findOne({ where: { phone, isVerified: true } });
    } catch (error) {
      return errRes(res, "didn't find your phone number");
    }

    // compaire the password
    let hash = user.password;
    let logged = await bcrypt.compare(body.password, hash);
    if(!logged) return errRes(res, "the password is not valid");
    // isVerified
    if(!user.isVerified) return errRes(res, "logged in but your account is not verified");

    // token
    let token = jwt.sign({ id: user.id }, CONFIG.jwtUserSecret);
    // return token
    return okRes(res, { token });
  }



  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   */
  static async restPassword(req, res): Promise<object> {
    // get the body
    let body = req.body;

    // validate the body
    let notValid = validate(body, Validator.rest());
    if (notValid) return errRes(res, notValid);

    // get the user form DB
    let user = req.user;

    // verify his current_password
    let hash = user.password;
    let match = await bcrypt.compare(body.password, hash);
    if(!match) return errRes(res, "the current password is not valid");

    //update his password and save it in DB
    let salt = await bcrypt.genSalt(12);
    let new_hashed_password = await bcrypt.hash(body.new_password, salt);
    user.password = new_hashed_password;
    await user.save();

    // return ok response
    return okRes(res, user);
  }


  /**
   * this handler only require a
   * phone number.
   * @param req : Request Object
   * @param res : Response Object
   * @returns : Response Object
   */
  static async forgetPassword(req, res): Promise<object> {
    // get the body
    let body = req.body;

    // validate the body containing only a number
    let notValid = validate(body, Validator.phone());
    if (notValid) return errRes(res, notValid);

    // format the number
    let phoneObj = PhoneFormat.getAllFormats(body.phone);
    if (!phoneObj.isNumber)
      return errRes(res, `Phone ${body.phone} is not a valid phone number`);
    let phone = phoneObj.globalP;

    // check the number if it's exists in DB & get the user
    // if the number is not valid return error to the client
    let user = await User.findOne({ where: { phone, isVerified: true, active: true } });
    if(!user) return errRes(res, "didn't find the user account");

    // overwrite the old otp with new one
    // store it in the DB
    let otp = getOtp();
    user.otp = otp;
    await user.save();

    // send the new one in sms message to the client 

    // create token with different secert key with user id as an identifer
    let token = jwt.sign({ id: user.id }, CONFIG.jwtOtpSecret);

    // return token
    return okRes(res, { token });
  }

  /**
   * check the otp if it match the otp in DB
   * @param req 
   * @param res 
   * @returns res: Response Object
   */
  static async getForgetPasswordOtp(req, res): Promise<object> {

    // get the body 
    let body = req.body;

    // validate the body
    let notValid = validate(body, Validator.otp());
    if (notValid) return errRes(res, notValid);

    // check the token and if it's mine then find the user in the DB
    let user: any;
    let payload: any;
    try {
      payload = jwt.verify(req.headers.token, CONFIG.jwtOtpSecret);

      user = await User.findOne(payload.id);
      // check user isVerified
      if (!user.active) return errRes(res, `${user.phone} is banned.`);
      if (!user.isVerified) return errRes(res, `Please go register and verify your account`);

    } catch (error) {
      return errRes(res, error);
    }

    // compare otp with the otp in the DB.
    let otp = req.body.otp;
    if(otp != user.otp) return errRes(res, "the otp didn't matched");
    // create login token
    let token = jwt.sign({ id: user.id }, CONFIG.jwtUserSecret);
    // reurn the login token
    return okRes(res, { token });
  }

  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   */
  static async setNewPassword(req, res): Promise<object> {
    // get the body
    let body = req.body;

    // validate the body
    let notValid = validate(body, Validator.password());
    if (notValid) return errRes(res, notValid);

    // hash and update the password
    let salt = await bcrypt.genSalt(12);
    let hash = await bcrypt.hash(body.password, salt);
    let user = req.user;
    user.password = hash;
    await user.save();

    // return ok 
    return okRes(res, { user });
  }
}
