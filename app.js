require('dotenv').config();
require("./config/database").connect();
const express = require('express');
const app = express();
const auth = require('./middleware/auth')
app.use(express.json());
app.use(express.urlencoded({extended:true}))


//API Router
//User
const {register, login} = require('./api/UserAPI')
app.post('/register', register);
app.post('/login', login);

//Note Folder
const { createFolder, updateFolder, deleteFolder, getFolder } = require('./api/FolderApi') 
app.post('/create_folder', auth, createFolder);
app.post('/update_folder', auth, updateFolder);
app.post('/delete_folder', auth, deleteFolder);
app.get('/get_folder', auth, getFolder);

//Note


app.get("/", (req,res)=>{
  res.status(200).send("User Note API");
});

module.exports = app;