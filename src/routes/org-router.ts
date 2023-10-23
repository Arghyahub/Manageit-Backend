import { Router, Request, Response } from "express";
import Organisation from "../db/Organisation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IOrganisation } from "../types";
import { authUser } from "../middlewares/userAuth";

const router = Router();
const secret = process.env.SECRET || "";

// For setting req.user as user, otherwise ts shows error as it can of any type
interface RequestWithOrg extends Request {
    user?: IOrganisation;
}

// /org/signup :- Route for signup as an organisation
router.route("/signup").post(async (req: Request, res: Response) => {
    const { name, email, passwd } = req.body;
    if (!name || !email || !passwd) {
        return res.status(400).json({ msg: "Name, email, or password missing" });
    }
    try {
        const orgCount = await Organisation.countDocuments({ email: email });
        if (orgCount > 0) {
            return res.status(409).json({ msg: "Organization already exists with this email" });
        }
        const hashedPasswd = await bcrypt.hash(passwd, 10);
        const newOrg: IOrganisation = new Organisation({
            name,
            email,
            passwd: hashedPasswd,
        });
        await newOrg.save();
        const token = jwt.sign({ id: newOrg._id }, secret)
        return res.status(201).json({ msg: "Organization signed up successfully", token: token, role: "owner" });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
});

// /org/login :- Route for login as organisation
router.route("/login").post(async (req: Request, res: Response) => {
    const { email, passwd } = req.body;
    if (!email || !passwd) {
        return res.status(400).json({ msg: "Email or password missing", token: null });
    }
    try {
        const orgUser = await Organisation.findOne({ email })
        if (!orgUser) {
            return res.status(404).json({ msg: "Organisation not found!", token: null });
        }
        const passValid = await bcrypt.compare(passwd, orgUser.passwd);
        if (!passValid) {
            return res.status(401).json({ msg: "Incorrect password", token: null });
        }
        const token = jwt.sign({ id: orgUser._id }, secret)
        return res.status(200).json({ msg: "Login successful as organisation", token: token, role: "owner" });
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
});

// /org :- Route for fetching organisation details using the token
router.route("/").get(authUser, async (req: RequestWithOrg, res: Response) => {
    const id = req.user?.id;
    try {
        const org = await Organisation.findById(id).select("-passwd");
        if (org) return res.status(200).json({ msg: "Successfully fetched the org details", org: org });
        else return res.status(400).json({ msg: "Error while fetching details!" });

    } catch (error) {
        return res.status(404).json({ msg: "Organisation not found!", error });
    }
});

// /org/:orgId :- Route for fetching specific organisation details
router.route("/:orgId").get(authUser, async (req: Request, res: Response) => {
    const id = req.params.orgId;
    try {
        const org = await Organisation.findById(id).select("-passwd");
        return res.status(200).json({ msg: "Successfully fetched the org details", org: org });
    } catch (error) {
        return res.status(404).json({ msg: "Organisation not found!", error });
    }
});

// /org/:orgId/users :- Route for fetching users list in the org
router.route("/:orgId/users").get(authUser, async (req: Request, res: Response) => {
    const id = req.params.orgId;
    try {
        const org = await Organisation.findById(id).select("users");
        return res.status(200).json({ msg: "Successfully fetched the user's list", users: org?.users });
    } catch (error) {
        return res.status(404).json({ msg: "Organisation not found!", error });
    }
});

export default router;