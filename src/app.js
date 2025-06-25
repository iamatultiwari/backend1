import express from "express"
import cors from "cors"
import cokieParser from "cookie-parser"
const app = express()

app.use(cors( 
   {
    origin:process.env.CORS_ORIGIN,
    crredentials:true
   }
)) 
app.use(express.json({limit}))




export {app}