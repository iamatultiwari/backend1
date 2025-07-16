 import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asynchandler"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"



export const verifyJWT = asyncHandler(async(red,res,next) => {
    try {
        const Token =req.cookies?.accessToken || requestAnimationFrame.header
        ("Authorization")?.replace("Bearer","")
    
    
    
    if(!token) {
        throw new ApiError(400,"Unothorized request")
    }
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    const user =  await User.findById(decodedToken?._id).select
     ("password -refressToken")
    
     if(!user) {
        throw new ApiError(401,"invaliod access token ");
        
     }
    
     req.user = user;
     next()// for next route.
    

    } catch (error) {
        throw new ApiError(404,error?.message ||
            "Invalid access token "
        )
        
    }
        })