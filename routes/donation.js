const express = require("express");

const db = require("../config/db");

const auth = require("../middleware/authMiddleware");

const router = express.Router();



/*
 ADD DONATION
 donor or admin allowed
*/

router.post("/add", auth, (req,res)=>{

 const { donorName, item, quantity } = req.body;


 if(!donorName || !item || !quantity){

  return res.status(400).json({

   message:"All fields required"

  });

 }


 if(!["donor","admin"].includes(req.user.role)){

  return res.status(403).json({

   message:"Access denied"

  });

 }


 const sql =

 `
 INSERT INTO donations
 (donorName, item, quantity, status)
 VALUES (?,?,?,?)
 `;


 db.query(

  sql,

  [

   donorName,
   item,
   quantity,
   "pending"

  ],

  (err)=>{

   if(err){

    console.log(err);

    return res.status(500).json({

     message:"Database error"

    });

   }


   res.json({

    message:"Donation submitted for approval"

   });

  }

 );

});



/*
 ADMIN APPROVES DONATION
*/

router.post("/approve", auth, (req,res)=>{

 if(req.user.role !== "admin"){

  return res.status(403).json({

   message:"Admin only"

  });

 }


 const { donation_id } = req.body;


 if(!donation_id){

  return res.status(400).json({

   message:"donation_id required"

  });

 }


 db.query(

 "UPDATE donations SET status='approved' WHERE id=?",

 [donation_id],

 (err)=>{

  if(err){

   console.log(err);

   return res.status(500).json({

    message:"Database error"

   });

  }


  res.json({

   message:"Donation approved"

  });

 }

 );

});



/*
 GET ALL DONATIONS
 admin dashboard
*/

router.get("/all", auth, (req,res)=>{

 const sql =

 `
 SELECT *
 FROM donations
 ORDER BY id DESC
 `;


 db.query(sql,(err,result)=>{

  if(err){

   console.log(err);

   return res.status(500).json({

    message:"Database error"

   });

  }


  res.json(result);

 });

});



/*
 GET APPROVED DONATIONS
 for matching
*/

router.get("/approved", auth, (req,res)=>{

 const sql =

 `
 SELECT *
 FROM donations
 WHERE status='approved'
 ORDER BY id DESC
 `;


 db.query(sql,(err,result)=>{

  if(err){

   console.log(err);

   return res.status(500).json({

    message:"Database error"

   });

  }


  res.json(result);

 });

});



/*
 GET DONATIONS BY LOGGED USER
 donor dashboard
*/

router.get("/mine", auth, (req,res)=>{

 /*
  using name stored in login
 */

 const donorName = req.user.name;


 const sql =

 `
 SELECT *
 FROM donations
 WHERE donorName=?
 ORDER BY id DESC
 `;


 db.query(

  sql,

  [donorName],

  (err,result)=>{

   if(err){

    console.log(err);

    return res.status(500).json({

     message:"Database error"

    });

   }


   res.json(result);

  }

 );

});



module.exports = router;