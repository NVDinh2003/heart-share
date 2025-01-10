import React from "react";
import "./ProfileMorePopup.css";
export const ProfileMorePopup: React.FC<{
  following: boolean;
  follower: boolean;
  username: string;
}> = ({ following, follower, username }) => {
  interface PopupObj {
    svg: React.ReactNode;
    text: string;
    type: "FOLLOWING" | "FOLLOWER" | "N/A";
  }
  const popupList: PopupObj[] = [
    {
      svg: <></>,
      text: "Turn off reposts",
      type: "FOLLOWING",
    },
    {
      svg: <></>,
      text: "View topics",
      type: "N/A",
    },
    {
      svg: <></>,
      text: `Add/remove @${username} from Lists`,
      type: "N/A",
    },
    {
      svg: <></>,
      text: "View Lists",
      type: "N/A",
    },
    {
      svg: <></>,
      text: "Share profile via...",
      type: "N/A",
    },
    {
      svg: <></>,
      text: "Copy link to profile",
      type: "N/A",
    },
    {
      svg: <></>,
      text: `Mute @${username}`,
      type: "N/A",
    },
    {
      svg: <></>,
      text: "Remove this follower",
      type: "FOLLOWER",
    },
    {
      svg: <></>,
      text: `Block @${username}`,
      type: "N/A",
    },
    {
      svg: <></>,
      text: `Report @${username}`,
      type: "N/A",
    },
  ];
  return (
    <div className="profile-more-popup">
      {popupList.map((item) => {
        switch (item.type) {
          case "FOLLOWING":
            return <></>;
          case "FOLLOWER":
            return <></>;
          default:
            return <></>;
        }
      })}
    </div>
  );
};
