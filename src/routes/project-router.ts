import { Router, Request, Response } from "express";
const router = Router();

// Todo: Get, Post, Put, Delete for /:projectId route

// Testing Route
router.route("/").get((req: Request, res: Response) => {
    res.send("Hello from Project Router");
})

export default router;