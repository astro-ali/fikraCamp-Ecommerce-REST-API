import { Response } from "express";
import CONFIG from "../config";
import * as nodemailer from "nodemailer";
import { Between } from "typeorm";
import { subDays } from "date-fns";
import { User } from "../src/entity/User";

/**
 * ReE
 * @param body
 */
const errRes = (res: Response, err, code = 400, key = "err") => {
  if (typeof err == "object" && typeof err.message != "undefined") {
    err = err.message;
  } else if (typeof err == "string") {
    let obj = {};
    obj[key] = [err];
    err = obj;
  }
  if (typeof code !== "undefined") res.statusCode = code;
  console.log(typeof err);
  return res.json({ status: false, errMsg: err });
};

/**
 * ReS
 * @param body
 */
const okRes = (res, data, code = 200) => {
  // Success Web Response
  let sendData = { status: true, errMsg: "" };

  if (typeof data == "object") {
    sendData = Object.assign(data, sendData); //merge the objects
  }
  if (typeof code !== "undefined") res.statusCode = code;
  return res.json(sendData);
};
// will generate you an otp number.
const getOtp = () => Math.floor(1000 + Math.random() * 9000);

const isNotANumber = (x: any) => {
  return x !== x;
} 

const sendEmail = async () => {
  // get the current date
  let currentdate = new Date();
  let threeHours: number = 3*60*60*1000; // 3 hours

  // get the date in GMT+3:00 format
  currentdate.setTime(currentdate.getTime() + threeHours);

  //get all users after a specific date.
  const lastDay = (date : Date) => Between(subDays(date, 1), date);
  let users: any;
  try {
    users = await User.find({ createdAt: lastDay(currentdate) });
  } catch (error) {
    return console.log(error);
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
    transporter.verify().then(console.log("sending..."));
  } catch (error) {
    return console.log(error);
  }

  var mailOptions = {
    from: 'Daily Report <ali.seemorad1144@yahoo.com>',
    to: 'ali.seemorad1177@gmail.com',
    subject: 'The number of customors',
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

  transporter.sendMail(mailOptions, function(error: any, info: any){
    if (error) {
      return console.log(error);
    } else {
      return console.log('Email sent: ' + info.response);
    }
  });
}

export { okRes, errRes, getOtp, isNotANumber, sendEmail };
