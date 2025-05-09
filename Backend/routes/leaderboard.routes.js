import express from 'express';
import { 
    updateUserStats, 
    getSolvedLeaderboard, 
    getContestLeaderboard,
    updateAllUserStats,
    syncUsersToLeaderboard,
    testScrapers,
    refreshLeaderboard,
    testUrlExtraction
} from '../controllers/leaderboardController.js';
import { verifyjwt } from '../middlewares/authmiddleware.js';

const router = express.Router();

/**
 * @route   GET /leaderboard/solved
 * @desc    Get leaderboard sorted by total problems solved
 * @query   platform=leetcode | codeforces (optional filter)
 * @access  Public
 */
router.get('/solved', getSolvedLeaderboard);

/**
 * @route   GET /leaderboard/contest
 * @desc    Get leaderboard sorted by contest rating
 * @query   platform=leetcode | codeforces (optional filter)
 * @access  Public
 */
router.get('/contest', getContestLeaderboard);

/**
 * @route   POST /leaderboard/refresh
 * @desc    Manually refresh the leaderboard data from scrapers
 * @access  Private
 */
router.post('/refresh', verifyjwt, refreshLeaderboard);

/**
 * @route   POST /leaderboard/sync
 * @desc    Sync all users with competitive links from the user collection to the leaderboard
 * @access  Private
 */
router.post('/sync', verifyjwt, syncUsersToLeaderboard);

/**
 * @route   POST /leaderboard/update-user
 * @desc    Create or update a user in the leaderboard database
 * @access  Private
 */
router.post('/update-user', verifyjwt, updateUserStats);

/**
 * @route   POST /leaderboard/update-all
 * @desc    Update stats for all users in the leaderboard
 * @access  Private - Admin only
 */
router.post('/update-all', verifyjwt, updateAllUserStats);

/**
 * @route   POST /leaderboard/test-scrapers
 * @desc    Test scraper functionality with provided usernames
 * @access  Private
 */
router.post('/test-scrapers', verifyjwt, testScrapers);

/**
 * @route   POST /leaderboard/test-url-extraction
 * @desc    Test URL extraction functionality
 * @access  Private
 */
router.post('/test-url-extraction', verifyjwt, testUrlExtraction);

export default router; 