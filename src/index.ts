import express, { Request, Response } from "express";
import { json } from "body-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import conversationsRoutes from "./routes/conversationsRoutes";
import messagesRoutes from "./routes/messagesRoutes";
import { saveMessage } from "./controllers/messagesController";
import contactsRoutes from "./routes/contactsRoutes";

const app = express();
const server = http.createServer(app);
app.use(json());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

app.use("/auth", authRoutes);
app.use("/conversations", conversationsRoutes);
app.use("/messages", messagesRoutes);
app.use("/contacts", contactsRoutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log("User joinConversation : " + conversationId);
  });

  socket.on("sendMessage", async (message) => {
    const { conversationId, senderId, content } = message;

    try {
      const savedMessage = await saveMessage(conversationId, senderId, content);
      console.log("sendMessage :");
      console.log(savedMessage);
      io.to(conversationId).emit("newMessage", savedMessage);

      io.emit("conversationUpdated", {
        conversationId,
        lastMessage: savedMessage.content,
        lastMessageTime: savedMessage.created_at,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected :", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Service is run on port ${PORT}`);
});
