import { Router, Request, Response } from "express";
import Organisation from "../db/Organisation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IOrganisation } from "../types";

const router = Router();
const secret = process.env.SECRET || "";

interface RequestWithOrg extends Request {
    user?: IOrganisation;
}

// Route for signup as an organisation
router.route("/signup").post(async (req: Request, res: Response) => {
    const { name, email, passwd } = req.body;
    if (!name || !email || !passwd) {
        return res.status(400).json({ msg: "Name, email, or password missing" });
    }
    try {
        const existingOrg = await Organisation.findOne({ email });
        if (existingOrg) {
            return res.status(409).json({ msg: "Organization already exists with this email" });
        }
        const hashedPasswd = await bcrypt.hash(passwd, 10);
        const newOrg: IOrganisation = new Organisation({
            name,
            email,
            passwd: hashedPasswd,
        });
        await newOrg.save();
        return res.status(201).json({ msg: "Organization signed up successfully" });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
});

// Route for login as organisation
router.route("/login").post(async (req: RequestWithOrg, res: Response) => {
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
        req.user = orgUser;
        return res.status(200).json({ msg: "Login successful as organisation", token: token, role: "owner" });
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
});

export default router;