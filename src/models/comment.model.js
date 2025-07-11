import mongoose,{Schema} from "mongoose";

const commentScheme = new Schema({
    content:{
        type: String,
        required:[true,"content is required"],
        trim: true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Videos"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comment",commentScheme);