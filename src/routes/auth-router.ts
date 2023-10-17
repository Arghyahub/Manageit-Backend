import { Router, Request, Response } from "express";
import User from "../db/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser } from "../types";

const router = Router();
const secret = process.env.SECRET || "";

// Todo: Signup route for organization/owner

// For setting req.user as user, otherwise ts shows error as it can of any type
interface CustomRequest extends Request {
    user?: IUser;
}

// Basic login route for admin/user
router.route("/login").post(async (req: CustomRequest, res: Response) => {
    const { email, passwd } = req.body;
    if (!email || !passwd) {
        return res.status(400).json({ msg: "Email or password missing", token: null });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: "User not found", token: null });
        }

        const passValid = await bcrypt.compare(passwd, user.passwd);
        if (!passValid) {
            return res.status(401).json({ msg: "Incorrect password", token: null });
        }
        const token = jwt.sign({ id: user._id }, secret);
        req.user = user;

        return res.status(200).json({ msg: "Login successful", token: token, user });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ msg: "Internal server error", token: null });
    }
});

export default router;
