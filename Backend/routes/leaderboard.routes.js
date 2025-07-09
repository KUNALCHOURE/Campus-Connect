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


router.get('/solved', getSolvedLeaderboard);

router.get('/contest', getContestLeaderboard);

router.post('/refresh', verifyjwt, refreshLeaderboard);

router.post('/sync', verifyjwt, syncUsersToLeaderboard);

router.post('/update-user', verifyjwt, updateUserStats);

router.post('/update-all', verifyjwt, updateAllUserStats);

router.post('/test-scrapers', verifyjwt, testScrapers);

router.post('/test-url-extraction', verifyjwt, testUrlExtraction);

export default router; 