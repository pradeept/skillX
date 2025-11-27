import "dotenv/config";
import express from "express";
import { authRouter } from "./src/domains/auth/auth.routes.ts";
import { errorHandler } from "./src/middlewares/errorHandler.ts";
import cookieParser from "cookie-parser";
import { profileRouter } from "./src/domains/profile/profile.routes.ts";
import { skillRouter } from "./src/domains/skill/skill.routes.ts";
import { getRedisClient } from "./src/configs/redis/redis.ts";
import notificationSocket from "./src/configs/socket.io/socket.ts";
import http from "http";
import { sessionRequestRouter } from "./src/domains/session-request/sessionRequest.routes.ts";
import { sessionRouter } from "./src/domains/session/session.routes.ts";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// initialize redis
const rc = await getRedisClient();
if (!rc) console.error("Redis is not connected");

// initialize socket
const server = http.createServer(app);

// attach notification socket logic to the HTTP server
const notificationMiddleware = await notificationSocket(server);
app.use(notificationMiddleware);

// routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/skill", skillRouter);
app.use("/api/session-request", sessionRequestRouter);
app.use("/api/session", sessionRouter);

app.use(errorHandler); //error handler

/*
why not app.listen ?
app.listen uses = http.createServer(app) under the hood
and socket.io requires http server instance.
*/
server.listen(process.env.PORT, () => {
  console.log(`Listenting on port: ${process.env.PORT}`);
});
