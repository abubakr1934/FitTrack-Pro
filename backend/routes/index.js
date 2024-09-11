require("dotenv").config();
const express=require("express");
const cors=require("cors");
const app=express();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { authenticateToken } = require("../utilities.js")
const config = require("../configuration/config.json");
const mongoose = require("mongoose");
mongoose.connect(config.connectionString);
const ACCESS_TOKEN_SECRET="bff01826f614cc3eb42faf5e1812a984d2eabe53d3b60f007dd743a2bb478e6c264ac28859f4b0b8a9527363826f2e35e0db8e6292e76b9c960aa8135f957ca9"   
app.use(express.json());
app.use(
    cors({
        origin:"*",
    })
)
app.post("/signup",async (req,res)=>{
    const {fullname,email,password,confirmPassword}=req.body;
    if(!fullname || !email){
        return res.status(400).json({
            error:true,
            message:"enter full name and email",
        })
    }
    if(password!==confirmPassword){
        return res.status(400).json({
            error:true,
            message:"passwords not matching",
        })
    }
    const isUser=await User.findOne({email:email})//email as the differentiating key
    if(isUser){
        //exists already
        return res.status(200).json({
            error:true,
            message:"User already exists"
        })
    }
    else{
        const newUser=new User({
            fullname,
            email,
            password
        })//new user created with the given details and remaining will be put default as in the model schema
        await newUser.save();
        const accessToken = jwt.sign({ newUser }, ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });//generated access token for the user
        console.log(newUser)
        return res.status(200).json({      
            newUser,
            accessToken,
            message:"Registration was successfull"
        })
        
    }
    
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({
            error: true,
            message: "Please enter your email"
        });
    }
    if (!password) {
        return res.status(400).json({
            error: true,
            message: "Please enter your password"
        });
    }

    try {
        const isUser = await User.findOne({ email: email });
        if (!isUser) {
            return res.status(400).json({
                error: true,
                message: "User does not exist, please sign up"
            });
        }

        if (isUser.password === password) {
            const userPayload = { user: isUser };
            const accessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, {
                expiresIn: "36000m",
            });
            return res.json({
                error: false,
                message: "Login Successful",
                email,
                accessToken,
            });
        } else {
            return res.status(400).json({
                error: true,
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "An error occurred during login",
            details: error.message,
        });
    }
});

app.listen(8000,()=>{
    console.log("server is running at port 8000")
});
module.exports=app;