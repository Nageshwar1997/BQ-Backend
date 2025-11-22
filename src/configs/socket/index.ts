import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket, Namespace } from "socket.io";

import { allowedOrigins } from "../../constants";
import { AppError } from "../../classes";
import { ChatbotModule } from "../../modules";

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  if (io) return io;

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

  return io;
};

export const handleNamespace = (name: "products" | "orders") => {
  if (!io) throw new Error("Socket.IO not initialized");

  const nsp: Namespace = io.of(`/${name}`); // namespace created only when first client connects

  nsp.on("connection", (socket: Socket) => {
    console.log(`Client connected on /${name} namespace:`, socket.id);
    if (name === "products") {
      ChatbotModule.Sockets.initProductSocket(socket);
    } else if (name === "orders") {
      ChatbotModule.Sockets.initOrderSocket(socket);
    }

    socket.on("disconnect", () => {
      console.log(`Client disconnected from /${name} namespace:`, socket.id);
    });
  });

  return nsp;
};
