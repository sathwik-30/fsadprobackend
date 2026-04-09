const express = require("express");

const db = require("../config/db");

const auth = require("../middleware/authMiddleware");

const router = express.Router();



/*
 CREATE REQUEST
 recipient only
*/

router.post("/add", auth, (req,res)=>{

 if(req.user.role !== "recipient"){

  return res.status(403).json({

   message:"Only recipient allowed"

  });

 }


 let { item, quantity } = req.body;


 item = item?.trim();


 if(!item || !quantity){

  return res.status(400).json({

   message:"All fields required"

  });

 }


 if(quantity <= 0){

  return res.status(400).json({

   message:"Quantity must be greater than 0"

  });

 }


 const sql =

 `
 INSERT INTO requests
 (recipient_id,item,quantity,status)
 VALUES (?,?,?,?)
 `;


 db.query(

  sql,

  [

   req.user.id,

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

    message:"Request submitted for approval"

   });

  }

 );

});



/*
 ADMIN APPROVES REQUEST
*/

router.post("/approve", auth, (req,res)=>{


 if(req.user.role !== "admin"){

  return res.status(403).json({

   message:"Admin only"

  });

 }


 const { request_id } = req.body;


 if(!request_id){

  return res.status(400).json({

   message:"request_id required"

  });

 }


 db.query(

 "UPDATE requests SET status='approved' WHERE id=?",

 [request_id],

 (err)=>{

  if(err){

   return res.status(500).json({

    message:"Database error"

   });

  }


  res.json({

   message:"Request approved"

  });

 }

 );

});



/*
 VIEW ALL REQUESTS
 donor + admin allowed
*/

router.get("/all", auth, (req,res)=>{


 if(!["donor","admin"]
 .includes(req.user.role)){

  return res.status(403).json({

   message:"Access denied"

  });

 }


 const sql =

 `
 SELECT *
 FROM requests
 ORDER BY id DESC
 `;


 db.query(sql,(err,result)=>{


  if(err){

   return res.status(500).json({

    message:"Database error"

   });

  }


  res.json(result);

 });

});



/*
 VIEW MY REQUESTS
 recipient dashboard
*/

router.get("/mine", auth, (req,res)=>{


 if(req.user.role !== "recipient"){

  return res.status(403).json({

   message:"Access denied"

  });

 }


 const sql =

 `
 SELECT *
 FROM requests
 WHERE recipient_id=?
 ORDER BY id DESC
 `;


 db.query(

  sql,

  [req.user.id],

  (err,result)=>{


   if(err){

    return res.status(500).json({

     message:"Database error"

    });

   }


   res.json(result);

  }

 );

});



module.exports = router;