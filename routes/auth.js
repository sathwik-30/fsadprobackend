const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const db = require("../config/db");

const router = express.Router();


/*
 TEMP OTP STORE
*/
const otpStore = {};


/*
 EMAIL TRANSPORT
*/
const transporter = nodemailer.createTransport({

 host: "smtp.gmail.com",

 port: 587,

 secure: false,

 auth: {

  user: process.env.EMAIL_USER,

  pass: process.env.EMAIL_PASS

 }

});


/*
 GENERATE OTP
*/
const generateOTP = () =>

 Math.floor(100000 + Math.random() * 900000);



/*
 SEND REGISTER OTP
*/
router.post("/send-otp", async (req,res)=>{

 let {email} = req.body;

 email = email?.trim().toLowerCase();

 if(!email){

  return res.status(400).json({

   message:"Email required"

  });

 }


 const otp = generateOTP();

 otpStore[email] = otp;


 try{

  await transporter.sendMail({

   from: process.env.EMAIL_USER,

   to: email,

   subject:"Registration OTP",

   text:`Your OTP is ${otp}`

  });


  console.log("REGISTER OTP:",otp);


  res.json({

   message:"OTP sent successfully"

  });

 }

 catch(err){

  console.log(err);

  res.status(500).json({

   message:"Email failed"

  });

 }

});



/*
 RESEND REGISTER OTP
*/
router.post("/resend-otp",(req,res)=>{

 let {email}=req.body;

 email=email?.trim().toLowerCase();

 if(!email){

  return res.status(400).json({

   message:"Email required"

  });

 }


 const otp = generateOTP();

 otpStore[email] = otp;


 console.log("RESEND REGISTER OTP:",otp);


 res.json({

  message:"OTP resent"

 });

});



/*
 VERIFY OTP + REGISTER
*/
router.post("/verify-otp", async(req,res)=>{

 let {name,email,password,role,otp} = req.body;


 name=name?.trim();

 email=email?.trim().toLowerCase();

 password=password?.trim();

 role=role?.trim().toLowerCase();


 if(!name || !email || !password || !role || !otp){

  return res.status(400).json({

   message:"All fields required"

  });

 }


 if(!["admin","donor","recipient","logistics"].includes(role)){

  return res.status(400).json({

   message:"Invalid role"

  });

 }


 if(otpStore[email] != otp){

  return res.status(400).json({

   message:"Invalid OTP"

  });

 }


 try{

  const checkSql =

  "SELECT id FROM users WHERE email=?";


  db.query(checkSql,[email],async(err,result)=>{

   if(err){

    return res.status(500).json({

     message:"Database error"

    });

   }


   if(result.length>0){

    return res.status(400).json({

     message:"User already exists"

    });

   }


   const hashed =

    await bcrypt.hash(password,10);


   const sql =

   `
   INSERT INTO users
   (name,email,password,role)
   VALUES (?,?,?,?)
   `;


   db.query(

    sql,

    [name,email,hashed,role],

    (err)=>{

     if(err){

      console.log(err);

      return res.status(500).json({

       message:"Registration failed"

      });

     }


     delete otpStore[email];


     res.json({

      message:"User registered successfully"

     });

    }

   );

  });

 }

 catch(err){

  res.status(500).json({

   message:"Server error"

  });

 }

});



/*
 LOGIN
*/
router.post("/login",(req,res)=>{

 let {email,password,role} = req.body;


 email=email?.trim().toLowerCase();

 password=password?.trim();

 role=role?.trim().toLowerCase();


 if(!email || !password || !role){

  return res.status(400).json({

   message:"All fields required"

  });

 }


 if(!process.env.JWT_SECRET){

  return res.status(500).json({

   message:"JWT secret missing"

  });

 }


 const sql =

 `
 SELECT *
 FROM users
 WHERE email=?
 `;


 db.query(sql,[email],async(err,result)=>{

  if(err){

   return res.status(500).json({

    message:"Database error"

   });

  }


  if(result.length===0){

   return res.status(400).json({

    message:"Invalid credentials"

   });

  }


  const user = result[0];


  const dbRole =

   user.role.trim().toLowerCase();


  if(dbRole !== role){

   return res.status(400).json({

    message:"Role not permitted"

   });

  }


  const validPass =

   await bcrypt.compare(password,user.password);


  if(!validPass){

   return res.status(400).json({

    message:"Invalid credentials"

   });

  }


  const token =

   jwt.sign(

    {

     id:user.id,

     role:dbRole,

     email:user.email

    },

    process.env.JWT_SECRET,

    {

     expiresIn:"1d"

    }

   );


  res.json({

   message:"Login successful",

   token,

   role:dbRole,

   name:user.name

  });

 });

});



/*
 SEND RESET OTP
*/
router.post("/send-reset-otp",async(req,res)=>{

 let {email}=req.body;

 email=email?.trim().toLowerCase();


 if(!email){

  return res.status(400).json({

   message:"Email required"

  });

 }


 const sql =

 `
 SELECT id
 FROM users
 WHERE email=?
 `;


 db.query(sql,[email],async(err,result)=>{

  if(err){

   return res.status(500).json({

    message:"Database error"

   });

  }


  if(result.length===0){

   return res.status(404).json({

    message:"User not found"

   });

  }


  const otp = generateOTP();

  otpStore[email] = otp;


  console.log("RESET OTP:",otp);


  try{

   await transporter.sendMail({

    from:process.env.EMAIL_USER,

    to:email,

    subject:"Password Reset OTP",

    text:`Your OTP is ${otp}`

   });

  }
  catch(e){

   console.log("Email skipped");

  }


  res.json({

   message:"OTP sent"

  });

 });

});



/*
 RESEND RESET OTP
*/
router.post("/resend-reset-otp",(req,res)=>{

 let {email}=req.body;

 email=email?.trim().toLowerCase();


 if(!email){

  return res.status(400).json({

   message:"Email required"

  });

 }


 const otp = generateOTP();

 otpStore[email]=otp;


 console.log("RESEND RESET OTP:",otp);


 res.json({

  message:"OTP resent"

 });

});



/*
 RESET PASSWORD
*/
router.post("/reset-password",async(req,res)=>{

 let {email,otp,password}=req.body;


 email=email?.trim().toLowerCase();

 password=password?.trim();


 if(!email || !otp || !password){

  return res.status(400).json({

   message:"All fields required"

  });

 }


 if(otpStore[email] != otp){

  return res.status(400).json({

   message:"Invalid OTP"

  });

 }


 try{

  const hashed =

   await bcrypt.hash(password,10);


  const sql =

  `
  UPDATE users
  SET password=?
  WHERE email=?
  `;


  db.query(sql,[hashed,email],(err,result)=>{

   if(err){

    return res.status(500).json({

     message:"Database error"

    });

   }


   if(result.affectedRows===0){

    return res.status(404).json({

     message:"User not found"

    });

   }


   delete otpStore[email];


   res.json({

    message:"Password updated successfully"

   });

  });

 }

 catch(err){

  res.status(500).json({

   message:"Server error"

  });

 }

});


module.exports = router;