import { Router, Request, Response } from "express";
import Chat from "../db/Chat";
import User from "../db/User";
const router = Router();
import { messageType } from "../types";
import { Types } from "mongoose";
import { authUser } from "../middlewares/userAuth";

// Route /chat/:chatId -> For fetching chat with that id
router.route("/:chatId").get(authUser, async (req: Request, res: Response) => {
    const { chatId } = req.params;
    try {
        const chats = await Chat.findById(chatId)
        if (!chats) {
            return res.status(404).json({ msg: "Chats with that id not found" });
        }
        return res.status(200).json({ msg: "Successfully fetched the info!", chats });
    } catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!", error });
    }
})

// Route /chat -> Post request to create a new message
router.post("/", authUser, async (req: Request, res: Response) => {
    const { senderId, receiverId, receiverName, message } = req.body;

    try {
        // Finding the chat with sender and receiver id
        let chat = await Chat.findOne({
            userList: { $all: [senderId, receiverId] }
        });

        // If chat doesn't exist, create a new one
        if (!chat) {
            chat = await Chat.create({
                userList: [senderId, receiverId],
                messages: []
            });

            // Update the user db for both sender and receiver with new chatId
            await User.updateMany(
                { _id: { $in: [senderId, receiverId] } },
                { $push: { chatTo: { chatId: chat._id, name: receiverId, lastVis: Date.now() } } }
            );
        }

        // Add the new message to the chatDB
        const newMessage: messageType = {
            userId: new Types.ObjectId(senderId),
            name: receiverName as string,
            message: message as string,
            timestamp: new Date(Date.now())
        }
        chat.messages.push(newMessage);
        await chat.save();

        res.status(201).json({ message: 'Message sent successfully!', chat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;