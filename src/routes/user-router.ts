import { Router, Request, Response } from "express";
import User from "../db/User";
import { authUser } from "../middlewares/userAuth";
import checkAdmin from "../middlewares/adminAuth";
import { IUser } from "../types";
// import Project from "../db/Project";
// import Organisation from "../db/Organisation";

const router = Router();

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

// Route /user -> To be used by the user with auth token
router.route("/").get(authUser, async (req: RequestWithUser, res: Response) => {
    const id = req.user?.id;
    try {
        const user = await User.findById(id).select("-passwd");

        // Return the user details without passwd
        if (user) return res.status(200).json({ msg: "Successfully fetched the user details!", user: user });
        else return res.status(400).json({ msg: "Error fetching the details!" });
    } catch (error) {
        return res.status(404).json({ msg: "User is not found!" });
    }
}).put(authUser, async (req: RequestWithUser, res: Response) => {
    const id = req.user?.id;
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
});

// Delete Route for user: currently not required
// .delete(authUser, async (req: RequestWithUser, res: Response) => {
//     const id = req.user?.id;
//     try {
//         const user = await User.findById(id);

//         // Remove the user ID from the projects they are part of
//         await Project.updateMany({ users: user?._id }, { $pull: { users: user?._id } });

//         // Remove the user ID from the organisation
//         await Organisation.updateOne({ _id: user?.orgId }, { $pull: { users: user?._id } });

//         // Delete the user from User model
//         await User.deleteOne({ _id: user?._id });

//         return res.status(200).json({ msg: "Successfully deleted the user!" });
//     } catch (error) {
//         return res.status(404).json({ msg: "User is not found!" });
//     }
// });

// /user/:userId -> To get info of the user with that userId
router.route("/:userId").get(authUser, checkAdmin, async (req: Request, res: Response) => {
    const id = req.params.userId;
    try {
        const user = await User.findById(id).select("-passwd -chatTo");
        return res.status(200).json({ msg: "Successfully fetched the user details!", user: user });
    } catch (error) {
        return res.status(404).json({ msg: "User is not found!" });
    }
}).put(authUser, async (req: Request, res: Response) => {
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
});

export default router;