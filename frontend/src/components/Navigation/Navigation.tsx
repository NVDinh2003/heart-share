import React, { useEffect, useState } from "react";
import blueLogo from "../../assets/logo/66e00aa8a33e6.png";

import "./Navigation.css";
import { Link, useNavigate } from "react-router-dom";
import HomeSVG from "../SVGs/HomeSVG";
import ExploreSVG from "../SVGs/ExploreSVG";
import NotificationSVG from "../SVGs/NotificationSVG";
import ListsSVG from "../SVGs/ListsSVG";
import CommunitiesSVG from "../SVGs/CommunitiesSVG";
import ProfileSVG from "../SVGs/ProfileSVG";
import MoreSVG from "../SVGs/MoreSVG";
import BookmarksSVG from "../SVGs/StarsSVG";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import Circle from "@mui/icons-material/Circle";
import CreateMessageSVG from "../SVGs/Messages/CreateMessageSVG";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { resetUserState } from "../../redux/Slices/UserSlice";

interface NavigationProps {
  currentPage: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage }) => {
  //
  const [jwt, setJwt, removeJwt] = useLocalStorage("token", "");
  const navigate = useNavigate();

  useEffect(() => {}, [currentPage]);

  const dispatch: AppDispatch = useDispatch();
  const state = useSelector((state: RootState) => state.user);
  const notifications = useSelector((state: RootState) => state.notification);
  const unreadMessages = useSelector(
    (state: RootState) => state.message.unreadMessages
  );

  const [newNotifications, setNewNotifications] = useState<number>(0);

  const calculateNewNotifications = () => {
    const allNotifications = [
      ...notifications.postActionNotifications,
      ...notifications.mentionNotifications,
      ...notifications.followNotifications,
    ];

    const unreadNotifications = allNotifications.filter(
      (notification) => !notification.acknowledged
    );

    setNewNotifications(unreadNotifications.length);
  };

  useEffect(() => {
    calculateNewNotifications();
  }, [
    notifications.followNotifications,
    notifications.mentionNotifications,
    notifications.newPostNotifications,
    notifications.postActionNotifications,
  ]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirmLogout) {
      removeJwt(); // Xóa token
      dispatch(resetUserState()); // Reset state của người dùng
      navigate("/"); // Chuyển hướng về trang chính
    }
  };

  return (
    <div className="navigation">
      <nav className="navigation-container">
        <Link to="/home" className="navigation-logo-bg">
          <img src={blueLogo} alt="" className="navigation-logo" />
        </Link>

        <div className="navigation-item">
          <Link to="/home" className="navigation-link">
            <div className="navigation-notification-wrapper">
              {notifications.newPostNotifications.length > 0 && (
                <Circle
                  sx={{
                    color: "#1da1f2",
                    height: "8px",
                    width: "8px",
                    position: "absolute",
                    top: "-4px",
                    right: 0,
                  }}
                />
              )}
              <HomeSVG height={26} width={26} />
            </div>

            <p
              className={`navigation-text ${
                currentPage === "/home"
                  ? "navigation-active"
                  : "navigation-inactive"
              }`}
            >
              Trang chủ
            </p>
          </Link>
        </div>

        <div className="navigation-item">
          <Link to="/explore" className="navigation-link">
            <ExploreSVG height={26} width={26} />
            <p
              className={`navigation-text ${
                currentPage === "/explore"
                  ? "navigation-active"
                  : "navigation-inactive"
              }`}
            >
              Khám phá
            </p>
          </Link>
        </div>

        <div className="navigation-item">
          <Link to="/notifications" className="navigation-link">
            <div className="navigation-notification-wrapper">
              {newNotifications > 0 && (
                <div className="navigation-notification-count-wrapper">
                  <p className="navigation-notification-count">
                    {newNotifications < 10 ? newNotifications : "9+"}
                  </p>
                </div>
              )}
              <NotificationSVG height={26} width={26} />
            </div>

            <p
              className={`navigation-text 
                ${
                  currentPage.startsWith("/notifications")
                    ? "navigation-active"
                    : "navigation-inactive"
                } `}
            >
              Thông báo
            </p>
          </Link>
        </div>

        <div className="navigation-item">
          <Link to="" className="navigation-link">
            <div className="navigation-notification-wrapper">
              {unreadMessages.length > 0 && (
                <Circle
                  sx={{
                    color: "#1da1f2",
                    height: "8px",
                    width: "8px",
                    position: "absolute",
                    top: "-4px",
                    right: 0,
                  }}
                />
              )}
              <CreateMessageSVG height={26} width={26} color="none" />
            </div>
            <p className="navigation-text navigation-inactive">Tin nhắn</p>
          </Link>
        </div>

        {/* <div className="navigation-item">
          <Link to="" className="navigation-link">
            <ListsSVG height={26} width={26} />
            <p className="navigation-text navigation-inactive">List</p>
          </Link>
        </div> */}

        {/* <div className="navigation-item">
          <Link to="" className="navigation-link">
            <CommunitiesSVG height={26} width={26} />
            <p className="navigation-text navigation-inactive">Communities</p>
          </Link>
        </div>

        <div className="navigation-item">
          <Link to="" className="navigation-link">
            <BookmarksSVG height={26} width={26} />
            <p className="navigation-text navigation-inactive">Bookmarks</p>
          </Link>
        </div> */}

        <div className="navigation-item">
          <Link to={`/${state.username}`} className="navigation-link">
            <ProfileSVG height={26} width={26} />
            <p className="navigation-text navigation-inactive">Hồ sơ</p>
          </Link>
        </div>

        <div className="navigation-item">
          <Link to="" className="navigation-link">
            <MoreSVG height={26} width={26} />
            <p className="navigation-text navigation-inactive">More</p>
          </Link>
        </div>

        <button className="navigation-post-button">Post</button>
      </nav>

      <div className="navigation-options" onClick={handleLogout}>
        <img
          alt=""
          className="navigation-options-pfp"
          src={
            state.loggedIn?.profilePicture
              ? state.loggedIn.profilePicture.imageURL
              : process.env.REACT_APP_PFP
          }
        />

        <div className="navigation-options-info">
          <p className="navigation-options-info-display-name">
            {state.loggedIn && state.loggedIn.nickname
              ? state.loggedIn.nickname
              : state.username}
          </p>
          <p className="navigation-options-info-handle">
            @{state.username ? state.username : ""}
          </p>
        </div>

        <p className="navigation-option-dotdotdot">...</p>
      </div>
    </div>
  );
};
