import mongoose,{ Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({
    content:{
        type: String,
        required: [true, "Content is required"],
        maxlength: [280, "Content cannot exceed 280 characters"]
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps: true});

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);