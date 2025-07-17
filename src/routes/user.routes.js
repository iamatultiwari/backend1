import { Router } from 'express';

import { LogoutUser, registerUser, loginUser,refreshAccessToken } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middlewre.js'; 

const router = Router();

// Route: POST /api/users/register
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
);

// Route: POST /api/users/login
router.route("/login").post(loginUser);

// Secured Route: POST /api/users/logout
router.route("/logout").post(verifyJWT, LogoutUser);

router.route("/refresh-token").post(refreshAccessToken)

export default router;

