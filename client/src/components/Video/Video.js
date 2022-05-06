import React, { useState, useEffect, useRef } from "react";

import io from "socket.io-client";

import ReactPlayer from "react-player";
const ENDPOINT = "localhost:5000";

const socket = io(ENDPOINT);

const Video = ({ playerRef, playerInfo, setPlayerInfo }) => {
  const time = useRef(null);

  const getTime = () => {
    console.log(time.current.getCurrentTime());
  };

  const HandlePlayPause = (playing) => {
    setPlayerInfo((prev) => ({
      ...prev,
      playing,
      time: playerRef.current.getCurrentTime(),
    }));
  };

  useEffect(() => {
    if (playerInfo.seeking) playerRef.current.seekTo(playerInfo.time);
    setPlayerInfo((prev) => ({
      ...prev,
      seeking: false,
    }));
  }, [playerInfo.seeking]);

  return (
    <div className="VideoContainer">
      <ReactPlayer
        url={playerInfo.url}
        playing={playerInfo.playing}
        controls={true}
        ref={playerRef}
        height="100vh"
        width="80vw"
        onPlay={() => {
          HandlePlayPause(true);
        }}
        onPause={() => {
          HandlePlayPause(false);
        }}
      />
    </div>
  );
};

export default Video;
