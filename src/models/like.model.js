import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    comoment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBY:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }
},{timestamps: true});

export const Like = mongoose.model("Like", likeSchema);