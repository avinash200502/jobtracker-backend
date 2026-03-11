const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");

//connect env
dotenv.config();

//connect database
connectDB();

const app = express();

//middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://jobtracker-frontend-pi.vercel.app"
}));
app.use(express.json());  // allows json body parsing


const authRoutes = require("./routes/authRoutes");

// ✅ USE AUTH ROUTES
app.use("/api/auth", authRoutes);

//test route
app.get("/", (req,res) =>{
    res.send("API is running...");
});

const protect = require("./middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user,
  });
});

const jobRoutes = require("./routes/jobRoutes");

app.use("/api/jobs", jobRoutes);
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

module.exports = app;


