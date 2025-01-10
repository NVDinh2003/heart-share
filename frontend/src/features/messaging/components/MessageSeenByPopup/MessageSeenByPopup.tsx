import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "../../../../components/ProfilePicture/ProfilePicture";
import MessagesSVG from "../../../../components/SVGs/MessagesSVG";
import { RootState } from "../../../../redux/Store";

import "./MessageSeenByPopup.css";
import { User } from "../../../../utils/GlobalInterface";
interface MessageSeenByPopupProps {
  users: User[];
  flipPopup: boolean;
  bottom: number;
  top: number;
  left: number;
  handleClose: () => void;
}
export const MessageSeenByPopup: React.FC<MessageSeenByPopupProps> = ({
  users,
  flipPopup,
  bottom,
  top,
  left,
  handleClose,
}) => {
  const { loggedIn, token } = useSelector((state: RootState) => state.user);
  const { conversations } = useSelector((state: RootState) => state.message);

  const clickOutsideRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleClickOutside = (e: any) => {
    if (
      clickOutsideRef &&
      clickOutsideRef.current &&
      !clickOutsideRef.current.contains(e.target)
    ) {
      handleClose();
    }
  };
  const navigateToProfile = (user: User) => {
    navigate(`/${user.username}`);
  };
  const setPopupPosition = () => {
    let style: any = {
      left: `${left}px`,
    };
    if (flipPopup) {
      style = {
        ...style,
        bottom: `${bottom}px`,
      };
    } else {
      style = {
        ...style,
        top: `${top}px`,
      };
    }
    return style;
  };
  const openConversationWithUser = async (user: User) => {
    if (!loggedIn && !token) return;
    let convoUserList = [loggedIn?.userId, user.userId];
    let conversationId;
    let convoWithUser = conversations
      .filter((conversation) => {
        return conversation.conversationUsers.some(
          (u) => u.userId === user.userId
        );
      })
      .filter((conversation) => {
        return conversation.conversationUsers.length === 2;
      });
    if (convoWithUser.length > 0) {
      conversationId = convoWithUser[0].conversationId;
    } else {
      const body = {
        userIds: convoUserList,
      };
      let req = await axios.post("http://localhost:8000/conversations", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      conversationId = req.data.conversationId;
    }
    handleClose();
    navigate(`/messages/${conversationId}`);
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickOutsideRef]);
  return (
    <div
      className="message-seen-by-popup"
      ref={clickOutsideRef}
      style={setPopupPosition()}
    >
      {users.map((user) => {
        return (
          <div
            className="message-seen-by-popup-card"
            onClick={() => navigateToProfile(user)}
          >
            <div className="message-seen-by-popup-user-group">
              <ProfilePicture user={user} size="40" />
              <div>
                <p className="message-seen-by-popup-user-nickname message-seen-by-popup-text-overflow">
                  {user.nickname}
                </p>
                <p className="message-seen-by-popup-user-username message-seen-by-popup-text-overflow">
                  @{user.username}
                </p>
              </div>
            </div>
            <div
              className="message-seen-by-popup-message-wrapper"
              onClick={(e) => {
                e.stopPropagation();
                openConversationWithUser(user);
              }}
            >
              <MessagesSVG width={22} height={22} color="#657786" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
