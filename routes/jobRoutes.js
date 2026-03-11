const express = require("express");
const Job = require("../models/Job.modle");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ✅ CREATE JOB
router.post("/", protect, async (req, res) => {
  try {
    const { title, company, status, salary, notes } = req.body;

    const job = await Job.create({
      title,
      company,
      status,
      salary,
      notes,
      user: req.user._id, // VERY IMPORTANT
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ GET ALL JOBS (ONLY LOGGED-IN USER)
// router.get("/", protect, async (req, res) => {
//   try {
//     const jobs = await Job.find({ user: req.user._id });

//     res.json(jobs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.get("/", protect, async (req, res) => {
    try {
      const { status, search, sort } = req.query;
  
      let queryObject = { user: req.user._id };
  
      // Filter by status
      if (status && status !== "All") {
        queryObject.status = status;
      }
  
      // Search by title or company
      if (search) {
        queryObject.$or = [
          { title: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
        ];
      }
  
      let result = Job.find(queryObject);
  
      // Sorting
      if (sort === "latest") {
        result = result.sort("-createdAt");
      } else if (sort === "oldest") {
        result = result.sort("createdAt");
      } else if (sort === "a-z") {
        result = result.sort("title");
      }
  
      const jobs = await result;
  
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


// ✅ UPDATE JOB
router.put("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    Object.assign(job, req.body);

    const updatedJob = await job.save();

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ DELETE JOB
router.delete("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;