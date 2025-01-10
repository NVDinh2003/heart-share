import { Pause, PlayArrow } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";

import "./MessageConversationImage.css";
import { Message } from "../../../../utils/GlobalInterface";
export const MessageConversationImage: React.FC<{
  message: Message;
  width: number;
  height?: number;
}> = ({ message, width, height }) => {
  const { messageImage } = message;
  const [isGif, setIsGif] = useState<boolean>(() => {
    let messageImageSplit = messageImage.split(".");
    let extension = messageImageSplit[messageImageSplit.length - 1];
    return extension === "gif" || extension === "GIF";
  });
  const [playGif, setPlayGif] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundLink = () => {
    if (!playGif && isGif) return "";
    return messageImage;
  };
  const freezeGif = () => {
    if (canvasRef && canvasRef.current && imageRef && imageRef.current) {
      const height = 155;
      const width = 275;
      canvasRef.current.height = height;
      canvasRef.current.width = width;
      const context = canvasRef.current.getContext("2d");
      if (context !== null) {
        let scale = Math.min(
          width / imageRef.current.width,
          height / imageRef.current.height
        );
        let w = Math.round(imageRef.current.width * scale);
        let h = Math.round(imageRef.current.height * scale);
        let left = width / 2 - w / 2;
        let top = height / 2 - h / 2;
        context.drawImage(imageRef.current, left, top, w, h);
      }
    }
  };
  const playPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayGif((play) => !play);
  };
  useEffect(() => {
    if (!playGif) freezeGif();
  }, [isGif, playGif]);
  return (
    <div
      className="message-conversation-image"
      style={{ backgroundImage: `url(${backgroundLink()})`, width, height }}
      onClick={playPause}
    >
      {isGif && !playGif && (
        <div>
          <img src={messageImage} ref={imageRef} hidden />
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
      {isGif && (
        <div className="message-conversation-image-gif-controls">
          <div className="message-conversation-image-gif-control-wrapper">
            {playGif ? (
              <Pause sx={{ color: "white", fontSize: "18px" }} />
            ) : (
              <PlayArrow sx={{ color: "white", fontSize: "18px" }} />
            )}
          </div>
          <p className="message-conversation-image-gif-text">GIF</p>
        </div>
      )}
    </div>
  );
};
