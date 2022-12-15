const User = require("../model/user");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
module.exports = {
    checkEmail: async(req,res)=>{
      try {
        const { email } = req.body;
        if(!email){
          return res.status(400).send("Email is required");
        }
        const oldUser = await User.findOne({ email });
        return res.status(201).json({email_exist: oldUser!=null});
      } catch (error) {
        res.status(500).send({error: error});
      }
    },
    register: async(req,res)=>{
        // Our register logic starts here
        try {
            const { first_name, last_name, email, password } = req.body;
            // Validate user input
            if (!(email && password && first_name && last_name)) {
              return res.status(400).send("All input is required");
            }
        
            const oldUser = await User.findOne({ email });
        
            if (oldUser) {
              return res.status(409).send({error: "User Already Exist. Please Login"});
            }
        
            //Encrypt user password
            let encryptedPassword = await bcrypt.hash(password, 10)
        
            // Create user in our database
            const user = await User.create({
              first_name,
              last_name,
              email: email.toLowerCase(), // sanitize: convert email to lowercase
              password: encryptedPassword,
            });
        
            // Create token
            const token = jwt.sign(
              { user_id: user._id, email },
              process.env.TOKEN_KEY,
              {
                expiresIn: "365d",
              }
            );
            // save user token
            user.token = token;
        
            // return new user
            res.status(201).json({id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, token: token});
          } catch (err) {
            console.log(err);
            res.status(500).send({error: err});
          }
    },
    login: async(req, res)=>{
        try {
            console.log("Login", res)
            // Get user input
            const { email, password } = req.body;
        
            // Validate user input
            if (!(email && password)) {
              return res.status(400).send({error: "All input is required"});
            }
            // Validate if user exist in our database
            const user = await User.findOne({ email });
        
            if (user && (await bcrypt.compare(password, user.password))) {
              // Create token
              const token = jwt.sign(
                { user_id: user._id, email }, 
                process.env.TOKEN_KEY,
                {
                  expiresIn: "365d",
                }
              );
        
              // save user token
              user.token = token;
        
              // user
              return res.status(200).json({id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, token: token});
            }
            res.status(400).send({error: "Invalid Credentials"});
        } catch (err) {
            console.log(err);
            res.status(500).send({error: err});
        }
    },
    changePassword: async(req, res)=>{
      try {
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
          return res.status(400).send({error: "All input is required"});
        }
        const email = req.user.email
        const user = await User.findOne({ email });
        if((await bcrypt.compare(oldPassword, user.password))){
          let encryptedPassword = await bcrypt.hash(newPassword, 10)
          let newValue = {$set: {password: encryptedPassword}}
          await User.updateOne({_id: mongoose.Types.ObjectId(user._id)}, newValue);
          return res.status(200).json({success: true, message: "Change password success"});
        }else{
          return res.status(500).send({error: "Password incorrect"});
        }
      } catch (err) {
        console.log("changepass-error", err)
        return res.status(500).send({error: err});
      }
    },
    resetPassword: async(req, res)=>{
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).send({error: "Email is required"});
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });
        if(!user){
          return res.status(400).send({error: "User dose not exist."});
        }
        return res.status(200).json({success: true, message: "Verification code is sent"});
      } catch (err) {
        return res.status(500).send({error: err});
      }
    },
    confirmResetPassword: async(req, res)=>{
      try {
        const { email, confirmCode, password } = req.body;
        if (!(email && confirmCode && password)) {
          return res.status(400).send({error: "All input is required"});
        }
        const user = await User.findOne({ email });
        if(!user){
          return res.status(400).send({error: "User dose not exist."});
        }
        if(confirmCode != '123456'){
          return res.status(400).send({error: "Confirm code incorrect"});
        }
        //Encrypt user password
        let encryptedPassword = await bcrypt.hash(password, 10)
        let newValue = {$set: {password: encryptedPassword}}
        await User.updateOne({_id: mongoose.Types.ObjectId(user._id)}, newValue);
        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "365d",
            }
          );
        // return new user
        return res.status(201).json({id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, token: token});

      } catch (err) {
        return res.status(500).send({error: err});
      }
    }
}