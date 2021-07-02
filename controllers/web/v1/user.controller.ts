import { Request, Response } from "express";
import { User } from "../../../src/entity/User";
import * as validate from "validate.js";
import Validator from "../../../utility/validation";
import { errRes, getOtp, okRes } from "../../../utility/util.service";
import PhoneFormat from "../../../utility/phoneFormat.service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import CONFIG from "../../../config";

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
    let body = req.body;
    let otp = body.otp;
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
    // verify body

    // format number

    // get user from db by phone + isVerified

    // compaire the password

    // isVerified

    // token

    // return token
    return okRes(res, {});
  }
}
