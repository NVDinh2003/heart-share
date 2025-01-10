import React, { useState } from "react";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import "./ForgotForm.css";
import "../../../../assets/global.css";

interface ForgotFormFourProps {
  updatePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  matching: boolean;
}

export const ForgotFormFour: React.FC<ForgotFormFourProps> = ({
  updatePassword,
  matching,
}) => {
  //
  const [passwordToggle, setPasswordToggle] = useState<boolean>(false);
  const [confirmToggle, setConfirmToggle] = useState<boolean>(false);

  const togglePassword = () => {
    setPasswordToggle(!passwordToggle);
  };

  const toggleConfirm = () => {
    setConfirmToggle(!confirmToggle);
  };

  return (
    <div className="forgot-form-container">
      <h1 className="forgot-form-header">Đặt mật khẩu mới</h1>

      <p className="forgot-form-text color-gray">
        Đảm bảo rằng mật khẩu mới của bạn có ít nhất 8 ký tự. Hãy thử kết hợp
        số, chữ cái và dấu câu để có một{" "}
        <span className="link color-blue">mật khẩu mạnh</span>.
      </p>

      <p className="forgot-form-text color-gray">
        Bạn sẽ bị đăng xuất khỏi tất cả các phiên làm việc hiện tại trên
        HeartShare sau khi thay đổi mật khẩu!
      </p>

      <div className="forgot-form-four-password-wrapper">
        <ValidatedTextInput
          type="text"
          valid={true}
          label={"Mật khẩu mới"}
          name={"password"}
          attributes={{
            minLength: 8,
            type: passwordToggle ? "text" : "password",
          }}
          changeValue={updatePassword}
        />
        <div
          onClick={togglePassword}
          className="forgot-form-four-password-icon"
        >
          {passwordToggle ? (
            <VisibilityOffOutlinedIcon
              sx={{
                fontSize: "24px",
              }}
            />
          ) : (
            <VisibilityOutlinedIcon
              sx={{
                fontSize: "24px",
              }}
            />
          )}
        </div>
      </div>

      <div className="forgot-form-four-password-wrapper">
        <ValidatedTextInput
          type="text"
          valid={matching ? true : false}
          label={"Xác nhận mật khẩu mới"}
          name={"confirm"}
          attributes={{
            minLength: 8,
            type: confirmToggle ? "text" : "password",
          }}
          changeValue={updatePassword}
        />
        <div onClick={toggleConfirm} className="forgot-form-four-password-icon">
          {confirmToggle ? (
            <VisibilityOffOutlinedIcon
              sx={{
                fontSize: "24px",
              }}
            />
          ) : (
            <VisibilityOutlinedIcon
              sx={{
                fontSize: "24px",
              }}
            />
          )}
        </div>
      </div>

      {!matching ? (
        <p className="login-form-error color-red">Mật khẩu không trùng khớp!</p>
      ) : (
        <></>
      )}
    </div>
  );
};
