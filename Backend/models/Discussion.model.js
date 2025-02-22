import mongoose from 'mongoose';

const DiscussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [
        {
            type: String
        }
    ],
    createdBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: {
            type: String
        }
    },
    comments: [
        {
            text: {
                type: String
            },
            createdBy: {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                username: {
                    type: String
                }
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });


const discussion =new mongoose.model('Discussion',DiscussionSchema);

export {discussion};