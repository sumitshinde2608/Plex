const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getUserByID,
} = require("./users");

const router = require("./router");
const { isObject } = require("util");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

//Setting up inital connection between sockets
io.on("connect", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);
    const userinRoom = getUsersInRoom(user.room);
    socket.join(user.room);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });
    // socket.emit('realtime',{user.time})
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    console.log(userinRoom);
    if (userinRoom.length >= 2) {
      console.log(userinRoom[0]);
      io.to(userinRoom[0].id).emit("requestPlayerInfo");
    }

    callback();
  });

  socket.on("sendPlayerState", (playerInfo, callback) => {
    const user = getUserByID(socket.id);
    console.log(user);
    if (user.length >= 1) {
      io.in(user[0].room).emit("getPlayerInfo", playerInfo);
    } else {
      callback();
    }
  });

  socket.on("setPlayPause", (playerInfo, callback) => {
    const user = getUserById(socket.id);
    if (user.length >= 1) {
      io.in(user[0].room).emit("getPlayerInfo", playerInfo);
    }
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
