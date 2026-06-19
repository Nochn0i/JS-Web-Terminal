const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const pty = require("node-pty");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

const shell = "bash";

io.on("connection", (socket) => {
  console.log("[*] Client connected to terminal.");

  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.onData((data) => {
    socket.emit("terminal-output", data);
  });

  socket.on("terminal-input", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    ptyProcess.kill();
    console.log("[!] Client disconnected.");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
