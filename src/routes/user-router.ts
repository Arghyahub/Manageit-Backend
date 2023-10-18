import { Router, Request, Response } from "express";
import User from "../db/User";
import Project from "../db/Project";
import Organisation from "../db/Organisation";
const router = Router();

// Route /user/:userId 
router.route("/:userId").get(async (req: Request, res: Response) => {
    const id = req.params.userId;
    try {
        const user = await User.findById(id);
        return res.status(200).json({ msg: "Successfully fetched the user details!", user: user });
    } catch (error) {
        return res.status(404).json({ msg: "User is not found!" });
    }
}).put(async (req: Request, res: Response) => {
    const id = req.params.userId;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
        if (updatedUser) {
            return res.status(200).json({ msg: "Updated the user details!" });
        } else {
            return res.status(404).json({ msg: "User not found!" });
        }
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
}).delete(async (req: Request, res: Response) => {
    const id = req.params.userId;
    try {
        const user = await User.findById(id);

        // Remove the user ID from the projects they are part of
        await Project.updateMany({ users: user?._id }, { $pull: { users: user?._id } });

        // Remove the user ID from the organisation
        await Organisation.updateOne({ _id: user?.orgId }, { $pull: { users: user?._id } });

        // Delete the user from User model
        await User.deleteOne({ _id: user?._id });

        return res.status(200).json({ msg: "Successfully deleted the user!" });
    } catch (error) {
        return res.status(404).json({ msg: "User is not found!" });
    }
});

export default router;