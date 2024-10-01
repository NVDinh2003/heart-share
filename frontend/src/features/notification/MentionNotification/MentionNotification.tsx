import React, { useEffect } from "react";
import {
  FeedPost,
  Notification as INotification,
} from "../../../utils/GlobalInterface";
import mentionHero from "../../../assets/mentions.png";

import "./MentionNotification.css";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { AppDispatch, RootState } from "../../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { readNotifications } from "../../../redux/Slices/NotificationSlice";
import { Post } from "../../post/components/Post/Post";

export const MentionNotification: React.FC<{
  notifications: INotification[];
}> = ({ notifications }) => {
  const userState = useSelector((state: RootState) => state.user);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (notifications.length > 0 && userState.loggedIn && userState.token) {
      let unreadNotifications: INotification[] = notifications.filter(
        (notifications) => !notifications.acknowledged
      );
      dispatch(
        readNotifications({
          notifications: unreadNotifications,
          token: userState.token,
        })
      );
    }
  }, [notifications.length]);

  return (
    <div className="mention-notification">
      <div className="mention-notification-hero">
        <div className="mention-notification-dismiss">
          <MoreHoriz sx={{ color: "white" }} />
        </div>

        <img
          src={mentionHero}
          alt="mention hero"
          className="mention-notification-hero-img"
        />
        <h2 className="mention-notification-hero-title">
          Control which conversations you're mentioned in
        </h2>
        <p className="mention-notification-hero-text">
          Use the action menu — those three little dots on a post — to untag
          yourself and leave a conversation.{" "}
          <span className="mention-notification-bold-underline">
            Learn more
          </span>
        </p>
      </div>

      <div className="mention-notification-posts">
        {notifications.map((notification) => {
          if (notification.post !== null && notification.reply !== null) {
            const feedPost: FeedPost = {
              post: notification.reply,
              replyTo: notification.post,
              repost: false,
              repostUser: notification.actionUser,
            };

            return (
              <Post
                key={notification.notificationId}
                feedPost={feedPost}
                notification={true}
              />
            );
          }

          return <></>;
        })}
      </div>
    </div>
  );
};
