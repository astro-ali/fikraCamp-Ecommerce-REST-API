import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import * as express from "express";
const app = express();
import dashv1 from "../routes/dash/v1";
import webv1 from "../routes/web/v1";
import notFound from "../middlewares/web/notFound";
import { sendEmail } from "../utility/util.service";
const cron = require('node-cron');

const port = process.env.PORT || 3000;

createConnection()
  .then(async (connection) => {
    console.log("connecting the the database...");
    app.use(express.json());
    app.use("/v1", webv1);
    app.use("/dash/v1", dashv1);
    app.use(notFound);
    cron.schedule('0 9 * * *', sendEmail, { scheduled: true, timezone: "Asia/Baghdad" }); // will send emial at 9:00
    app.listen(port, () => console.log(`Running on localhost:${port}`));
  })
  .catch((error) => console.log(error));
