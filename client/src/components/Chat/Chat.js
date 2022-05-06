import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Video from "../Video/Video";

import "./Chat.css";

const ENDPOINT = "localhost:5000";

let socket;

const Chat = ({ location }) => {
  const { name, room, URL } = queryString.parse(location.search);

  const [users, setUsers] = useState("");
  const [firstTime, setFirstTime] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const playerRef = useRef(0);
  const [playerData, SetPlayerData] = useState({
    url: URL,
    playing: false,
    time: 0,
    seeking: false,
  });

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("join", { name, room, URL }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  useEffect(() => {
    socket.on("requestPlayerInfo", () => {
      // console.log("Ftr");
      socket.emit(
        "sendPlayerState",
        {
          url: playerRef.current.props.url,
          time: playerRef.current.getCurrentTime(),
          playing: playerRef.current.props.playing,
        },
        (response) => {
          console.log(response);
        }
      );
      console.log(playerRef.current.getCurrentTime());
    });
  }, []);

  let trys = "";
  useEffect(() => {
    socket.on("getPlayerInfo", (playerInfo) => {
      console.log(playerInfo);

      SetPlayerData({ ...playerInfo, seeking: true });
    });
  }, []);

  useEffect(() => {
    socket.on("getPlayPause", (playerInfo) => {
      SetPlayerData({ ...playerInfo, seeking: true });
    });
  });

  useEffect(() => {
    console.log(playerData);
    if (firstTime) {
      setFirstTime(false);
      return;
    }
    if (playerData.seeking) return;
    socket.emit("sendPlayerState", playerData, (response) => {});
  }, [playerData.playing]);

  return (
    <div className="outerContainer">
      <Video
        playerRef={playerRef}
        playerInfo={playerData}
        setPlayerInfo={SetPlayerData}
      />
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
