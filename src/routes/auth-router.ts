import { Router, Request, Response } from "express";
import User from "../db/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser } from "../types";
import Organisation from "../db/Organisation";

const router = Router();
const secret = process.env.SECRET || "";

// /auth/signup :- Signup for new users invited by the org
router.route("/signup").post(async (req: Request, res: Response) => {
    const { name, email, orgId, role } = req.body;
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

        // Creating a new user
        const passwd = await bcrypt.hash(email, 10);
        const newUser: IUser = new User({
            name: name,
            email: email,
            passwd: passwd,
            role: role || "user",
            orgId: orgId
        })
        const savedUser = await newUser.save();

        // Adding the user id in the array inside OrganisationDB
        const saved = await Organisation.findByIdAndUpdate(orgId, { $push: { users: savedUser._id } })
        if (!saved) {
            await User.deleteOne({ _id: savedUser._id });
            return res.status(404).json({ msg: "Organisation not found, user can't be created!" });
        }
        return res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
});

// /auth/login :- Basic login route for admin/user
router.route("/login").post(async (req: Request, res: Response) => {
    const { email, passwd } = req.body;
    if (!email || !passwd) {
        return res.status(400).json({ msg: "Email or password missing", token: null });
    }

    try {
        // Checking if user does not exist
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: "User not found", token: null });
        }

        // Checking if the password is valid
        const passValid = await bcrypt.compare(passwd, user.passwd);
        if (!passValid) {
            return res.status(401).json({ msg: "Incorrect password", token: null });
        }
        const token = jwt.sign({ id: user._id }, secret);

        return res.status(200).json({ msg: "Login successful", token: token, role: user.role });
    } catch (error) {
        return res.status(500).json({ msg: "Internal server error", token: null, error });
    }
});

export default router;
