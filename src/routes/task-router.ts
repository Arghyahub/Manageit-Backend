import { Router, Request, Response } from "express";
const router = Router();

// Todo: Get, Post, Put, Delete for /:taskId route

// Testing Route
router.route("/").get((req: Request, res: Response) => {
    res.send("Hello from Task Router");
})

export default router;