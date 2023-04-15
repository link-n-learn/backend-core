require("dotenv").config();

const { urlencoded } = require("express");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const Log = require("./Models/SysLogs");
const app = express();

mongoose.connect(process.env.MONGO_URI);

app.use(cors());
// app.use(formidableMiddleware());
app.use(express.json());
app.use(urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  const bodyCopy = JSON.parse(JSON.stringify(req.body));
  const headerCopy = JSON.parse(JSON.stringify(req.headers));
  headerCopy.authorization = undefined;
  bodyCopy.password = undefined;
  const logText =
    `{ "ip_remote":"` +
    req.socket.remoteAddress +
    `"}` +
    JSON.stringify(bodyCopy) +
    JSON.stringify(headerCopy) +
    JSON.stringify(headerCopy) +
    `{ "method":"` +
    req.method +
    `"}` +
    `{ "url":"` +
    req.url +
    `"}`;
  await Log.create({ log: logText });
  next();
});
const adminRoutes = require("./Routes/admin");
app.use("/admin", adminRoutes);
const authRoutes = require("./Routes/auth");
app.use("/auth", authRoutes);

const courseRoutes = require("./Routes/course");
app.use("/course", courseRoutes);

const userRoutes = require("./Routes/user");
app.use("/user", userRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ err: err.message });
});

app.all("*", (req, res) => {
  res.status(404).json({ err: "Resource not found" });
});

const httpPort = process.env.HTTP_PORT || 8000;

//Http server listen
app.listen(httpPort, () => {
  console.log(`App is listening on port ${httpPort}`);
});
