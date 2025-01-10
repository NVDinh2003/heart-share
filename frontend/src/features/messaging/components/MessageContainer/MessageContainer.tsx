import React, { useEffect, useRef, useState } from "react";

import "./MessageContainer.css";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/Store";
import ProfilePicture from "../../../../components/ProfilePicture/ProfilePicture";
import { Circle, MoreHoriz, Redo, Undo } from "@mui/icons-material";
import {
  getDayOfWeek,
  lessThanDay,
  lessThanWeek,
  stringifyDate,
  stringifyTime,
} from "../../../../utils/DateUtils";

import { MessageConversationImage } from "../MessageConversationImage/MessageConversationImage";

import { MessageReactionContainer } from "../MessageReactionContainer/MessageReactionContainer";
import { MessageContentOptions } from "../MessageContentOptions/MessageContentOptions";
import { Conversation, Message } from "../../../../utils/GlobalInterface";
import { convertPostContentToElements } from "../../../post/utils/PostUtils";
import { convertElementsToMessageText } from "../../../../utils/EmojiUtils";
import { MessageSeenByPopup } from "../MessageSeenByPopup/MessageSeenByPopup";

export const MessageContainer: React.FC<{
  message: Message;
  showSent: boolean;
}> = ({ message, showSent }) => {
  const { loggedIn, token } = useSelector((state: RootState) => state.user);
  const conversation = useSelector(
    (state: RootState) => state.message.conversation
  );
  const [messageHover, setMessageHover] = useState<boolean>(false);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [reactOpen, setReactOpen] = useState<boolean>(false);

  const usersMessage = () => {
    return message.sentBy.userId === loggedIn?.userId;
  };

  const sentAt = () => {
    const sentAtDate = new Date(message.sentAt);
    const time = stringifyTime(sentAtDate);

    if (lessThanDay(sentAtDate, new Date())) {
      return time;
    } else if (lessThanWeek(sentAtDate, new Date())) {
      const day = getDayOfWeek(sentAtDate);
      return `${day} ${time}`;
    } else {
      const fullDate = stringifyDate({
        month: sentAtDate.getMonth(),
        day: sentAtDate.getDate(),
        year: sentAtDate.getFullYear(),
      });

      return `${fullDate}, ${time}`;
    }
  };

  const textContent = (): JSX.Element[] => {
    let postContent = convertPostContentToElements(message.messageText, "post");
    let messageElements = convertElementsToMessageText(
      postContent,
      "container"
    );
    return messageElements;
  };

  const updateMoreOpen = (open: boolean) => {
    setMoreOpen(open);
  };

  const updateReactOpen = (open: boolean) => {
    setReactOpen(open);
  };

  const replyToTextContent = (): JSX.Element[] => {
    if (message.replyTo) {
      let postContent = convertPostContentToElements(
        message.replyTo.messageText,
        "post"
      );
      let messageElements = convertElementsToMessageText(
        postContent,
        "container"
      );
      return messageElements;
    } else {
      return [];
    }
  };
  const getColor = (): "blue" | "gray" => {
    return usersMessage() ? "blue" : "gray";
  };

  return (
    <div className="message-container">
      <div
        style={{ flexDirection: usersMessage() ? "row-reverse" : "row" }}
        className="message-container-hover-area"
        onMouseOver={() => setMessageHover(true)}
        onMouseLeave={() => setMessageHover(false)}
      >
        {message.replyTo ? (
          <ReplyMessage
            message={message}
            usersMessage={usersMessage()}
            replyToText={replyToTextContent()}
            textContent={textContent()}
          />
        ) : (
          <MessageComponent
            message={message}
            displayPfp={!usersMessage()}
            color={getColor()}
            textContent={textContent()}
          />
        )}
        {(messageHover || moreOpen || reactOpen) && (
          <MessageContentOptions
            message={message}
            usersMessage={usersMessage()}
            updateMoreOpen={updateMoreOpen}
            updateReactOpen={updateReactOpen}
          />
        )}
      </div>
      <div
        style={{
          justifySelf: usersMessage() ? "flex-end" : "flex-start",
          marginLeft: usersMessage() ? "0px" : "40px",
          marginTop: "4px",
        }}
      >
        {message.reactions && message.reactions.length > 0 && (
          <MessageReactionContainer message={message} />
        )}
        {conversation && (
          <MessageSubtitle
            message={message}
            conversation={conversation}
            usersMessage={usersMessage()}
            sentAt={sentAt()}
            showSent={showSent}
          />
        )}
      </div>
    </div>
  );
};

interface MessageComponentProps {
  message: Message;
  color: "blue" | "gray";
  displayPfp: boolean;
  textContent: JSX.Element[];
}

const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  color,
  displayPfp,
  textContent,
}) => {
  return (
    <div className="message">
      {displayPfp && <ProfilePicture user={message.sentBy} size={"40px"} />}
      <div>
        {message.messageImage && (
          <MessageConversationImage
            message={message}
            width={displayPfp ? 223 : 275}
          />
        )}
        {message.messageText !== "" && (
          <div
            className={`message-content message-${color} message-${
              color === "blue" ? "right" : "left"
            }-border`}
          >
            {textContent}
          </div>
        )}
      </div>
    </div>
  );
};

interface MessageSubtitleProps {
  message: Message;
  conversation: Conversation;
  usersMessage: boolean;
  sentAt: string;
  showSent: boolean;
}

const MessageSubtitle: React.FC<MessageSubtitleProps> = ({
  message,
  conversation,
  usersMessage,
  sentAt,
  showSent,
}) => {
  const [showSeenByPopup, setShowSeenByPopup] = useState<boolean>(false);
  const [popupBottom, setPopupBottom] = useState<number>(0);
  const [popupTop, setPopupTop] = useState<number>(0);
  const [popupLeft, setPopupLeft] = useState<number>(0);
  const [flipPopup, setFlipPopup] = useState<boolean>(false);
  const seenByRef = useRef<HTMLSpanElement>(null);
  const openSeenPopup = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (seenByRef && seenByRef.current) {
      const { top, right, bottom, left } =
        seenByRef.current.getBoundingClientRect();
      const distanceToBottom = window.innerHeight - bottom;
      setPopupLeft(left - 120);
      if (distanceToBottom < 204) {
        setFlipPopup(true);
        setPopupBottom(distanceToBottom + 32);
      } else {
        setFlipPopup(false);
        setPopupTop(bottom + 16);
      }
    }
    setShowSeenByPopup(true);
  };

  return (
    <div className={`message-subtitle`}>
      {usersMessage ? (
        <>
          {showSeenByPopup && message.seenBy && message.seenBy.length > 0 && (
            <MessageSeenByPopup
              users={message.seenBy}
              flipPopup={flipPopup}
              bottom={popupBottom}
              top={popupTop}
              left={popupLeft}
              handleClose={() => setShowSeenByPopup(false)}
            />
          )}

          {sentAt}
          {(showSent || (message.seenBy && message.seenBy.length !== 0)) && (
            <Circle sx={{ fontSize: "4px", color: "#657786" }} />
          )}
          {showSent && message.seenBy && message.seenBy.length === 0 && (
            <>Sent</>
          )}
          {conversation &&
            conversation.conversationUsers.length > 2 &&
            message.seenBy &&
            message.seenBy.length > 0 && (
              <span
                className="message-seen-by"
                ref={seenByRef}
                onClick={openSeenPopup}
              >
                Seen by {message.seenBy.length}{" "}
                {message.seenBy.length < 2 ? "person" : "people"}
              </span>
            )}
        </>
      ) : (
        <>
          {message.sentBy.nickname}
          <Circle sx={{ fontSize: "4px", color: "#657786" }} />
          {sentAt}
        </>
      )}
    </div>
  );
};

interface ReplyMessageProps {
  message: Message;
  usersMessage: boolean;
  replyToText: JSX.Element[];
  textContent: JSX.Element[];
}
const ReplyMessage: React.FC<ReplyMessageProps> = ({
  message,
  usersMessage,
  replyToText,
  textContent,
}) => {
  const calculateReplyMessageStyles = () => {
    return {
      maxWidth: usersMessage ? "275px" : "223px",
      justifySelf: usersMessage ? "flex-end" : "flex-start",
      alignItems: usersMessage ? "flex-end" : "flex-start",
    };
  };

  return (
    <div>
      {message.replyTo ? (
        <div className="reply-message" style={calculateReplyMessageStyles()}>
          <div className="reply-message-to">
            {usersMessage ? (
              <Undo sx={{ fontSize: "10px", color: "#657786" }} />
            ) : (
              <Redo sx={{ fontSize: "10px", color: "#657786" }} />
            )}
            Replying to {message.replyTo?.sentBy.nickname}
          </div>
          {message.replyTo.messageText === "" ? (
            <MessageConversationImage
              message={message.replyTo}
              width={usersMessage ? 270 : 223}
            />
          ) : (
            <div
              className={`reply-message-container message-${
                usersMessage ? "right" : "left"
              }-border`}
            >
              <div className="reply-message-text">{replyToText}</div>
              {message.replyTo.messageImage && (
                <img
                  src={message.replyTo.messageImage}
                  width={32}
                  height={18}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      <MessageComponent
        message={message}
        color={usersMessage ? "blue" : "gray"}
        displayPfp={!usersMessage}
        textContent={textContent}
      />
    </div>
  );
};
