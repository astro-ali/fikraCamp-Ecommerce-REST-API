import { Request, Response } from "express";
import { isEmpty } from "validate.js";
import { User } from "../../../src/entity/User";
import { errRes, okRes,isNotANumber } from "../../../utility/util.service";
import Validator from "../../../utility/validation";
import * as validate from "validate.js";

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
        name: "alwilus",
        phone: "sdslklkcvsdsds",
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
    return res.json(user);
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

        try {
          user = await User.findOne(id);
          if (!user) return res.json("not found");
          user.active = !user.active;
          await user.save();
        } catch (error) {
          return res.json(error);
        }
        return res.json(user);
      }
}
