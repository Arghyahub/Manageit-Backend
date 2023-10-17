import { Router, Request, Response } from "express";
import Project from "../db/Project";
import { IProject } from "../types";
import Organisation from "../db/Organisation";

const router = Router();

// Interface for req.user using orgId
interface CustomRequest extends Request {
    user?: { orgId: string };
}

// Todo: Make a middleware to check user is part of project to allow Get request and for Post, Put, Delete route check if user has admin role
// Todo: Implement pagination for get request for users and tasks array

// todo: implement a route for adding users in the project. In projectDB: users[id]

router.route("/").post(async (req: CustomRequest, res: Response) => {
    try {
        if (req.user && req.user.orgId) {
            const project: IProject = req.body;
            const newProject = new Project(project);
            const savedProject = await newProject.save();
            const orgId = req.user.orgId;
            await Organisation.findByIdAndUpdate(orgId, { $push: { projects: savedProject._id } });
            return res.status(201).json({ msg: "Successfully created the project!", project: savedProject });
        } else {
            return res.status(404).json({ msg: "User/Organisation is not found!" });
        }
    } catch (error) {
        console.error("Error while creating the project:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error });
    }
});

// Route for Read, Update, Delete in a specific project
router.route("/:projectId")
    .get(async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const project = await Project.findById(id);
            return res.status(200).json({ msg: "Successfully fetched the info!", project: project });
        } catch (error) {
            return res.status(404).json({ msg: "Project not found", error });
        }
    })
    .put(async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const updated = await Project.findByIdAndUpdate(id, req.body, { new: true })
            if (updated) {
                return res.status(200).json({ msg: "Updated the project!" });
            } else {
                return res.status(404).json({ msg: "Project not found!" });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    })
    .delete(async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const deletedProject = await Project.findByIdAndDelete(id);
            if (deletedProject) {
                return res.status(200).json({ msg: "Successfully deleted!" });
            } else {
                return res.status(404).json({ msg: "Project not found" });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    });

export default router;