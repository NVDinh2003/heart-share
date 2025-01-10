import React, { useEffect, useState } from "react";

import "./ConversationUserInfo.css";
import { User } from "../../../../utils/GlobalInterface";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/Store";
import { useNavigate } from "react-router-dom";
import { getFollowers } from "../../../../services/UserService";
import ProfilePicture from "../../../../components/ProfilePicture/ProfilePicture";
import Circle from "@mui/icons-material/Circle";
import { PostProfilePopupIcons } from "../../../post/components/Post/PostProfilePopup/PostProfilePopupIcons/PostProfilePopupIcons";
import { stringifyFullMonthAndYear } from "../../../../utils/DateUtils";

export const ConversationUserInfo: React.FC<{ user: User }> = ({ user }) => {
  //

  console.log("ConversationUserInfo,", user);

  const loggedIn = useSelector((state: RootState) => state.user.loggedIn);
  const currentUserFollowingList = useSelector(
    (state: RootState) => state.user.following
  );
  const [followers, setFollowers] = useState<number>(0);
  const [sharedFollowers, setSharedFollowers] = useState<User[]>([]);

  const navigate = useNavigate();

  const navigateToProfile = () => {
    navigate(`/${user.username}`);
  };

  const mapFollowedByContent = (): string => {
    if (sharedFollowers.length === 0)
      return "Not followed by anyone you're following";

    let content = "Followed by ";

    sharedFollowers.slice(0, 3).forEach((user) => {
      content += `${user.nickname}, `;
    });

    if (sharedFollowers.length > 3)
      content += `and ${sharedFollowers.length - 3} other you follow.`;
    else content = content.slice(0, -2) + "."; // - ', ' và + '.'

    return content;
  };

  useEffect(() => {
    console.log(user);

    const fetchUsersFollowers = async () => {
      const fetchedFollowers = await getFollowers(user.username);
      //   console.log(fetchedFollowers.length);
      setFollowers(fetchedFollowers.length);
      setSharedFollowers(() => {
        return fetchedFollowers.filter((user: User) => {
          return currentUserFollowingList.some(
            (u) => u.userId === user.userId && u.userId !== loggedIn?.userId
          );
        });
      });
    };

    // console.log(sharedFollowers.length);

    if (loggedIn) {
      fetchUsersFollowers();
    }
  }, [user, loggedIn]);

  return (
    <div className="conversation-user-info" onClick={navigateToProfile}>
      <ProfilePicture user={user} size={"64px"} />
      <h3 className="conversation-user-info-nickname">
        {user.nickname ?? user.username}
      </h3>
      <p className="conversation-user-info-username">{user.username}</p>
      <div className="conversation-user-info-bio-container">
        {user.bio}
      </div>{" "}
      {/* Make sure to setup the bio for emojis and mentions */}
      <div className="conversation-user-info-stats">
        Joined {stringifyFullMonthAndYear(new Date(user.createTimestamp))}
        <Circle
          sx={{
            height: "3px",
            width: "3px",
            color: "#657786",
          }}
        />{" "}
        {followers} Followers
      </div>
      <div className="conversation-user-info-followed-by">
        {sharedFollowers.length > 0 && (
          <div className="conversation-user-info-followed-by-pfps">
            <PostProfilePopupIcons followedBy={sharedFollowers.slice(0, 3)} />
          </div>
        )}
        <p className="conversation-user-info-followed-by-text">
          {mapFollowedByContent()}
        </p>
      </div>
    </div>
  );
};
