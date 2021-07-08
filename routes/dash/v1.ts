import * as express from "express";
import CategoryController from "../../controllers/dash/v1/category.controller";
import UserController from "../../controllers/dash/v1/user.controller";
const route = express.Router();

// get all users
route.get("/users", UserController.getAll);
// add new user
route.post("/users", UserController.add);
// edit user
route.put("/users/:id", UserController.edit);
// delete user
route.delete("/users/:id", UserController.delete);


// get all categories
route.get("/categories", CategoryController.getAll);
// add new category
route.post("/categories", CategoryController.add);
//edit category
route.put("/categories/:id", CategoryController.edit);
// delete category
route.delete("/categories/:id", CategoryController.delete);

// test job
route.get("/test", UserController.testJob);
//delete all users
route.get("/delete",UserController.deleteAllUsers);

export default route;
