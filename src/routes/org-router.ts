import { Router, Request, Response } from "express";
const router = Router();

// Testing Route
router.route("/").get((req: Request, res: Response) => {
    res.send("Hello from org Router");
})

export default router;