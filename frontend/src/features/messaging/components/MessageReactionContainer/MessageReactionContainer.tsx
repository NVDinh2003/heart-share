import React, { useEffect, useRef, useState } from "react";

import "./MessageReactionContainer.css";
import { Message, Reaction } from "../../../../utils/GlobalInterface";
import { AppDispatch, RootState } from "../../../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { getEmojiImageByEmojiAscii } from "../../../../utils/EmojiUtils";
import { useNavigate } from "react-router-dom";
import { reactToMessage } from "../../../../redux/Slices/MessagesSlice";
import ProfilePicture from "../../../../components/ProfilePicture/ProfilePicture";

export const MessageReactionContainer: React.FC<{ message: Message }> = ({
  message,
}) => {
  const { reactions } = message;
  const { loggedIn, token } = useSelector((state: RootState) => state.user);

  const [groupedReactions, setGroupedReactions] = useState<
    Array<{ count: number; reaction: string; userIds: number[] }>
  >([]);
  const [displayPopup, setDisplayPopup] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const reactionContainerRef = useRef<HTMLDivElement>(null);
  const watcherRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const usersMessage = () => {
    return message.sentBy.userId === loggedIn?.userId;
  };

  const groupReactions = () => {
    let reactionMap = new Map<string, Reaction[]>();
    let reactionCountObj: Array<{
      count: number;
      reaction: string;
      userIds: number[];
    }> = [];

    for (let reaction of reactions) {
      if (!reactionMap.has(`${reaction.reaction}`)) {
        reactionMap.set(`${reaction.reaction}`, []);
      }

      let reactionList = reactionMap.get(`${reaction.reaction}`);
      if (reactionList) {
        reactionList.push(reaction);
        reactionMap.set(`${reaction.reaction}`, reactionList);
      }
    }

    reactionMap.forEach((value: Reaction[], key: string) => {
      let userIds = value.map((r) => r.reactionUser.userId);
      reactionCountObj.push({
        count: value.length,
        reaction: key,
        userIds,
      });
    });

    console.log(reactionCountObj);

    setGroupedReactions(reactionCountObj);
  };

  const getPopupStyle = () => {
    if (reactionContainerRef && reactionContainerRef.current) {
      const flip =
        window.innerHeight -
          reactionContainerRef.current.getBoundingClientRect().bottom <
        195;
      const { top, left, right, bottom } =
        reactionContainerRef.current.getBoundingClientRect();
      const distanceToBottom = window.innerHeight - bottom;
      if (flip) {
        return {
          bottom: `${distanceToBottom + 40}px`,
          left: usersMessage() ? `${right - 325}px` : `${left - 162}px`,
        };
      } else {
        return {
          top: `${bottom + 8}px`,
          left: usersMessage() ? `${right - 325}px` : `${left - 162}px`,
        };
      }
    }
    return {
      marginTop: "0px",
      marginLeft: "0px",
    };
  };
  const navigateToProfile = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    navigate(`/${e.currentTarget.id}`);
  };
  const undoReaction = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation();
    if (loggedIn && token) {
      const reaction = message.reactions.filter(
        (r) => r.reactionUser.userId === loggedIn.userId
      )[0];
      dispatch(
        reactToMessage({
          user: loggedIn,
          message: message,
          reaction: reaction.reaction,
          token,
        })
      );
    }
    setDisplayPopup(false);
  };
  const handleClickOutside = (e: any) => {
    if (
      watcherRef &&
      watcherRef.current &&
      !watcherRef.current.contains(e.target)
    ) {
      setDisplayPopup(false);
    }
  };

  useEffect(() => {
    groupReactions();
  }, [reactions]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [watcherRef]);

  return (
    <div
      className="message-reaction-container"
      ref={reactionContainerRef}
      onClick={() => setDisplayPopup(true)}
    >
      {loggedIn &&
        groupedReactions.map((reaction) => {
          return (
            <div
              className={`message-reaction ${
                reaction.userIds.includes(loggedIn.userId)
                  ? "message-reaction-outlined"
                  : ""
              }`}
            >
              <img
                className="message-reaction-emoji"
                src={getEmojiImageByEmojiAscii(reaction.reaction)}
                alt="Reaction emoji"
              />
              <p className="message-reaction-count">{reaction.count}</p>
            </div>
          );
        })}
      {displayPopup && (
        <div
          className="message-reactions-popup"
          style={getPopupStyle()}
          ref={watcherRef}
        >
          {reactions.map((reaction, idx) => {
            const isLast = idx === reactions.length - 1;
            return (
              <div
                style={{ borderBottom: isLast ? "none" : "1px solid #E1E8ED" }}
                className="message-reactions-popup-card"
                id={reaction.reactionUser.username}
                onClick={navigateToProfile}
              >
                <img
                  className="message-reactions-popup-reaction"
                  src={getEmojiImageByEmojiAscii(reaction.reaction)}
                  alt="popup reaction"
                />
                <ProfilePicture user={reaction.reactionUser} size={"40px"} />
                <div className="message-reactions-popup-profile-group">
                  <h3 className="message-reactions-popup-nickname">
                    {reaction.reactionUser.nickname}
                  </h3>
                  <p className="message-reactions-popup-username">
                    @{reaction.reactionUser.username}
                  </p>
                </div>
                {reaction.reactionUser.userId === loggedIn?.userId && (
                  <p
                    className="message-reactions-popup-undo"
                    onClick={undoReaction}
                  >
                    Undo
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
