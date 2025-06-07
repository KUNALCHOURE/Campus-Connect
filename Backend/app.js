import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();



app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use('/uploads', express.static('uploads')); // Serve uploaded images



app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://campus-connect-eight-gray.vercel.app","https://campusconnect3.netlify.app"],  
    credentials: true                 // Allow cookies/tokens
  }));


import userrouter from './routes/user.routes.js';
import postrouter from './routes/post.routes.js';
import discussionrouter from './routes/discussion.routes.js';
import chatRouter from './routes/chatRoutes.js';
import roadmapRouter from './routes/roadmap.routes.js';
import profileRouter from './routes/profileroutes.js';
import leaderboardRouter from './routes/leaderboard.routes.js';

app.use("/api/v1/user",userrouter);
app.use("/api/v1/post",postrouter);
app.use("/api/v1/discussion",discussionrouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/roadmap", roadmapRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);


export default app;