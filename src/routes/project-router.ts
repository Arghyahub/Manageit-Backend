import { Router, Request, Response } from "express";
import Project from "../db/Project";
import User from "../db/User";
import Task from "../db/Task";
import Organisation from "../db/Organisation";
import { IProject, IUser, ITask, taskType } from "../types";
import checkAdmin from "../middlewares/adminAuth";
import { authUser, checkUser } from "../middlewares/userAuth";
import checkAdminInOrg from "../middlewares/orgAuth";
import { Types } from "mongoose";
import { taskNotification } from "../notification";

const router = Router();

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

// Todo: Implement pagination for get req for users and tasks array insted of sending it once with the get req for project

// /project :- Route for creating new projects
router.route("/").post(authUser, checkAdminInOrg, async (req: RequestWithUser, res: Response) => {
    try {
        const project: IProject = req.body;
        const newProject = new Project(project);

        // If user role is admin, then add the user info in projects db
        if (req.user?.role === "admin") {
            newProject.users?.push({ userId: req.user._id, name: req.user.name })
        }
        const savedProject = await newProject.save();

        // Add the project in the user's DB
        if (req.user && req.user.role === "admin")
            await User.findByIdAndUpdate(req.user._id, { $push: { projects: { projectId: savedProject._id, name: savedProject.name } } })

        // Save the project Id in the orgDB 
        const updated = await Organisation.findByIdAndUpdate(req.body.orgId, { $push: { projects: { projectId: savedProject._id, name: savedProject.name } } });
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
            if (!project) {
                return res.status(404).json({ msg: "Project not found" });
            }
            return res.status(200).json({ msg: "Successfully fetched the info!", project: project });
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    })
    .put(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
        const id = req.params.projectId;
        try {
            const updated = await Project.findByIdAndUpdate(id, req.body, { new: true })
            if (updated) {
                // Update project name in orgDb
                await Organisation.updateMany({ "projects.projectId": id }, { $set: { "projects.$.name": req.body.name } });
                // Update project name in userDb
                await User.updateMany({ "projects.projectId": id }, { $set: { "projects.$.name": req.body.name } });

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
            await Organisation.updateOne({ _id: project?.orgId }, { $pull: { projects: { projectId: project?._id, name: project?.name } } })

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
        if (!project) {
            return res.status(404).json({ msg: "Project not found!" });
        }
        return res.status(200).json({ msg: "Successfully fetched the user's list", users: project.users });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
}).post(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
    const id = req.params.projectId;
    const { userId, name } = req.body;

    if (!userId || !name) {
        return res.status(400).json({ msg: "Wrong Input Received!" });
    }

    try {
        // Add user id in projectDB
        const updatedProject = await Project.findByIdAndUpdate(id, { $push: { users: { userId: userId, name: name } } }, { new: true });

        if (!updatedProject) {
            return res.status(400).json({ msg: "Error while updating!" });
        }
        // Add project id in UserDB
        await User.findByIdAndUpdate(userId, { $push: { projects: { projectId: id, name: updatedProject?.name } } })
        return res.status(201).json({ msg: "Successfully added the user in project" });
    } catch (error) {
        return res.status(500).json({ msg: "Server Error!", error });
    }
}).delete(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { userId } = req.body;
    try {
        // Remove user from the project
        const updatedProject = await Project.findByIdAndUpdate(projectId, { $pull: { users: { userId: userId } } }, { new: true });
        if (!updatedProject) {
            return res.status(404).json({ msg: "Project not found!" });
        }

        // Remove project from the user
        const updatedUser = await User.findByIdAndUpdate(userId, { $pull: { projects: { projectId: projectId } } }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found!" });
        }

        return res.status(200).json({ msg: "User removed from the project!" });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
});

// /project/:projectId/task -> Get Route to fetch tasks from that project, Post route for creating a new task under the project
router.route("/:projectId/task")
    .get(authUser, checkUser, async (req: Request, res: Response) => {
        const { projectId } = req.params;
        let { status, assignTo } = req.query;

        try {
            if (status === 'pending' && assignTo) {
                const project = await Project.findById(projectId, 'tasks').exec();
                if (!project) {
                    return res.status(400).json({ msg: "Projects not found!" });
                }

                const tasksData = await Task.find({
                    _id: { $in: project?.tasks?.map(task => task.taskId) },
                    status: { $ne: 'Completed' },
                    "assignedTo.userId": new Types.ObjectId(assignTo.toString())
                }).exec();

                if (!tasksData) {
                    return res.status(400).json({ msg: "Tasks data not found!" });
                }

                const filteredTasks = tasksData.map(({ _id, status }) => ({ taskId: _id, status: status || "Assigned" }));
                
                return res.status(200).json({ msg: "Successfully fetched the tasks!", tasks: filteredTasks });
            }

            let tasks;
            if (status === 'Completed') {
                // Fetch only completed tasks for the project
                tasks = await Project.findById(projectId, 'tasks').where('tasks.status').equals('Completed').exec();
            } else if (status === 'Pending') {
                // Fetch all pending tasks for the project
                tasks = await Project.findById(projectId, 'tasks').where('tasks.status').ne('Completed').exec();
            } else {
                // Fetch all tasks for the project
                tasks = await Project.findById(projectId, 'tasks').exec();
            }

            return res.status(200).json({ msg: "Successfully fetched the tasks!", tasks });
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error!", error });
        }
    })
    .post(authUser, checkUser, checkAdmin, async (req: Request, res: Response) => {
        try {
            const projectId = req.body.projectId;
            const task: ITask = req.body;
            const newTask = new Task(task);
            const saveTask = await newTask.save();

            // Save the task in the project that it is part of
            const created = await Project.findByIdAndUpdate(projectId, { $push: { tasks: { taskId: saveTask._id, status: req.body.status || "assigned" } } });
            if (!created) {
                await Task.deleteOne({ _id: saveTask._id })
                return res.status(404).json({ msg: "Project not found, task can't be created!" });
            } else {
                if (task.assignedTo)
                    taskNotification(task.assignedTo)
                return res.status(201).json({ msg: "Successfully created the task!", task: newTask });
            }
        } catch (error) {
            return res.status(500).json({ msg: "Internal Server Error", error });
        }
    });

export default router;