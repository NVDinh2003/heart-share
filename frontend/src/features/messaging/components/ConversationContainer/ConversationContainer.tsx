import React, { useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../../redux/Store";

import "./ConversationContainer.css";
import { Conversation } from "../../../../utils/GlobalInterface";
import { ConversationUserInfo } from "../ConversationUserInfo/ConversationUserInfo";
import { filterConversationUsers } from "../../utils/utils";
import { MessageContainer } from "../MessageContainer/MessageContainer";
import { readMessages } from "../../../../redux/Slices/MessagesSlice";

export const ConversationContainer: React.FC<{
  conversation: Conversation;
  minHeight: number;
}> = ({ conversation, minHeight }) => {
  //
  const loggedIn = useSelector((state: RootState) => state.user.loggedIn);
  const token = useSelector((state: RootState) => state.user.token);

  const messages = useSelector(
    (state: RootState) => state.message.conversation?.conversationMessage
  );
  const unreadMessages = useSelector(
    (state: RootState) => state.message.unreadMessages
  );
  const conversationState = useSelector(
    (state: RootState) => state.message.conversation
  );
  const dispatch: AppDispatch = useDispatch();

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredConversationUsers = () => {
    if (loggedIn) {
      return filterConversationUsers(conversation.conversationUsers, loggedIn);
    }

    return conversation.conversationUsers;
  };

  useEffect(() => {
    console.log(messages);

    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (
      loggedIn &&
      token &&
      unreadMessages.some(
        (message) =>
          message.message &&
          messages &&
          message.message.conversationId === messages[0].conversationId
      )
    ) {
      dispatch(
        readMessages({
          userId: loggedIn.userId,
          conversationId: conversation.conversationId,
          token,
        })
      );
    }
  }, [messages?.length]);

  return (
    <div
      className="conversation-container"
      ref={scrollRef}
      style={{ minHeight: `${375 - minHeight}px` }}
    >
      {conversationState && conversationState.conversationUsers.length < 3 && (
        <ConversationUserInfo user={filteredConversationUsers()[0]} />
      )}

      <div className="conversation-messages">
        {conversationState &&
          conversationState.conversationMessage.map((message, idx) => {
            const showSent =
              idx === conversation.conversationMessage.length - 1;
            if (
              loggedIn &&
              message.hiddenBy &&
              !message.hiddenBy.some((u) => u.userId === loggedIn.userId)
            ) {
              return <MessageContainer message={message} showSent={showSent} />;
            }
            return <></>;
          })}
      </div>
      <div ref={scrollRef} className="conversation-container-bottom"></div>
    </div>
  );
};
