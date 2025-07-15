import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const{ title,description,duration,isPublished } = req.body;
    if(!title || !description || !duration) {
        throw new ApiErrors(400, "Title, description and duration are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    if(!videoFileLocalPath) {
        throw new ApiErrors(400, "Video file is required");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if(!thumbnailLocalPath) {
        throw new ApiErrors(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath, "video");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");
    if(!videoFile || !thumbnail) {
        throw new ApiErrors(500, "Failed to upload video or thumbnail");
    }

    const owner = req.user._id;

    const newVideo = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration,
        isPublished,
        owner
    });

    const videoCreated = await Video.findById(newVideo._id);

    if(!videoCreated) {
        throw new ApiErrors(500, "Failed to create video");
    }

    return res
    .status(201)
    .json(new ApiResponse(200,videoCreated,"Video uploaded successfully"));

})

const changeThumbnail = asyncHandler(async (req,res) =>{

    const videoId  = req.body?.videoId;
    if(!videoId) {throw new ApiErrors(400, "Video ID is required")}

    const thumbnailLocalPath = req.file?.path;
    if(!thumbnailLocalPath) {throw new ApiErrors(400, "Thumbnail is required")}

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");
    if(!thumbnail) {throw new ApiErrors(500, "Failed to upload thumbnail")}

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail: thumbnail.url
            }
        },
        {new: true}
    )

    if(!video) {throw new ApiErrors(404, "Video not found")}

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Thumbnail changed successfully"));

})

const changeVideoDetails = asyncHandler(async (req, res) => {
    const {videoId, title,description} = req.body;
    if(!videoId || !title || !description){ throw new ApiErrors(400, "Video ID, title and description are required")}

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description
            }
        },
        {new: true}
    );
    if(!video) {throw new ApiErrors(404, "Video not found")}

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"));

})

const changeAccess = asyncHandler(async (req, res) => {
    
})

export {
     uploadVideo,
     changeThumbnail,
     changeVideoDetails,
    };