import { Router } from 'express';

import { LogoutUser, registerUser } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';

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
    )

    router.route("/login").post(loginUser)

    // secured routes
    router.route("/logout").post( verifyjwt, LogoutUser)
export default router;
