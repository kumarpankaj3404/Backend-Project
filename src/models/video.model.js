import mongoose,{Mongoose, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
        videoFile:{
            type: String, // Cloudinary URL
            required: [true, "Video file is required"]
        },
        thumbnail:{
            type: String, // Cloudinary URL
            required: [true, "Thumbnail is required"]
        },
        title:{
            type: String,
            required: [true, "Title is required"]
        },
        description:{
            type: String,
            required: [true, "Description is required"]
        },
        duration:{
            type: Number,   // Duration in seconds
            required: [true, "Duration is required"]
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            required: [true, "Owner is required"]
        },

    },
    {timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = Mongoose.model("Video",videoSchema)