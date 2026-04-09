const express = require("express");

const db = require("../config/db");

const auth = require("../middleware/authMiddleware");

const router = express.Router();



/*
 valid delivery stages
 keeps system consistent
*/

const validStatuses = [

 "assigned",

 "picked",

 "in_transit",

 "shipped",

 "delivered"

];



/*
 UPDATE DELIVERY STATUS
 logistics only
*/

router.post("/update", auth, (req, res) => {

 try{

  const role =
   String(req.user.role)
   .trim()
   .toLowerCase();


  if(role !== "logistics"){

   return res.status(403).json({

    message:"Only logistics team allowed"

   });

  }


  const {

   donation_id,

   location,

   delivery_status

  } = req.body;



  if(!donation_id || !location || !delivery_status){

   return res.status(400).json({

    message:"All fields required"

   });

  }



  if(!validStatuses.includes(delivery_status)){

   return res.status(400).json({

    message:"Invalid delivery status"

   });

  }



  /*
   insert delivery timeline record
  */

  const insertLogistics =

  `
  INSERT INTO logistics
  (donation_id, location, delivery_status)
  VALUES (?,?,?)
  `;



  db.query(

   insertLogistics,

   [

    donation_id,

    location,

    delivery_status

   ],

   (err)=>{

    if(err){

     console.log(err);

     return res.status(500).json({

      message:"Logistics insert failed"

     });

    }



    /*
     update donation current status
    */

    const updateDonation =

    `
    UPDATE donations
    SET status=?
    WHERE id=?
    `;



    db.query(

     updateDonation,

     [

      delivery_status,

      donation_id

     ],

     (err2)=>{

      if(err2){

       console.log(err2);

       return res.status(500).json({

        message:"Donation status update failed"

       });

      }



      res.json({

       message:"Delivery status updated",

       current_status:delivery_status

      });

     }

    );

   }

  );

 }

 catch(err){

  console.log(err);

  res.status(500).json({

   message:"Server error"

  });

 }

});



/*
 VIEW ALL LOGISTICS RECORDS
 admin + logistics allowed
*/

router.get("/all", auth, (req, res) => {


 const role =
  String(req.user.role)
  .trim()
  .toLowerCase();


 if(

  !["admin","logistics"]
  .includes(role)

 ){

  return res.status(403).json({

   message:"Access denied"

  });

 }


 const sql =

 `
 SELECT *
 FROM logistics
 ORDER BY updated_at DESC
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
 VIEW DELIVERY TIMELINE FOR ONE DONATION
 useful for tracking progress
*/

router.get("/timeline/:donation_id", auth, (req,res)=>{


 const { donation_id } = req.params;


 const sql =

 `
 SELECT
 location,
 delivery_status,
 updated_at
 FROM logistics
 WHERE donation_id=?
 ORDER BY updated_at ASC
 `;


 db.query(sql,[donation_id],(err,result)=>{


  if(err){

   return res.status(500).json({

    message:"Database error"

   });

  }


  res.json(result);

 });

});



module.exports = router;