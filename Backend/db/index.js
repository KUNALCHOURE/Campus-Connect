import mongoose from "mongoose";
import dotenv from"dotenv";

dotenv.config();
const connectdb=async()=>{
  try{
    let res= await mongoose.connect(`${process.env.MONGODB_URL}`);
    if(res) console.log("Database connected");

  }
  catch(e){
    console.error("fail to connect to db",e);
  }
}

export default connectdb;