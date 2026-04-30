const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donation");
const logisticsRoutes = require("./routes/logistics");
const requestRoutes = require("./routes/request");
const matchRoutes = require("./routes/match");

const app = express();

/* ================== CORS FIX ================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://fsadprofront.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

/* ================== MIDDLEWARE ================== */

app.use(express.json());

/* ================== ROUTES ================== */

app.use("/api/auth", authRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/match", matchRoutes);

/* ================== TEST ================== */

app.get("/", (req, res) => {
  res.send("Backend Running");
});

/* ================== SERVER ================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});