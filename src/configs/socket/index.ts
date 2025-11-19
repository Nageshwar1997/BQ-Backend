import { IncomingMessage, Server, ServerResponse } from "http";
import { Server as SocketIOServer, Namespace } from "socket.io";
import { AppError } from "../../classes";
import { allowedOrigins } from "../../constants";

export let io: SocketIOServer | null = null;
const namespaces: Record<string, Namespace> = {}; // store created namespaces

// Initialize Socket.IO
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
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

// Get or create a namespace
export const getNamespace = (name: string) => {
  if (!io) throw new Error("Socket.IO not initialized");

  if (!namespaces[name]) {
    const nsp = io.of(`/${name}`);

    nsp.on("connection", (socket) => {
      console.log(`Client connected to /${name} namespace:`, socket.id);

      socket.on("disconnect", () => {
        console.log(`Client disconnected from /${name}:`, socket.id);
      });

      // Handle custom events
      socket.on(`${name}_event`, (data) => {
        console.log(`[${name}] Event received:`, data);
        nsp.emit(`${name}_event`, data); // broadcast within namespace
      });
    });

    namespaces[name] = nsp;
  }

  return namespaces[name];
};
