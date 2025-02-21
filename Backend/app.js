import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();


app.use(cors());
app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

import userrouter from './routes/user.routes.js';

app.use("/api/v1/user",userrouter);




export default app;