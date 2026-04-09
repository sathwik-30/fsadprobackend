const mysql = require("mysql2");
require("dotenv").config();

/*
 connection pool
 better than single connection
 handles multiple requests
 auto manages connections
*/

const db = mysql.createPool({

 host: process.env.DB_HOST,

 user: process.env.DB_USER,

 password: process.env.DB_PASSWORD,

 database: process.env.DB_NAME,

 waitForConnections: true,

 connectionLimit: 10,

 queueLimit: 0

});


/*
 test connection
*/

db.getConnection((err, connection) => {

 if (err) {

  console.log("Database connection failed");
  console.log(err);

 }

 else {

  console.log("MySQL Connected");
  connection.release();

 }

});


/*
 promise support without creating second pool
*/

db.promise = db.promise();


module.exports = db;