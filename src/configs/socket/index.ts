import { IncomingMessage, Server, ServerResponse } from "http";
import { Server as SocketIOServer } from "socket.io";
import { AppError } from "../../classes";
import { allowedOrigins } from "../../constants";

export let io: SocketIOServer | null = null;

// Initialize Socket.IO only when called
export const initSocket = (
  server: Server<typeof IncomingMessage, typeof ServerResponse>
) => {
  if (io) return io; // Prevent re-initialization

  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new AppError("Not allowed by CORS", 403));
        }
      },
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    socket.on("chat_message", (msg) => {
      console.log("Received message:", msg);
      io?.emit("chat_message", msg); // broadcast to all clients
    });
  });

  return io;
};
