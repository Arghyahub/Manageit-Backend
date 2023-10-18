import { Router, Request, Response } from "express";
import Task from "../db/Task";
import Project from "../db/Project";
import { ITask, commentType } from "../types";

const router = Router();

// /task: Post route for creating new tasks
router.route("/").post(async (req: Request, res: Response) => {
    try {
        if (req.body.projectId) {
            const task: ITask = req.body;
            const newTask = new Task(task);
            await newTask.save();

            // Save the task in the project that it is part of
            const created = await Project.findByIdAndUpdate(newTask.projectId, { $push: { tasks: newTask._id } });
            if (created) {
                return res.status(201).json({ msg: "Successfully created the task!", task: newTask });
            } else {
                return res.status(404).json({ msg: "Task not found" });
            }
        } else {
            return res.status(404).json({ msg: "Error: Project not found!" });
        }
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
});


// /task/:taskId: Read, Update, Delete a specific task
router.route("/:taskId")
    .get(async (req: Request, res: Response) => {
        const id = req.params.taskId;
        try {
            const task = await Task.findById(id);
            return res.status(200).json({ msg: "Successfully fetched the info!", task: task });
        } catch (error) {
            return res.status(404).json({ msg: "Task not found", error });
        }
    })
    .put(async (req: Request, res: Response) => {
        const id = req.params.taskId;
        try {
            const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true })
            if (updatedTask) {
                return res.status(200).json({ msg: "Updated the task!" });
            } else {
                return res.status(404).json({ msg: "Task not found!" });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    })
    .delete(async (req: Request, res: Response) => {
        const id = req.params.taskId;
        try {
            const task = await Task.findById(id);

            // Remove task from the project it was part of
            await Project.updateOne({ _id: task?.projectId }, { $pull: { tasks: task?._id } })

            // Delete the task
            const deletedTask = await Task.deleteOne({ _id: task?._id });
            if (deletedTask) {
                return res.status(200).json({ msg: "Successfully deleted!" });
            } else {
                return res.status(404).json({ msg: "Task not found" });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    });

// /task/:taskId/comment: Add a new comment in the task
router.route("/:taskId/comment").post(async (req: Request, res: Response) => {
    const id = req.params.taskId;
    const comment: commentType = req.body;
    try {
        const commented = await Task.findByIdAndUpdate(id, { $push: { comments: comment } });
        if (commented) {
            return res.status(200).json({ msg: "Successfully commented!" });
        } else {
            return res.status(404).json({ msg: "Task not found" });
        }
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
});

export default router;