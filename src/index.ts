import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import * as express from "express";
const app = express();
import dashv1 from "../route/dash/v1";

const port = process.env.PORT || 3000;

createConnection()
  .then(async (connection) => {
    app.use("/dash/v1", dashv1);
    app.listen(port, () => console.log(`Running on ${port}`));
  })
  .catch((error) => console.log(error));
