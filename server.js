const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donation");
const logisticsRoutes = require("./routes/logistics");

/*
 NEW ROUTES
*/

const requestRoutes = require("./routes/request");
const matchRoutes = require("./routes/match");


const app = express();


/*
 middleware
*/

app.use(cors({

 origin: "*",

 methods: ["GET","POST","PUT","DELETE"],

 allowedHeaders: ["Content-Type","Authorization"]

}));

app.use(express.json());



/*
 routes
*/

app.use("/api/auth", authRoutes);

app.use("/api/donation", donationRoutes);

app.use("/api/logistics", logisticsRoutes);

/*
 NEW ROUTES REGISTERED
*/

app.use("/api/request", requestRoutes);

app.use("/api/match", matchRoutes);



/*
 test route
*/

app.get("/", (req, res) => {
    
 res.send("FSAD Backend Running");

});



/*
 ensure PORT exists
*/

const PORT = process.env.PORT || 5000;



/*
 start server
*/

app.listen(PORT, () => {

 console.log("Server running on port", PORT);

});