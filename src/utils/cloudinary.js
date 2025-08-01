import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //Upload File on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //File uploaded successfully
        console.log("File is uploaded in cloudinary",response);
        fs.unlinkSync(localFilePath); //To remove file locally saved in server when operation gets failed
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //To remove file locally saved in server when operation gets failed
        return null;
    }
}

export {uploadOnCloudinary}


