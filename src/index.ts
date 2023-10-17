require("dotenv").config();
import express from "express";
import cors from "cors";
const port = 8000;

const app = express();
app.use(express.json());
app.use(cors());

// Routes
import authRoutes from "./routes/auth-router";
import taskRoutes from "./routes/task-router";
import projectRoutes from "./routes/project-router";
import orgRoutes from "./routes/org-router";

app.use("/auth", authRoutes)
app.use("/task", taskRoutes)
app.use("/project", projectRoutes);
app.use("/org", orgRoutes);

// Connect to database
import connectDB from "./db/index";
connectDB();

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})