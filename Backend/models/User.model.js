import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Userschema=new mongoose.Schema({
    
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,    
    },
    profileimage:{
        type:String,
        required:[true,"password is required"],

    }

},{timestamps:true})


Userschema.pre('save',async function(next) {
    if(!this.isModified('password'))return next();
     
    this.password=await bcrypt.hash(this.password,10);
    next(); 
    
})

const user=new mongoose.model('user',Userschema);
export {user};
