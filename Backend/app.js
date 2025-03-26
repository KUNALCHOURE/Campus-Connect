import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();



app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))



app.use(cors({
    origin: "http://localhost:5173",  // Allow Vite frontend
    credentials: true                 // Allow cookies/tokens
  }));


import userrouter from './routes/user.routes.js';
import postrouter from './routes/post.routes.js';
import discussionrouter from './routes/discussion.routes.js';

app.use("/api/v1/user",userrouter);
app.use("/api/v1/post",postrouter);
app.use("/api/v1/discussion",discussionrouter);





export default app;