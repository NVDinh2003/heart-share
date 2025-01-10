import { MoreHoriz } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../../redux/Store";

import { MessageMoreModal } from "../MessageMoreModal/MessageMoreModal";
import { MessageReactModal } from "../MessageReactModal/MessageReactModal";
import "./MessageContentOptions.css";
import { Message } from "../../../../utils/GlobalInterface";
import {
  hideMessage,
  reactToMessage,
  updateReplyToMessage,
} from "../../../../redux/Slices/MessagesSlice";
import ReactSVG from "../../../../components/SVGs/Messages/ReactSVG";
interface MessageContentOptionsProps {
  message: Message;
  usersMessage: boolean;
  updateMoreOpen: (open: boolean) => void;
  updateReactOpen: (open: boolean) => void;
}
export const MessageContentOptions: React.FC<MessageContentOptionsProps> = ({
  message,
  usersMessage,
  updateMoreOpen,
  updateReactOpen,
}) => {
  const { loggedIn, token } = useSelector((state: RootState) => state.user);
  const [displayReact, setDisplayReact] = useState<boolean>(false);
  const [displayMore, setDisplayMore] = useState<boolean>(false);
  const [reactDistance, setReactDistance] = useState<{
    bottom: number;
    right: number;
  }>({ bottom: 0, right: 0 });
  const [moreDistance, setMoreDistance] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [flipMore, setFlipMore] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const reactRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const watcherRef = useRef<HTMLDivElement>(null);
  const messageMore = () => {
    setDisplayMore(true);
    updateMoreOpen(true);
    if (moreRef && moreRef.current) {
      const top = moreRef.current.getBoundingClientRect().top;
      const left = moreRef.current.getBoundingClientRect().left;
      if (
        window.innerHeight - moreRef.current.getBoundingClientRect().top <
        176
      ) {
        setFlipMore(true);
      } else {
        setFlipMore(false);
      }
      setMoreDistance({ top, left });
    }
  };
  const react = () => {
    setDisplayReact(true);
    updateReactOpen(true);
    if (reactRef && reactRef.current) {
      const bottom =
        window.innerHeight - reactRef.current.getBoundingClientRect().top;
      const right =
        window.innerWidth -
        Math.round(reactRef.current.getBoundingClientRect().right);
      console.log(bottom, right);
      setReactDistance({ bottom, right });
    }
  };
  const messageReaction = (emoji: string) => {
    if (loggedIn && token) {
      dispatch(
        reactToMessage({
          user: loggedIn,
          message,
          reaction: emoji,
          token,
        })
      );
    }
    setDisplayReact(false);
    updateReactOpen(false);
  };
  const handleClickOutside = (e: any) => {
    if (
      watcherRef &&
      watcherRef.current &&
      !watcherRef.current.contains(e.target)
    ) {
      setDisplayReact(false);
      setDisplayMore(false);
      updateMoreOpen(false);
      updateReactOpen(false);
    }
  };
  const handleHideClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDisplayMore(false);
    updateMoreOpen(false);
    if (loggedIn && token) {
      dispatch(
        hideMessage({
          user: loggedIn,
          message,
          token,
        })
      );
    }
  };

  const handleCopyClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.messageText);
    updateMoreOpen(false);
    setDisplayMore(false);
  };

  const handleReplyClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dispatch(updateReplyToMessage(message));
    updateMoreOpen(false);
    setDisplayMore(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [watcherRef]);

  return (
    <div className="message-content-options-popup" ref={watcherRef}>
      <div className="message-content-react-options">
        {displayReact && (
          <MessageReactModal
            handleClick={messageReaction}
            distance={reactDistance}
            fromUser={usersMessage}
          />
        )}
        <div
          className="message-content-option-wrapper"
          ref={reactRef}
          onClick={react}
          id="messageReact"
        >
          <ReactSVG height={20} width={20} color="#657786" />
        </div>
      </div>
      <div
        className="message-content-option-wrapper"
        ref={moreRef}
        onClick={messageMore}
      >
        {displayMore && (
          <MessageMoreModal
            distance={moreDistance}
            fromUser={usersMessage}
            flipMore={flipMore}
            handleCopyClicked={handleCopyClicked}
            handleDeleteClicked={handleHideClicked}
            handleReplyClicked={handleReplyClicked}
            handleReportClicked={() => {}}
          />
        )}
        <MoreHoriz sx={{ height: "20px", width: "20px", color: "#657786" }} />
      </div>
    </div>
  );
};
