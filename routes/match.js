const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();



/*
 ADMIN creates match between donation & request
 stores selected vehicle
*/

router.post("/create", auth, (req,res)=>{

 if(req.user.role !== "admin"){

  return res.status(403).json({
   message:"Admin only"
  });

 }


 const { donation_id, request_id, vehicle } = req.body;


 if(!donation_id || !request_id || !vehicle){

  return res.status(400).json({
   message:"donation_id, request_id and vehicle required"
  });

 }



 /*
 check donation exists
*/

 db.query(

 "SELECT * FROM donations WHERE id=?",

 [donation_id],

 (err,donationResult)=>{

  if(err){

   console.log(err);

   return res.status(500).json({
    message:"Database error"
   });

  }


  if(donationResult.length===0){

   return res.status(404).json({
    message:"Donation not found"
   });

  }


  const donation = donationResult[0];


  if(!["approved","pending"].includes(donation.status)){

   return res.status(400).json({
    message:"Donation already assigned or delivered"
   });

  }



 /*
 check request exists
*/

  db.query(

  "SELECT * FROM requests WHERE id=?",

  [request_id],

  (err2,requestResult)=>{

   if(err2){

    console.log(err2);

    return res.status(500).json({
     message:"Database error"
    });

   }


   if(requestResult.length===0){

    return res.status(404).json({
     message:"Request not found"
    });

   }


   const request = requestResult[0];


   /*
   request must be approved by admin first
   */

   if(request.status !== "approved"){

    return res.status(400).json({
     message:"Request must be approved first"
    });

   }



 /*
 prevent duplicate match
*/

   db.query(

   "SELECT id FROM matches WHERE donation_id=?",

   [donation_id],

   (err3,matchCheck)=>{

    if(err3){

     console.log(err3);

     return res.status(500).json({
      message:"Database error"
     });

    }


    if(matchCheck.length>0){

     return res.status(400).json({
      message:"Donation already matched"
     });

    }



 /*
 create match with vehicle
*/

    const sql = `
    INSERT INTO matches
    (donation_id, request_id, assigned_by, status, vehicle)
    VALUES (?,?,?,?,?)
    `;


    db.query(

     sql,

     [
      donation_id,
      request_id,
      req.user.id,
      "assigned",
      vehicle
     ],

     (err4)=>{

      if(err4){

       console.log(err4);

       return res.status(500).json({
        message:"Match creation failed"
       });

      }



 /*
 update donation status
*/

      db.query(
       "UPDATE donations SET status='assigned' WHERE id=?",
       [donation_id]
      );



 /*
 request remains approved
*/

      res.json({

       message:"Delivery assigned successfully",

       vehicle

      });

     }

    );

   });

  });

 });

});



/*
 VIEW MATCHES
 admin + logistics dashboard
*/

router.get("/all", auth, (req,res)=>{

 if(!["admin","logistics"].includes(req.user.role)){

  return res.status(403).json({
   message:"Access denied"
  });

 }


 const sql = `

 SELECT

  m.id,
  m.vehicle,

  m.donation_id,
  m.request_id,

  d.donorName,
  d.item,
  d.quantity,
  d.status as donation_status,

  r.item as requested_item,
  r.quantity as requested_qty,
  r.status as request_status,

  m.created_at

 FROM matches m

 JOIN donations d
 ON m.donation_id = d.id

 JOIN requests r
 ON m.request_id = r.id

 ORDER BY m.id DESC

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
 donor tracking
*/

router.get("/mine", auth, (req,res)=>{


 const sql = `

 SELECT

  m.id,
  m.vehicle,

  d.item,
  d.quantity,
  d.status,

  m.created_at

 FROM matches m

 JOIN donations d
 ON m.donation_id = d.id

 WHERE d.donor_id=?

 ORDER BY m.id DESC

 `;


 db.query(sql,[req.user.id],(err,result)=>{

  if(err){

   console.log(err);

   return res.status(500).json({
    message:"Database error"
   });

  }


  res.json(result);

 });

});


module.exports = router;