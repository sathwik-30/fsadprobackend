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
  "https://fsadprofront.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(null, true); // allow all (temp)
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());