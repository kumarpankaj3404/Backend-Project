import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false});

        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiErrors(500,"Something went wrong while generating access or refreshToken");
    }
}

const registerUser = asyncHandler( async (req,res) => {
    // GEt user data from frontend 
    //validate - non empty
    //check if user exists : username or email
    // check image, check for avatar
    //upload image to cloudinary , again check avatar uploaded
    //create user obj - createentry db
    //remove pass and RefreshToken from res
    //check if user created
    //send res - from utils

    const {username , email, fullName , password} = req.body
    //console.log(email);

    if(
        [fullName ,email,username,password].some((fields) => fields?.trim() === "")
    ){
        throw new ApiErrors(400 , "All neccessary fields are required to register User");
    }

    const userExists = await User.findOne({
        $or : [{email}, {username}]
    })
    
    if(userExists){
        throw new ApiErrors(400, "Email or username already exists");
    }

    const avatarPath = req.files?.avatar[0]?.path;
    //const coverPath = req.files?.coverImage[0]?.path;
    let coverPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverPath = req.files.coverImage[0].path;
    }

    if(!avatarPath){
        throw new ApiErrors(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    const coverImage = await uploadOnCloudinary(coverPath);

    if(!avatar){
        throw new ApiErrors(400,"Avatar file is required");
    }

    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiErrors(500,"Something went wrong registering user")
    }

    return res.status(200).json(
        new ApiResponse(200,userCreated,"User Created Successfully")
    )

})

const loginUser = asyncHandler( async (req,res) => {
    // req-> body.data
    // take username or email
    // find if user / email
    // check pass
    // accesss and refToken
    // send cookie

    const {username,password,email} = req.body 

    console.log(email);
    
    
    if(!(username || email)){
        throw new ApiErrors(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){throw new ApiErrors(404,"User does'nt exist ")}

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!password){
        throw new ApiErrors(401,"Invlaid credential destails");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },{
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiErrors(401,"Unauthorized Refresh Token Request")
    }

    try {
        const decodeToken = jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodeToken?._id);
    
        if(!user){
            throw new ApiErrors(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiErrors(401,"Refresh Token is expired or already used")
        }
    
        const options={
            httpOnly:true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user?._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "Access Token Refreshed Successfully"
            )
        )
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Refresh Token")
    }



})

const changePassword = asyncHandler(async (req,res) => {

    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){throw new ApiErrors(401,"Invalid old password")}

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password saved successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"User fetched successfully")
    )
})

const updateAccountDetails = asyncHandler( async (req,res)=>{
    const {fullName,email} = req.body 
    
    if(!fullName || !email){
        throw new ApiErrors(401,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email : email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account updated successfully")
    )
})

const updateUserAvatar = asyncHandler( async (req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){throw new ApiErrors(400,"Avatar file not found")}

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){throw new ApiErrors(500,"Avatar file not uploaded in avatar")}

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "Avatar image changed successfully"
        )
    )
})

const updateUserCoverImage = asyncHandler( async (req,res)=>{
    const coverLocalPath = req.file?.path
    if(!coverLocalPath){throw new ApiErrors(400,"Cover Image file not found")}

    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if(!coverImage.url){throw new ApiErrors(500,"Cover Image file not uploaded in avatar")}

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "Cover  image changed successfully"
        )
    )
})

const getUserChannelProfile = asyncHandler( async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiErrors(400,"Invalid username / username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id , "$subscribers.subscriber" ]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel.length){throw new ApiErrors(404,"The channel does not exist")}

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler( async (req,res) => {
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetch successfully"
        )
    )
})


export {
    registerUser,
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
}