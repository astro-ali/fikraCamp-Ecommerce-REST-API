import { Request, Response } from "express";
import { Category } from "../../../src/entity/Category";
import { User } from "../../../src/entity/User";
import { okRes } from "../../../utility/util.service";

/**
 *
 */
export default class HomeController {
    /**
     * @param req 
     * @param res 
     * @returns 
     */
    static async getCategories(req :Request, res: Response):Promise<any> {
    let data: any;
    let users: any;
    // get the data from DB
    data = Category.find({
        where: { active: true },
        join: {
        alias: "category",
        leftJoinAndSelect: {
            subcategories: "category.subcategories",
            products: "subcategories.products",
        },
        },
    });

    users = User.find();
    [data, users] = await Promise.all([data, users]);
    return okRes(res, { data, users });
    }
}