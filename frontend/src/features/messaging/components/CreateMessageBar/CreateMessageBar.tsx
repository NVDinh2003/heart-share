import React, { useEffect, useMemo, useRef, useState } from "react";

import "./CreateMessageBar.css";
import MediaSVG from "../../../../components/SVGs/MediaSVG";
import GIFSVG from "../../../../components/SVGs/GIFSVG";
import EmojiSVG from "../../../../components/SVGs/EmojiSVG";
import { ArrowForwardIos } from "@mui/icons-material";
import { convertPostContentToElements } from "../../../post/utils/PostUtils";
import { convertElementsToMessageText } from "../../../../utils/EmojiUtils";
import SendMessageSVG from "../../../../components/SVGs/Messages/SendMessageSVG";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/Store";
import { updateDisplayMessageGif } from "../../../../redux/Slices/ModalSlice";
import { MessageImage } from "../MessageImage/MessageImage";
import {
  sendMessage,
  updateGifUrl,
  sendReply,
} from "../../../../redux/Slices/MessagesSlice";
import {
  CreateMessageDTO,
  CreateMessageUser,
} from "../../../../utils/GlobalInterface";

export const CreateMessageBar: React.FC = () => {
  //
  const [showActions, setShowActions] = useState<boolean>(true);

  const { loggedIn, token } = useSelector((state: RootState) => state.user);
  const conversation = useSelector(
    (state: RootState) => state.message.conversation
  );
  const messageGif = useSelector((state: RootState) => state.message.gifUrl);

  const replyToMessage = useSelector(
    (state: RootState) => state.message.replyToMessage
  );

  const [messageImage, setMessageImage] = useState<File | null>(null);
  const [messageContent, setMessageContent] = useState<string>("");

  const dispatch: AppDispatch = useDispatch();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const textContent = (): JSX.Element[] => {
    let postContent = convertPostContentToElements(messageContent, "post");
    let messageElements = convertElementsToMessageText(postContent, "create");
    return messageElements;
  };

  const focusOnText = () => {
    if (textAreaRef && textAreaRef.current) textAreaRef.current.focus();
  };

  const calculateLineHeight = () => {
    if (textAreaRef && textAreaRef.current) {
      let lineHeight = 24;
      textAreaRef.current.style.lineHeight = `${lineHeight}px`;
      textAreaRef.current.style.height = "24px";

      let lineNumber = textAreaRef.current.scrollHeight / lineHeight;
      textAreaRef.current.style.height = lineNumber * lineHeight + "px";
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    calculateLineHeight();
    setMessageContent(e.target.value);
  };

  const handleGetImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMessageImage(e.target.files[0]);
    }
  };
  const sendActive = () => {
    return messageContent !== "" || messageImage || messageGif !== null;
  };
  const displayGif = () => {
    dispatch(updateDisplayMessageGif());
  };

  const messageImageContainer = useMemo(() => {
    if (messageImage)
      return (
        <MessageImage
          image={messageImage}
          removeImage={() => setMessageImage(null)}
        />
      );
  }, [messageImage]);

  const messageGifContainer = useMemo(() => {
    if (messageGif)
      return <MessageImage removeImage={() => dispatch(updateGifUrl(null))} />;
  }, [messageGif]);

  const handleSendMessage = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const send = sendActive();

    if (send && loggedIn && token && conversation) {
      //

      const sentBy: CreateMessageUser = {
        userId: loggedIn.userId,
        firstName: loggedIn.firstName,
        lastName: loggedIn.lastName,
        email: loggedIn.email,
        username: loggedIn.username,
        bio: loggedIn.bio,
        nickname: loggedIn.nickname,
        profilePicture: loggedIn.profilePicture,
      };

      const createMessageConvo = {
        conversationId: conversation.conversationId,
        conversationUsers: conversation.conversationUsers.map((user) => {
          return {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            bio: user.bio,
            nickname: user.nickname,
            profilePicture: user.profilePicture,
          };
        }),
        conversationPicture: conversation.conversationPicture,
        conversationName: conversation.conversationName,
        conversationMessage: conversation.conversationMessage.map((message) => {
          return {
            messageType: message.messageType,
            sentBy: {
              userId: message.sentBy.userId,
              firstName: message.sentBy.firstName,
              lastName: message.sentBy.lastName,
              email: message.sentBy.email,
              username: message.sentBy.username,
              bio: message.sentBy.bio,
              nickname: message.sentBy.nickname,
              profilePicture: message.sentBy.profilePicture,
            },
            conversation: {
              conversationId: message.conversationId,
            },
            messageText: message.messageText,
            messageImage: message.messageImage,
          };
        }),
      };

      const messagePayload: CreateMessageDTO = {
        messageType: replyToMessage ? "REPLY" : "MESSAGE",
        sentBy,
        conversation: createMessageConvo,
        text: messageContent,
        gifUrl: messageGif,
      };

      if (replyToMessage) {
        dispatch(
          sendReply({
            messagePayload,
            image: messageImage,
            replyTo: `${replyToMessage.messageId}`,
            token,
          })
        );
      } else {
        dispatch(
          sendMessage({
            messagePayload,
            image: messageImage,
            token,
          })
        );
      }

      if (textAreaRef && textAreaRef.current) {
        textAreaRef.current.value = "";
        setMessageContent("");
        setMessageImage(null);
        dispatch(updateGifUrl(null));
      }
    }
  };

  useEffect(() => {
    calculateLineHeight();
  }, [showActions, messageContent, messageImage, messageGif]);

  return (
    <div className="create-message-bar">
      <div className="create-message-bar-bg">
        {!messageImage && messageGif === null && (
          <div>
            {showActions ? (
              <div className="create-message-bar-action-wrapper">
                <div>
                  <input
                    onChange={handleGetImage}
                    type="file"
                    id="message-image"
                    accept="image/*"
                    hidden
                  />
                  <label
                    htmlFor="message-image"
                    className="create-message-bar-icon-wrapper"
                  >
                    <MediaSVG
                      height={20}
                      width={20}
                      color="rgb(29, 155, 240)"
                    />
                  </label>
                </div>
                <div
                  className="create-message-bar-icon-wrapper"
                  onClick={displayGif}
                >
                  <GIFSVG height={20} width={20} color="rgb(29, 155, 240)" />
                </div>
                <div className="create-message-bar-icon-wrapper">
                  <EmojiSVG height={20} width={20} color="rgb(29, 155, 240)" />
                </div>
              </div>
            ) : (
              <div className="create-message-bar-icon-wrapper">
                <ArrowForwardIos
                  sx={{
                    height: "20px",
                    width: "20px",
                    color: "rgb(29, 155, 240)",
                  }}
                />
              </div>
            )}
          </div>
        )}
        <div style={{ marginLeft: `${messageImage ? "12px" : "0px"}` }}>
          {/* Message images  */}
          {messageImage && messageImageContainer}
          {messageGif !== null && messageGifContainer}

          <div className="create-message-bar-text-area">
            {messageContent !== "" && (
              <div
                className="create-message-bar-text-area-content"
                onClick={focusOnText}
              >
                {textContent()}
              </div>
            )}
            <textarea
              className={`create-message-bar-text-area-input ${
                showActions
                  ? "create-message-bar-text-input-deactive"
                  : "create-message-bar-text-input-active"
              }`}
              placeholder="Start a new message"
              ref={textAreaRef}
              onChange={handleTextChange}
              onFocus={() => setShowActions(false)}
              onBlur={() => setShowActions(true)}
              value={messageContent}
            />
          </div>
        </div>
        <div
          className={`create-message-bar-send-icon ${
            sendActive() ? "send-icon-active" : ""
          }`}
          onClick={handleSendMessage}
        >
          <SendMessageSVG
            height={20}
            width={20}
            color={
              sendActive() ? "rgb(29, 155, 240)" : "rgba(29, 155, 240, .5)"
            }
          />
        </div>
      </div>
    </div>
  );
};
