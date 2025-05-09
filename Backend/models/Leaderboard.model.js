import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
    localUsername: { 
        type: String, 
        required: true, 
        unique: true 
    },

    leetcodeUsername: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    
    codeforcesUsername: { 
        type: String, 
        unique: true, 
        sparse: true 
    },

    leetcodeStats: {
        totalSolved: { type: Number, default: 0 },
        contestRating: { type: Number, default: 0 }
    },

    codeforcesStats: {
        totalSolved: { type: Number, default: 0 },
        contestRating: { type: Number, default: 0 }
    },

    // Total problems solved across all platforms
    totalSolved: {
        type: Number,
        default: 0
    },

    // Maximum contest rating across all platforms
    maxContestRating: {
        type: Number,
        default: 0
    },

    // Reference to user (optional, for integration)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    }
}, { 
    timestamps: true,
    collection: 'leaderboards' // Explicitly set collection name
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export { Leaderboard }; 