const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

 try {

  /*
   get token from header
   supports:
   Authorization: Bearer token
   Authorization: token
  */

  let token = req.headers["authorization"] || req.headers["Authorization"];

  if (!token) {

   return res.status(401).json({

    message: "Access denied. No token provided"

   });

  }


  /*
   remove Bearer prefix if present
  */

  if (token.startsWith("Bearer ")) {

   token = token.split(" ")[1];

  }


  /*
   check JWT secret
  */

  if (!process.env.JWT_SECRET) {

   console.log("JWT_SECRET missing in .env");

   return res.status(500).json({

    message: "Server configuration error"

   });

  }


  /*
   verify token
  */

  const decoded = jwt.verify(

   token,

   process.env.JWT_SECRET

  );


  /*
   attach user data to request
  */

  req.user = {

   id: decoded.id,

   role: String(decoded.role).toLowerCase()

  };


  /*
   optional: attach token for future use
  */

  req.token = token;


  next();

 }

 catch (err) {

  console.log("JWT ERROR:", err.message);

  return res.status(401).json({

   message: "Invalid or expired token"

  });

 }

};