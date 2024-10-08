import React, { useState } from "react";

import "./CreateMessageModalTop.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/Store";
import { updateDisplayCreateMessage } from "../../../../../redux/Slices/ModalSlice";
import { openConversation } from "../../../../../redux/Slices/MessagesSlice";
import Close from "@mui/icons-material/Close";

export const CreateMessageModalTop: React.FC = () => {
  //
  const userState = useSelector((state: RootState) => state.user);
  const conversationUsers = useSelector(
    (state: RootState) => state.message.conversationUsers
  );
  const dispatch: AppDispatch = useDispatch();

  const createMessageThread = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(updateDisplayCreateMessage());
    if (userState.loggedIn && userState.token) {
      const users = [
        ...conversationUsers,
        {
          userId: userState.loggedIn.userId,
          nickname: userState.loggedIn.nickname,
          pfp: userState.loggedIn.profilePicture
            ? userState.loggedIn.profilePicture.imageURL
            : "",
        },
      ];

      dispatch(
        openConversation({ token: userState.token, conversationUsers: users })
      );
    }
  };

  const closeModal = (e: React.MouseEvent) => {
    dispatch(updateDisplayCreateMessage());
  };

  return (
    <div className="create-message-modal-top">
      <div className="create-message-modal-top-right">
        <div
          className="create-message-modal-top-close-wrapper"
          onClick={closeModal}
        >
          <Close sx={{ fontSize: "20px" }} />
        </div>

        <h2 className="create-message-modal-top-header">New Message</h2>
      </div>

      <button
        className={
          conversationUsers.length > 0
            ? "create-message-modal-top-next-button-active"
            : "create-message-modal-top-next-button-deactive"
        }
        disabled={conversationUsers.length === 0}
        onClick={createMessageThread}
      >
        Next
      </button>
    </div>
  );
};
