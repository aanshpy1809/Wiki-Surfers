import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary";

export const update=async(req,res)=>{
    let {profileImg}=req.body;
    const userId=req.user._id;
    
    try {
        let user=await User.findById(userId);

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
            }
            const uploadedResponse=await cloudinary.uploader.upload(profileImg);
            profileImg=uploadedResponse.secure_url;
        }
        

        
        user.profileImg=profileImg || user.profileImg;
        await user.save();
        res.status(201).json({message: "Profile pic updated successfully"});

    } catch (error) {
        console.log("Error in updateUser controller", error.message);
		res.status(500).json({ error: error.message});
    }
}