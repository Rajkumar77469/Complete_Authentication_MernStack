import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import userModel from '../models/userModel.js';
import transporter from '../conifg/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../conifg/emailtemplets.js';



export const register=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.json({success:false,message:'Missing Detials'})
    }

    try {
    const existingUser=await userModel.findOne({email})
    if(existingUser){
        return res.json ({success:fals,message:"User already exists"});
    }

       const hashedpassword=await bcrypt.hash(password,10);
       const user=new userModel({name,email,password:hashedpassword});

       await user.save();

       const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

       res.cookie('token',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite: process.env.NODE_ENV==='production' ? 'none':'strict',
        maxAge:7 * 24 * 60 * 60 * 1000
       });

//sending welcome email

       const  mailOptions={
        from:process.env.SENDER_EMAIL,
        to:email,
        subject:'welcome to Rajput',
        text:`Welcome to Rajput website.Your account has been created with email id: ${email}`
       }

  await transporter.sendMail(mailOptions);

       return res.json({success:true});
        
    } catch (error) {
       return res.json({success:false,message:error.message})
    }
}


export const login=async (req,res)=>{
    const {email,password}=req.body;

 if(!email || !password){
    return res.json({success:false,message:'Missing Detials'})
 }

try {
    const user=await userModel.findOne({email});

    if(!user)
    {
        return res.json({success:false,message:'invalid email'});
    }

    const isMatch=await bcrypt.compare(password,user.password)

    if(!isMatch)
    {
        return res.json({success:false,message:'invalid password'});
    } 
    

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

    res.cookie('token',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite: process.env.NODE_ENV==='production' ? 'none':'strict',
     maxAge:7 * 24 * 60 * 60 * 1000
    });


    return res.json({success:true});
    
    
    }

 catch (error) {
    return  res.json({uccess:false,message:error.message})
}

}



export  const logout= async(req,res)=>{
    try {
       
        res.clearCookie('token',
            {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite: process.env.NODE_ENV==='production' ? 'none':'strict', 
        })

        return res.json({success:true,message:"Logged Out"})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}


export const sendVerifyOtp=async(req,res)=>{
    try {
        
const {userId}= req.body;
const user= await userModel.findById(userId);

if(user.isAccountVerified){
    return res.json({success:false,message:"Account Already Verified"})

}

const otp=String(Math.floor(100000 + Math.random() * 900000))
user.verifyOtp=otp;
user.verifyOtpExpireAt = Date.now() + 24 *60 * 60 * 1000;

await user.save();
const mailOptions = {
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:'Account Verification OTP',
   // text:`Your OTP is ${otp}. Verify your account using this OTP.`,
    html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
   
}
await transporter.sendMail(mailOptions);
res.json({success:true,message:'Verification OTP Sent on Email'});



    } catch (error) {
        return res.json({success:false,message:error.message}) 
    }
}
//verify email using otp

export const verifiyEmail=async(req,res)=>{
    const {userId,otp}=req.body;

    if(!userId || !otp ){
        return res.json({success:false,message:'Missing Detials'})
    };

    try {
        

        const user= await userModel.findById(userId);
        if(!user){
            return res.json({success:false,message:'User not found'});

        } 
    if(user.verifyOtp==='' ||  user.verifyOtp!=otp){
        return res.json({success:false,message:'Invalid OTP'});   
    }

if(user.verifyOtpExpireAt<Date.now())
{
    return res.json({success:false,message:'Otp Expired'});
}


user.isAccountVerified=true;
user.verifyOtp='';
user.verifyOtpExpireAt=0;


await user.save();
return res.json({success:true,message:'Email Verified Successfully'})


    } catch (error) {
       
        return res.json({success:false,message:error.message}) 
    }
}


//check if user is authenticated

export const isAuthenticated=async(req,res)=>{

    try {
       
        return res.json({success:true});
    } catch (error) {
        return res.json({success:false,message:error.message}) 
    }
}

//send password reset otp

export const sendResetOtp=async(req,res)=>{
    const {email}=req.body;

    if(!email){
        return res.json({success:false,message:"Email is requied"});
    }



try {
    const user=await userModel.findOne({email});
  if(!user)
  {
    return res.json({success:false,message:"user not found"});

  }
const otp=String(Math.floor(100000 + Math.random() * 900000))
user.resetOtp=otp;
user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;


await user.save();
const mailOptions = {
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:'Password Reset OTP',
   // text:`Your OTP for resetting your password is ${otp}. Use this OTP to proced with reseting your password.`,
    html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
   
}
await transporter.sendMail(mailOptions);
res.json({success:true,message:'OTP Sent to Email'});



} catch (error) {
  
    return res.json({success:false,message:error.message}) 
}



}


//Reset user password

export const resetPassword=async (req,res)=>{

const{email,otp,newPassword}=req.body;

if(!email || !otp || !newPassword)
{
   return res.json({success:false,message:'Email,OTP,and newPassword are requierd'}); 
}

try {
 const user=await userModel.findOne({email});
 if(!user)
    {
      return res.json({success:false,message:"user not found"});
  
    }
    if(user.resetOtp==="" || user.resetOtp!==otp)  {
        return res.json({success:false,message:"INvalid otp"})
    }

    if(user.resetOtpExpireAt<Date.now()){
        return res.json({success:false,message:'OTP Expired'})  
    }

  const hashedpassword= await bcrypt.hash(newPassword,10);
  user.password=hashedpassword;
  user.resetOtp='';
  user.resetOtpExpireAt=0;
  
  await user.save();
  
  return res.json({success:true,message: 'Password has been reset successfully'});


} catch (error) {
    return res.json({success:false,message:error.message}) 
}

}