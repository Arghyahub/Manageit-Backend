import { Router, Request, Response } from "express";
import User from "../db/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser } from "../types";
import Organisation from "../db/Organisation";

const router = Router();
const secret = process.env.SECRET || "";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithUser extends Request {
    user?: IUser;
}

// /auth/signup: Signup for new users invited by the org
router.route("/signup").post(async (req: RequestWithUser, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: "Please enter correct email!" });
    }
    try {
        // Checking if user with that email already exists
        const userCount = await User.countDocuments({ email: email });
        if (userCount > 0) {
            return res.status(409).json({ msg: "User already exists with that email!", token: null });
        }
        // Checking if user exists as organisation
        const orgCount = await Organisation.countDocuments({ email: email });
        if (orgCount > 0) {
            return res.status(409).json({ msg: "User already exists as an organization", token: null });
        }
        const passwd = await bcrypt.hash(email, 10);
        const newUser: IUser = new User({
            name: req.body.name,
            email: email,
            passwd: passwd,
            role: req.body.role || "user",
            orgId: req.body.orgId
        })
        const savedUser = await newUser.save();

        // Adding the user id in the array inside OrganisationDB
        await Organisation.findByIdAndUpdate(req.body.orgId, { $push: { users: savedUser._id } })
        return res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
});

// /auth/login : Basic login route for admin/user
router.route("/login").post(async (req: RequestWithUser, res: Response) => {
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

        return res.status(200).json({ msg: "Login successful", token: token, role: user.role });
    } catch (error) {
        return res.status(500).json({ msg: "Internal server error", token: null, error });
    }
});

export default router;
