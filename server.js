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

const allowedOrigins = [
 "http://localhost:3000",
 "http://localhost:5173",
 "https://fsadprofront-k6wm7suq9-sathwiks-projects-cb9cd622.vercel.app",
 "https://*.vercel.app"
];

app.use(cors({
 origin: function(origin, callback) {
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
   callback(null, true);
  } else {
   callback(new Error('Not allowed by CORS'));
  }
 },
 methods: ["GET","POST","PUT","DELETE"],
 allowedHeaders: ["Content-Type","Authorization"],
 credentials: true
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