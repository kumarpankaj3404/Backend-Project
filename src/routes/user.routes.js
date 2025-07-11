import { Router } from "express"
import { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory 
} from "../controllers/user.controllers.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount : 1
        },{
            name: "coverImage",
            maxCount: 1
        }
    ]) ,
    registerUser
);

router.route("/login").post(upload.none(),loginUser);

// Secure Route
router.route("/logout").post( verifyJwt,logoutUser);

router.route("/refreshToken").post(verifyJwt,refreshAccessToken)

router.route("/change-password").post(upload.none(),verifyJwt,changePassword)

router.route("/current-user").get(verifyJwt,getCurrentUser)

router.route("/update-account").patch(upload.none(),verifyJwt,updateAccountDetails)

router.route("/change-avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)

router.route("/change-coverImage").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJwt,getUserChannelProfile)

router.route("/history").get(verifyJwt,getWatchHistory)




export default router