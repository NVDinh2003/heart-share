import React from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import "./ProfileTopBar.css";
import VerifiedIcon from "@mui/icons-material/Verified";
import { convertNumberOfPostsToString } from "../../utils/ProfileUitls";
import { ImageInfo } from "../../../../utils/GlobalInterface";
import { useNavigate } from "react-router-dom";

interface ProfileTopBarProps {
  nickname: string;
  isVerified: boolean;
  organization: ImageInfo | null;
  numberOfPosts: number;
}

export const ProfileTopBar: React.FC<ProfileTopBarProps> = ({
  nickname,
  isVerified,
  organization,
  numberOfPosts,
}) => {
  //

  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate("/home");
  };

  return (
    <div className="profile-top-bar">
      <div className="profile-top-bar-left" onClick={() => navigate("/")}>
        <ArrowBackIcon
          sx={{
            height: "20px",
            width: "20px",
          }}
        />
      </div>

      <div className="profile-top-bar-right">
        <div className="profile-top-bar-name-section">
          <p className="profile-top-bar-name">{nickname}</p>
          {isVerified && (
            <VerifiedIcon
              sx={{
                color: "#1da1f2",
                width: "20px",
                height: "20px",
              }}
            />
          )}
          {organization && (
            <img
              src={organization.imageURL}
              alt={`${nickname}'s organization`}
              height={20}
              width={20}
            />
          )}
        </div>

        <p className="profile-top-bar-posts">
          {convertNumberOfPostsToString(numberOfPosts)} posts
        </p>
      </div>
    </div>
  );
};
