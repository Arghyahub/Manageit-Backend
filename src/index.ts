require("dotenv").config();
import express from "express";
import cors from "cors";
const port = 8000;

const app = express();
app.use(express.json());
app.use(cors());

// Routes
import authRoutes from "./routes/auth-router";
import projectRoutes from "./routes/project-router";
import orgRoutes from "./routes/org-router";
import userRoutes from "./routes/user-router";
import taskRoutes from "./routes/task-router";
import chatRoutes from "./routes/chat-router";

app.use("/auth", authRoutes)
app.use("/project", projectRoutes);
app.use("/org", orgRoutes);
app.use("/user", userRoutes);
app.use("/task", taskRoutes);
app.use("/chat", chatRoutes);

// Connect to database
import connectDB from "./db/index";
connectDB();

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})

import { Server } from 'socket.io';
const io = new Server(server, {
    pingTimeout: 120000,
    cors: {
      origin: 'http://localhost:5173',
    },
});

io.on('connection', (socket)=> {
    // socket.join('RootRoom') ;
    // console.log("User connected" + socket.id) ;
    socket.on('join',(roomid)=> {
        socket.join(roomid) ;
    })

    socket.on('new-chat',({recID, sender, msg}) => {
        socket.to(recID).emit('recieved-msg',recID,sender,msg) ;
    })

    socket.on('addFriends',(allUsers,roomId) => {
        console.log(allUsers) ;
        console.log(roomId) ;
        socket.to('RootRoom').emit('joinRoom',allUsers,roomId) ;
    })
})

