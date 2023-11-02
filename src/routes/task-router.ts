import { Router, Request, Response } from "express";
import Task from "../db/Task";
import Project from "../db/Project";
import { ITask, commentType } from "../types";
import checkAdmin from "../middlewares/adminAuth";
import { authUser, checkUser } from "../middlewares/userAuth";
import { taskNotification } from "../notification";

const router = Router();

// Todo: Implement pagination for get req for comments array insted of sending it once with the get req for task

// /task/:taskId :- Read, Update, Delete a specific task
router.route("/:taskId")
    .get(authUser, checkUser, async (req: Request, res: Response) => {
        const id = req.params.taskId;

        try {
            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ msg: "Task not found" });
            }
            return res.status(200).json({ msg: "Successfully fetched the info!", task: task });
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    })
    .put(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
        const id = req.params.taskId;

        try {
            const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true })
            if (updatedTask) {
                if (updatedTask.assignedTo)
                    taskNotification(updatedTask.assignedTo)
                return res.status(200).json({ msg: "Updated the task!" });
            } else {
                return res.status(404).json({ msg: "Task not found!" });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    })
    .delete(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
        const id = req.params.taskId;

        try {
            const task = await Task.findById(id);

            // Remove task from the project it was part of
            await Project.updateOne({ _id: task?.projectId }, { $pull: { tasks: { taskId: task?._id } } })

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

// /task/:taskId/comment :- Add a new comment in the task
router.route("/:taskId/comment").post(authUser, checkUser, async (req: Request, res: Response) => {
    const id = req.params.taskId;
    const comment: commentType = req.body;

    if (!req.body.comment) {
        return res.status(400).json({ msg: "Wrong Input Received!" });
    }

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

router.route("/:taskId/status").put(authUser, checkUser, async (req: Request, res: Response) => {
    const id = req.params.taskId;
    try {
        const updatedTask = await Task.updateOne({ _id: id }, { $set: { status: req.body.status } });
        if (updatedTask) {
            // Update Task in the Projectdb
            await Project.updateOne({ _id: req.body.projectId, "tasks.taskId": id }, { $set: { "tasks.$.status": req.body.status } });

            return res.status(200).json({ msg: "Updated the task!" });
        } else {
            return res.status(404).json({ msg: "Task not found!" });
        }
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
})

export default router;