import dotenv from "dotenv" 

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";


dotenv.config({ path: "./.env" });


connectDB()
.then(() => {
    application.listen(process.env.PORT ||  8000,() => {
        console.log(`server is running at port : $
            {process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed", err);
})