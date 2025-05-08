import mongoose, { Schema } from 'mongoose';

const ResourceSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true }, // Firebase storage URL
    createdBy: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' }, // Ensure 'User' model exists
        username: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now },
    tags: { type: [String], required: true }
});

const Resource = mongoose.model("Resource", ResourceSchema);

export default Resource;