const express = require('express');
const User = require('../models/user.modle');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

//Register
router.post("/register", async(req,res)=>{
    try{
        const{name,email,password} = req.body;

        //check if user already exists
        const UserExists = await User.findOne({email});
        if(UserExists){
            return res.status(400).json({message:"User already existe"});
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create uer 
         const user = await User.create({
            name,
            email,
            password: hashedPassword,
         });

         res.status(201).json({
            message: "user registered successfully",
            userId: user._id,
         });
        }

        catch(error){
            res.status(500).json({message:"Server error", error: error.message});

        }
});


//login

router.post("/login", async(req,res)=>{
    try{
        const {email,password} = req.body;

        //check if user exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"invalid creadentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:" invalide credentials"});
        }

        //generate jwt token

        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        res.json({
            message:" login successful",
            token,
        });
    } catch(error){
        res.status(500).json({message:error.message});
    }
});

module.exports = router;