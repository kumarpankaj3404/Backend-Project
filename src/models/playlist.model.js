import mongoose,{ Schema } from "mongoose";

const playlistSchema = new Schema({
    name:{
        type: String,
        required: [true, "Playlist name is required"],
        trim: true,
        maxlength: [100, "Playlist name cannot exceed 100 characters"],

    },
    description:{
        type: String,
        trim: true,
    },
    videos:[{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true});

export const Playlist = mongoose.model("Playlist", playlistSchema);           