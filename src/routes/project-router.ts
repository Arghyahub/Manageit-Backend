import { Router, Request, Response } from "express";
import Project from "../db/Project";
import User from "../db/User";
import Organisation from "../db/Organisation";
import { IProject } from "../types";
import checkAdmin from "../middlewares/adminAuth";
import { authUser, checkUser } from "../middlewares/userAuth";
import checkAdminInOrg from "../middlewares/orgAuth";

const router = Router();

// Todo: Implement pagination for get request for users and tasks array

// /project :- Route for creating new projects
router.route("/").post(authUser, checkAdminInOrg, async (req: Request, res: Response) => {
    try {
        const project: IProject = req.body;
        const newProject = new Project(project);
        const savedProject = await newProject.save();

        // Save the project Id in the orgDB 
        const updated = await Organisation.findByIdAndUpdate(req.body.orgId, { $push: { projects: savedProject._id } });
        if (!updated) {
            await Project.deleteOne({ _id: savedProject._id });
            return res.status(404).json({ msg: "User/Organisation is not found, project can't be created!" });
        }
        return res.status(201).json({ msg: "Successfully created the project!", project: savedProject });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error", error: error });
    }
});

// /project/:projectId :- Route for Read, Update, Delete in a specific project
router.route("/:projectId")
    .get(authUser, checkUser, async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const project = await Project.findById(id);
            return res.status(200).json({ msg: "Successfully fetched the info!", project: project });
        } catch (error) {
            return res.status(404).json({ msg: "Project not found", error });
        }
    })
    .put(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
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
    .delete(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const project = await Project.findById(id);

            // Removing project Id from organisation it was part of
            await Organisation.updateOne({ _id: project?.orgId }, { $pull: { projects: project?._id } })

            // Deleting the project from its model
            const deletedProject = await Project.deleteOne({ _id: project?._id })
            if (deletedProject) {
                return res.status(200).json({ msg: "Successfully deleted!" });
            } else {
                return res.status(404).json({ msg: "Project not found" });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    });


// /project/:projectId/users:- Fetching and adding users using projectId
router.route("/:projectId/users").get(authUser, checkUser, async (req: Request, res: Response) => {
    const id = req.params.projectId;
    try {
        const project = await Project.findById(id).select("users");
        return res.status(200).json({ msg: "Successfully fetched the user's list", users: project?.users });
    } catch (error) {
        return res.status(404).json({ msg: "Project not found!", error });
    }
}).post(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
    const id = req.params.projectId;
    const userId = req.body.userId;
    try {
        // Add user id in projectDB
        await Project.findByIdAndUpdate(id, { $push: { users: userId } })
        // Add project id in UserDB
        await User.findByIdAndUpdate(userId, { $push: { projects: id } })
        return res.status(201).json({ msg: "Successfully added the user in project" });
    } catch (error) {
        return res.status(500).json({ msg: "Server Error!", error });
    }
});

export default router;