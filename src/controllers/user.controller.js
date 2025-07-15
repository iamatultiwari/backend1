import {asyncHandler } from '../utils/asynchandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOncloudinary} from '../utils/cloudinary.js';

 export const registerUser = asyncHandler ( async (req, res )=> {
  
    const { fullName, email, username, password } = req.body;

    if (
      [fullName,email,username,password].some((field) =>
         field?.trim() === "")
    ){
      throw new ApiError (400, "all fields are required")
    }

     const existedUser = User.findOne({
      $or:[{username}, {email}]
    })

    if(!existedUser){
      throw new ApiError(409, "user with email or username is already exist")
    }

     const avatarLocalpath = req.files?.avatar[0]?.path;
     const coverImageLocalpath =  req.files?.coverImage[0]?.path;

     if(!avatarLocalpath) {
      throw new ApiError(400, "avatar file is required")
     }

       const  avatar = await uploadOncloudinary(avatarLocalpath)
        const coverImage = await uploadOncloudinary(coverImageLocalpath)

        if(!avatar) {
                throw new ApiError(400, "avatar file is required")
        }
        const user = await User.create({
          fullName,
          avatar: avatar.url,
          coverImage:coverImage?.url || "",
          email,
          password,
          username:username.toLowercase()
        })

      const createdUsername =  await  User.findById(user._id).select(
        "-password -refreshToken"
      )
      if(!createdUser) {
        throw new ApiError(500, "something wend wromg while resistering the user ")
      }

      return res.status(201).json(
        new ApiResponse(200, createdUser, "user resistered succesfully")
      )


}
);
