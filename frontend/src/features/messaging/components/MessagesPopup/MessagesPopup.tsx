import React, { useContext, useEffect, useRef, useState } from "react";

import "./MessagesPopup.css";
import {
  MessagingContext,
  MessagingContextType,
} from "../../context/MessagingContext";
import { MessagesBar } from "../MessagesBar/MessagesBar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/Store";
import {
  loadConversations,
  updateReplyToMessage,
} from "../../../../redux/Slices/MessagesSlice";
import { MessageConversationCard } from "../MessageConversationCard/MessageConversationCard";
import { ConversationContainer } from "../ConversationContainer/ConversationContainer";
import { CreateMessageBar } from "../CreateMessageBar/CreateMessageBar";
import Close from "@mui/icons-material/Close";

export const MessagesPopup: React.FC = () => {
  //
  const userState = useSelector((state: RootState) => state.user);
  const messageState = useSelector((state: RootState) => state.message);
  const [height, setHeight] = useState<string>("50px");
  const [minScrollHeight, setMinScrollHeight] = useState<number>(0);
  const dispatch: AppDispatch = useDispatch();

  const replySizeRef = useRef<HTMLDivElement>(null);
  const removeReplyTo = () => {
    dispatch(updateReplyToMessage(undefined));
  };

  useEffect(() => {
    if (userState.loggedIn && userState.token) {
      dispatch(
        loadConversations({
          userId: userState.loggedIn.userId,
          token: userState.token,
        })
      );
    }
  }, [userState.token, userState.loggedIn]);

  useEffect(() => {
    if (messageState.popupOpen) {
      setHeight("480px");
    } else {
      setHeight("50px");
    }
  }, [messageState.popupOpen]);

  useEffect(() => {
    if (replySizeRef && replySizeRef.current && messageState.replyToMessage) {
      setMinScrollHeight(replySizeRef.current.clientHeight);
    } else {
      setMinScrollHeight(0);
    }
  }, [replySizeRef, messageState.replyToMessage]);

  return (
    <div className="messages-popup-container">
      <div className={`messages-popup`} style={{ height }}>
        <MessagesBar />

        <div className="messages-popup-content-container">
          {messageState.popupOpen && (
            <div className="messages-popup-content">
              {messageState.conversationOpen && messageState.conversation ? (
                <ConversationContainer
                  conversation={messageState.conversation}
                  minHeight={minScrollHeight}
                />
              ) : (
                <>
                  {messageState.conversations.map((conversation) => {
                    return (
                      <MessageConversationCard
                        key={conversation.conversationId}
                        conversation={conversation}
                      />
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {messageState.replyToMessage && (
          <div className="messages-popup-reply-to" ref={replySizeRef}>
            <div>
              <p className="messages-popup-reply-to-nickname">
                {messageState.replyToMessage.sentBy.nickname}
              </p>
              <p className="messages-popup-reply-to-content">
                {messageState.replyToMessage.messageText}
              </p>
            </div>
            <div className="messages-popup-reply-to-right">
              {messageState.replyToMessage.messageImage && (
                <img
                  className="messages-popup-reply-to-image"
                  src={messageState.replyToMessage.messageImage}
                  alt="message image being replied to"
                />
              )}
              <div
                className="messages-popup-reply-to-close"
                onClick={removeReplyTo}
              >
                <Close sx={{ fontSize: "20px", color: "#657786" }} />
              </div>
            </div>
          </div>
        )}

        {/* input message area  */}
        {messageState.conversationOpen && messageState.popupOpen && (
          <CreateMessageBar />
        )}
      </div>
    </div>
  );
};
