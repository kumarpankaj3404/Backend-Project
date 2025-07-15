import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJwt } from "../middleware/auth.middleware.js";
import { uploadVideo, changeThumbnail, changeVideoDetails } from "../controllers/video.controllers.js";

const router = Router();

router.route("/upload").post(
    verifyJwt,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },{
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
);

router.route("/change-thumbnail").patch(
    verifyJwt,
    upload.single("thumbnail"),
    changeThumbnail
);

router.route("/change-details").patch(
    verifyJwt,
    changeVideoDetails
);

