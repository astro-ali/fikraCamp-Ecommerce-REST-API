import { Request, Response } from "express";
import { BlockList } from "net";
import validate = require("validate.js");
import { Category } from "../../../src/entity/Category";
import { errRes, okRes } from "../../../utility/util.service";
import Validator from "../../../utility/validation";

export default class CategoryController {

    /**
     * @param req 
     * @param res 
     */
    static async getAll(req: Request, res: Response): Promise<any> {

        // get all categories form DB.
        const categories = await Category.find({ where: { active: true } });
        if(!categories) return errRes(res, "not found");

        // return categories.
        return okRes(res, { categories });
    }

    /**
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    static async add(req: Request, res: Response): Promise<any> {
        //get the body
        let body: any = req.body;

        // validate the body
        let notValid: any = validate(body, Validator.category());
        if (notValid) return errRes(res, notValid);

        // create new category object.
        let category: any;
        try {
            category = Category.create({
                name: body.name,
                nameAr: body.nameAr
            });
            // save it in DB
            await category.save();
        } catch (error) {
            return errRes(res, { error });
        }
        //return ok res
        return okRes(res, { category });
    }

    /**
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    static async edit(req: Request, res: Response): Promise<any> {
        
        // get the body & the id
        let body: any = req.body;
        let id: any = req.params.id;
        if(!id) return errRes(res, "please specify an id", 400);

        // validate the body 
        let notValid: any = validate(body, Validator.category(false));
        if (notValid) return errRes(res, notValid);

        //get the category form DB by id & return err res if id does not exists.
        let category: any;
        try {
            category = await Category.findOne({ where: { id, active: true } });
            if(!category) return errRes(res, "category not found", 404, "error");
        } catch (error) {
            return errRes(res, "category not found", 404); 
        }
        // edit the category object and save it in DB
        for (const key in body) {
            if(key in category) category[key] = body[key];
            else continue;
        }
        category.save();

        // return ok res
        return okRes(res, { category });
    }

    /**
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    static async delete(req: Request, res: Response):Promise<any> {
        // get the id form params 
        let id = req.params.id;

        // delete the category by deactivate it.
        let category: any;
        try {
            category = await Category.findOne(id);
            if(!category) return errRes(res, "not found");
            if(category.active === false) return errRes(res, "it's got deleted", 404);
            category.active = !category.active;
            await category.save();
        } catch (error) {
            return errRes(res, { error });
        }

        // return okRes
        return okRes(res, { category });
    }

}