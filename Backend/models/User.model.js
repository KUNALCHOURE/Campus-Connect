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
        default:"",
        required:[true,"password is required"],

    }

},{timestamps:true})


Userschema.pre('save',async function(next) {
    if(!this.isModified('password'))return next();
     
    this.password=await bcrypt.hash(this.password,10);
    next(); 
    
})



Userschema.methods.generateaccestoken=async function () {
    return jwt.sign(
        {
            _id:_id,
            email:this.email,
            username:this.username,

        }
        ,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        },

    )

    
}


Userschema.methods.generatErefreshtoken=async function () {
    return jwt.sign(
        {
            _id:_id,
        
        }
        ,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        },
        
    )

    
}
const user=new mongoose.model('user',Userschema);
export {user};
