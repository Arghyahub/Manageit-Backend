import { Router, Request, Response } from 'express';
import Project from '../db/Project';

const router = Router();

// Todo: Make a middleware to check user is part of project to allow Get request and for Post, Put, Delete route check if user has admin role
// Todo: Implement pagination for get request for users and tasks array

router.route("/:projectId")
    .get(async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const project = await Project.findById(id);
            res.status(200).json({ "msg": "Successfully fetched the info!", "project": project });
        } catch (error) {
            console.error("Error in finding out:", error);
            res.status(404).json({ "msg": "Project not found" });
        }
    })
    .put(async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const updated = await Project.findByIdAndUpdate(id, req.body, { new: true })
            if (updated) {
                return res.status(200).json({ "msg": "Updated the project!" });
            } else {
                return res.status(404).json({ "msg": "Project not found!" });
            }
        } catch (error) {
            console.log("Error while updating!", error);
            return res.status(500).json({ "msg": "Internal Server Error!" });
        }
    })
    .delete(async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const deletedProject = await Project.findByIdAndDelete(id);
            if (deletedProject) {
                res.status(200).json({ "msg": "Successfully deleted!" });
            } else {
                res.status(404).json({ "msg": "Project not found" });
            }
        } catch (error) {
            console.log("Error while deleting! : ", error);
            res.status(500).json({ "msg": "Internal Server Error!" });
        }
    });

export default router;