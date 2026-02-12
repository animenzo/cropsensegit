const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();


const authRoutes = require("./routes/authRoutes");
const farmRoutes = require("./routes/farmRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const app = express();

/* ---------------- MIDDLEWARE ---------------- */

// Security headers
app.use(helmet());
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests, slow down 🚫",
  standardHeaders: true,
  legacyHeaders: false
})

app.use(globalLimiter);
app.set("trust proxy", 1);
// Parse JSON
app.use(express.json());

// Parse cookies (🔥 REQUIRED for refresh token)
app.use(cookieParser());

// CORS (🔥 REQUIRED for cookies)
app.use(
  cors({
    origin:[
      "http://localhost:5173",
      "https://cropsense-back.onrender.com"
    ], 
    credentials: true,
    
  })
);

/* ---------------- ROUTES ---------------- */

// Auth (PUBLIC)
app.use("/auth", authRoutes);
app.use("/farms", farmRoutes);
// ... existing imports
app.use('/schedules', scheduleRoutes);
// Protected APIs
app.use('/device',deviceRoutes)


/* ---------------- DATABASE ---------------- */

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected");
     

  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
}
connectDB();
/* ---------------- SERVER ---------------- */
app.get("/",(req,res)=>{
  res.send("Crop sense API is running");
})
const PORT = process.env.PORT || 5000;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;