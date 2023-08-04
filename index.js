require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require("jsonwebtoken")
const {connection} = require('./config/db')
const bcrypt = require('bcrypt');
const crypto = require("crypto")
const cron = require('node-cron');
const cors = require('cors');
const nodemailer = require("nodemailer");
const {todoRoute} = require('./routes/todo.route');
const {UserModel} = require('./models/User.model');

const {userRoute} = require('./routes/user.route');
const {allpostRoute} = require('./routes/allpost.route');
const { likeRoute } = require('./routes/like.Route')
const {authentication} = require('./middlewares/authentication');


app.use(express.json());
app.use(cors())


app.get("/", (req, res) => {
    res.send("welcome")
})

const deleteExpiredUsers = () => {
  const tokenExpirationTime =  24 * 60 * 60 * 1000
  const currentTime = new Date().getTime();

  
  UserModel.deleteMany({ verified: false, createdAt: { $lt: new Date(currentTime - tokenExpirationTime) } })
    .then((result) => {
      console.log(`${result.deletedCount} expired users removed from MongoDB Atlas`);
    })
    .catch((err) => {
      console.error('Error removing expired users:', err);
    });
};

cron.schedule("30 5 13 * * *", () => {
  console.log('Running background task: Deleting expired users');
  deleteExpiredUsers();
});
const transporter2 = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, 
  secure: false, 
  auth: {
    user: "rohitprajapat83318@gmail.com",
    pass: process.env.pass,
  }
});
app.get('/verify/:token', async(req,res)=>{
  const {token}=req.params
  
  const user = await UserModel.findOne({verificationToken: token})
  const mailOptions = {
    from: "rohitprajapat83318@gmail.com",
    to: user.email,
    subject: "Welcome",
    html:`<!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
        <style amp4email-boilerplate>body{visibility:hidden}</style>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
      </head>
      <body>
         <img src="https://media.tenor.com/qEV9igsXP4YAAAAC/welcome.gif" />
        
         <h2>Thanku for the sign up </h2>
         <p>Enjoy your Journey</>
         <h3>Buddy</h3>
      </body>
    </html>`,
  };
  // res.send(user)
  const tokenExpirationTime = 60* 1000;
  const currentTime = new Date().getTime();
  if (currentTime - user.createdAt.getTime() > tokenExpirationTime) {
    // If the token has expired, delete the user data from MongoDB Atlas
    user
      .remove()
      .then(() => {
        console.log('User data removed from MongoDB Atlas due to token expiration');
        return res.status(400).send({ message: 'Verification token has expired' });
      })
      .catch((err) => {
        console.error('Error removing user data:', err);
        return res.status(500).send({ message: 'Failed to verify email' });
      });
  } else {
    // Mark the user as verified and remove the verification token
    user.verified = true;
    user.verificationToken = undefined;
    user
      .save()
      .then(() => {
        
        transporter.sendMail(mailOptions,async (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
            return res.status(500).send("Error sending email.");
          } else {
            console.log("Email sent:", info.response);
               
            res.send({ message: 'Email verified successfully' });
          }
        })
      })
      .catch((err) => {
        console.error('Error saving user after verification:', err);
        res.status(500).send({ message: 'Failed to verify email' });
      });
  }
})




const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, 
    secure: false, 
    auth: {
      user: "rohitprajapat83318@gmail.com",
      pass: process.env.pass,
    }
  });


  
  const generateVerificationToken = () => {
    return crypto.randomBytes(16).toString('hex');
  };

  


app.post("/signup", async (req, res) => {
  const {name,image,gender,dob,number,email, password} = req.body;
   
  
  const userPre = await UserModel.findOne({email})

  if(userPre?.email){
    res.send("Try login , already exist")
  }
  else{
    const verificationToken = generateVerificationToken();
    
    try{
bcrypt.hash(password,4, async function(err,hash){
    const mailOptions = {
        from: "rohitprajapat83318@gmail.com",
        to: email,
        subject: "Email Verification",
        html: `Hello!\n\nPlease verify your email by clicking the following link: 
          http://localhost:8000/verify/${verificationToken}`,
      };   
      transporter.sendMail(mailOptions,async (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return res.status(500).send("Error sending email.");
        } else {
          console.log("Email sent:", info.response);
             const user = new UserModel({name,email,image,gender,dob,number,password:hash,verificationToken})
           await user.save()
           return res.send({"message": "User created. Please check your email for verification",user})
        //   return res.send("Login successful! Email sent for verification.");
        }
      });
   
})
    }
    catch(err){
      console.log("err",err)
      res.send("Something went wrong try again later")
    }
  }
 
})



app.post("/login", async (req, res)=>{
    const {email,password} = req.body;
    try{
     const user = await UserModel.find({email})
        const hashed_pass = user[0].password;
        bcrypt.compare(password, hashed_pass, function(err,result){
            if(result){
                const token = jwt.sign({"userID": user[0]._id}, 'hush')
                
                  res.send({token,user})
               
            }
            else{
                res.send("Login Failed")
            }
        })
    }
    catch(err){
        console.log("err",err)
        res.send("Something went worng, please try again later")
    }
})





//userRoute
app.use(authentication)
app.use("/todos", todoRoute)
app.use("/mypost", allpostRoute)
app.use("/user", userRoute)
app.use('/like', likeRoute); 

app.listen(process.env.port, async()=> {

   try{
        await connection ;
        console.log(`server is running on port ${process.env.port}`)
    }
    catch(err){
     console.log("err",err)
    }

})