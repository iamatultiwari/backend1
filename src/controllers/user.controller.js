import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';


//  Utility: Generate Access and Refresh Tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    // 1. Find the user by ID
    const user = await User.findById(userId);

    // 2. Generate tokens using user instance methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 3. Save refreshToken to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 4. Return both tokens
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Error generating access and refresh token");
  }
};



//  * Controller: Register a New User

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // 1. Check if any field is empty
  if ([fullName, email, username, password].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Check if email or username already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // 3. Get file paths for uploaded avatar and cover image
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 4. Upload images to Cloudinary
  const avatar = await uploadOncloudinary(avatarLocalPath);
  const coverImage = await uploadOncloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // 5. Create the user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  // 6. Fetch user info without password or refresh token
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 7. Respond with success
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});



// **  Controller: Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // 1. Validate input
  if ((!email || !username) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }

  // 2. Find user by email or username
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 3. Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  // 5. Fetch user info without password/refresh token
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // 6. Set secure cookies (optional: refresh token stored in cookie)
  const options = {
    httpOnly: true,  // cannot access via JavaScript
    secure: true     // only sent over HTTPS
  };

  // 7. Send response with token and user info
  return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful")
    );
})

 const LogoutUser = await asyncHandler(async (req,res) =>{
  
  user.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
   const options = {
    httpOnly: true,
    secure: true 
  }
  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200,{}, "User logged Out "))


})





// Exporting Controllers
export {
  registerUser,
  loginUser,
  LogoutUser
};
