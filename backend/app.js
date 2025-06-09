import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import mongoose from "mongoose";
import morgan from "morgan";

import { notFound, errorHandler } from "./middlewares.mjs";
import AppRouter from "./api/appRouter.mjs";
import ChatInterface from "./api/chatApp/chatInterface.mjs";

dotenv.config();

// Setting up express & must use middleware
let app = express();
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // When using something like nginx or apache as a proxy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": [
          "'self'",
          "ws:",
          "*.bootstrapcdn.com",
          "*.googleapis.com",
          "*.gstatic.com",
        ],
        "script-src": [
          "'self'",
          "*.bootstrapcdn.com",
          "*.cloudflare.com",
          "*.jquery.com",
          "*.googleapis.com",
        ],
        "img-src": ["'self'", "data:", "blob:", "*.w3.org"],
      },
    },
  })
); // Adds extra security
app.use(errorHandler);
app.use("/api", AppRouter);

// Basic Routing
app.get("/robots.txt", (req, res) =>
  res.sendFile("robots.txt", { root: __dirname })
);
app.get("*", (req, res) =>
  res.sendFile("index.html", { root: __dirname + "/../build/" })
);

mongoose
  .set("strictQuery", false)
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => console.log(err));

// Setting up node js server
let port = process.env.PORT || 3003;
let httpServer = http.createServer(app);

const io = new Server(httpServer, {
  transports: ["polling"],
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user is connected");
  console.log(socket.id);
  ChatInterface.register(io, socket);
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
