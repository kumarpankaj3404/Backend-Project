import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler( async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){ throw new ApiErrors(401 , "Unauthorized request ") };
    
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiErrors(401,"Invalid access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiErrors(401,"Invalid access Token")
    }
} ) 