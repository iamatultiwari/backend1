import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/Apiresponse.js';
import { User } from '../models/user.model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken'

import dotenv from "dotenv";
dotenv.config();


// Utility: Generate Access and Refresh Tokens

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Error generating access and refresh token");
  }
};


// Controller:** Register a New User

const registerUser = asyncHandler(async (req, res) => {

  // steps - get user deatil from frontend
  //validation -not empty
  // check if user already exists - username,password
  //check for images,ckeck for avatar
  //create user obj create entry in db
  //remove password nd refreshtoken field from response
  //check for user creation 
  //return res


 const { fullName
, email, username, password } = req.body;
 //console.log("fullName",fullname);
//    res.status(200).json({
//   message:"ok"
//  })

  // Validate required fields
  if ([fullName, email, username, password].some(field => !field?.trim())) {
  throw new ApiError(400, "All fields are required");
}


  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // Extract file paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;//.files - from multer
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to Cloudinary
  const avatar = await uploadOncloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
  ? await uploadOncloudinary(coverImageLocalPath)
  : null;


  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username?.toLowerCase()

  });

  // Fetch user without sensitive info by mdb id as its default docs id 
  const createdUser = await User.findById(user._id).select
  ("-password -refreshToken");// ky ky nhi chahiye vo -

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
    //send new object  ApiResponse these fields -201, createdUser, 
  );
});


//**  Controller: Login User

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validate input
  if ((!email && !username) || !password) {
    throw new ApiError(400, "username or email and password are required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  // Fetch user without sensitive fields
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Cookie options
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful")
    );
});


// ** Controller: Logout User

const LogoutUser = asyncHandler(async (req, res) => {
  // Remove refreshToken from DB
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  };

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
})
// **  controller - for accessofrefreshtoken
const refreshAccessToken = asyncHandler(async(req,res) =>
  {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken 

  if (!incomingRefreshToken) {
    throw new ApiError(401,"unauthorized request ")
    
  }
 try {
   const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
    const user = await User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError(401,"INVALID REFRESH TOKEN ")
    }
     if (incomingRefreshToken !== user?.refreshToken) {
       throw new ApiError(401,"expired refresh token.")
       
     }
 //refershToken
     const options ={
       httpOnly:true,
       secure:true
     }
     const {accessToken,newRefreshToken
} =  await generateAccessAndRefreshToken(user._id)
 
     return res
    //  .status("accessToken",accessToken,options)
    //  .status("refreshToken",newRefreshToken,options)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
     .json(
       new Apiresponse(
         200,
         {accessToken,refreshAccessToken:newRefreshToken
},
         "access token refreshed succesfully"
       )
     )
 } catch (error) {
  throw new ApiError(401,error?.message || "Invalid refreshToken")
  
 }
})


// Export Controllers

export {
  registerUser,
  loginUser,
  LogoutUser,
  refreshAccessToken
};
