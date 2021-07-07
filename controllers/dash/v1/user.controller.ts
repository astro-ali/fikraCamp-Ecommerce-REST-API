import { Request, Response } from "express";
import { isEmpty } from "validate.js";
import { User } from "../../../src/entity/User";
import { errRes, okRes,isNotANumber } from "../../../utility/util.service";
import Validator from "../../../utility/validation";
import * as validate from "validate.js";
import { Between } from "typeorm";
import { addDays, addYears, subDays } from "date-fns";
import * as nodemailer from "nodemailer";
import CONFIG from "../../../config";

export default class UserController {

  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async getAll(req: Request, res: Response): Promise<object> {
    // get the queries
    let query = req.query;
    let page: any = query.page;
    let perPage: any = query.perPage;

    // get all the users form DB
    const users = await User.find({ where: { active: true } });

    // check if the query is empty and if it ture retuen all users
    if(isEmpty(query)) return okRes(res, { users });

    // check if the values are numbers or not
    let numPage: number = parseInt(page);
    let numPerPage: number = parseInt(perPage);
    if(isNotANumber(numPage)){
      return errRes(res, "query params are not a number");
    }

    // check if the query contain the page
    if(page == null) return okRes(res, { users });

    // check if the value of page query is 0.
    if(page == '0') return okRes(res, { users });

    // get the query params
    let realPage: number;
    let realTake: number;

    if(perPage) realTake = +perPage;
    else {
      perPage = '2';
      realTake = 2;
    }

    // check if the user passed a page
    if(page) realPage = +page === 1 ? 0 : (+page - 1) * realTake;
    else {
      realPage = 0;
      page = '1';
    }
    // get the data paginated form DB
    const findOptions = {
      take: realTake,
      skip: realPage
    }
    let data: any = await User.find(findOptions);
    if(data.length === 0) return errRes(res, "there is no more data", 404);
    

    return okRes(res, {
      data,
      perPage: realTake,
      page: +page || 1,
      next: `http://localhost:3000/dash/v1/users?perPage=${realTake}&page=${+page + 1}`,
      prev: `http://localhost:3000/dash/v1/users?perPage=${realTake}&page=${+page - 1}`

    });
  }



  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async add(req: Request, res: Response): Promise<object> {
    let user: any;
    try {
      user = User.create({
        name: "man",
        phone: "sdslklsdfhellodf",
        password: "$2a$12$Y4HL/V2hY1VOxMJBuD3DI.YFn6sv6/dgA8yt.u76y6dIcoyXiv10G",
        isVerified: true,
        otp: 1224,
        isBuyer: true,
        birthDate: "2021/01/01",
      });

      await user.save();
    } catch (error) {
      return errRes(res, error);
    }
    return okRes(res, { user })
  }


  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async edit(req: Request, res: Response): Promise<object> {
    const id = req.params.id;
    let user;

    try {
      user = await User.findOne(id);
      if (!user) return res.json("not found");
      user.name = "edited";
      await user.save();
    } catch (error) {
      return res.json(error);
    }
    
    return okRes(res, { user });
  }


  /**
   *
   * @param req
   * @param res
   * @returns
   */
  static async delete(req: Request, res: Response): Promise<object> {
    const id = req.params.id;
    let user;
    // delete the user by deative it.
    try {
      user = await User.findOne(id);
      if (!user) return res.json("not found");
      user.active = !user.active;
      await user.save();
    } catch (error) {
      return res.json(error);
    }

    return okRes(res, { user });
  }

  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   */
  static async testJob(req: Request, res: Response):Promise<any> {
    // get the current date
    let currentdate = new Date();
    let threeHours: number = 3*60*60*1000; // 3 hours
    currentdate.setTime(currentdate.getTime() + threeHours);
    //get all users after a specific date.
    const lastDay = (date) => Between(subDays(date, 1), date);
    let users: any;
    try {
      users = await User.find({ createdAt: lastDay(currentdate) });
    } catch (error) {
      return errRes(res, error);
    }

    // send the data via email
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 465,
      service:'yahoo',
      secure: false,
      auth: {
          user: CONFIG.email,
          pass: CONFIG.password
      },
      debug: false,
      logger: true
    });

    // test connection with the smtp server.
    try {
      transporter.verify().then(console.log);
    } catch (error) {
      return console.log(error);
    }

    var mailOptions = {
      from: 'Daily Report <ali.seemorad1144@yahoo.com>',
      to: 'ali.seemorad1177@gmail.com',
      subject: 'The number of users',
      text: "hello Boss",
      html:`
      <html>
      <body style="margin:0;padding:0; font-family: sans-serif; padding: 0; margin: 0;">
          <div style="background:rgb(228, 228, 228); max-width: 1000px; height: 850px; position: relative;">
              <div style="background: #fafafa; position: absolute; top: 50%; left: 50%;transform: translate(-50%,-50%);
              height: auto; width: 450px; border-radius: 20px; box-shadow: 0 12px 22px 0 rgb(0, 0, 0, 25%);">
                  <div style="background: rgb(192, 0, 74); text-align: center; height: 100px; border-radius: 20px 20px 0px 0px;">
                      <h2 style="color: #fff; margin: 0; line-height: 100px; font-size: 30px; font-weight: 900;">Daily Report</h2>
                  </div>
                  <div style="padding:0 20px">
                      <h2 style="color: rgb(0, 0, 0); padding-top: 60px; margin: 0px;">Good Morning sir 😊</h2>
                      <div style="color: rgb(0, 0, 0); padding-top: 50px; font-size: 18px;">This is a Daily report and it will be sent every 24 hour.</div>
                      <p style="font-size: 18px; padding-top: 30px;">The number of customers in the last 24 hours is ${ users.length }.</p>
                      <div style="color: rgb(0, 0, 0); padding-top: 60px; font-size: 18px; padding-bottom: 40px;">Best Regrads.</div>
                      <div style="padding-bottom: 40px; text-align: center;">
                          <a  target="_blank" style="text-decoration: none; color: white; background: rgb(192, 0, 74);
                          text-align: center; padding:16px 22px; border-radius: 8px;" href="http://localhost:3000/dash/v1/delete">delete all users</a>
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
      `
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });


    // return ok res with users
    return okRes(res, { users });
  }

  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   */
  static async deleteAllUsers(req: Request, res: Response):Promise<any> {
    // get the users form DB
    let users: any;
    try {
      users = await User.find({ where:{ active: true } });
      if(!users) return res.send("<h3>404 not found</h3>");
    } catch (error) {
      return res.send(`<h3>404 not found</h3>
      <p>${error}</p>`); 
    }
    // delele them
    for (const user of users) {
      if(user.active === true){
        user.active = !user.active;
        await user.save()
      }
      else {
        continue;
      }
    }

    // return h3 tag the a message to the boss.
    return res.send("<h1>Successfully deleted all users</h1>");
  }

}

