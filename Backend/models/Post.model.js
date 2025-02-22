import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    createdBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        username: {
            type: String
        }
    },

    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        text: {
            type: String
        },
        createdBy: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            username: {
                type: String
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const post=new mongoose.model('post',PostSchema);
export {post};