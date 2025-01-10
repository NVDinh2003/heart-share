import React, { useState } from "react";
import { useSelector, UseSelector } from "react-redux";
import { RootState } from "../../../redux/Store";

import { ValidatedTextInput } from "../../../components/ValidatedInput/ValidatedTextInput";
import { DisableValidatedInput } from "../../../components/ValidatedInput/DisableValidatedInput";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { VisibilityOffOutlined } from "@mui/icons-material";

import "./LoginForms.css";

interface LoginFormTwoProps {
  setPassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  forgot: () => void;
}

export const LoginFormTwo: React.FC<LoginFormTwoProps> = ({
  setPassword,
  forgot,
}) => {
  const state = useSelector((state: RootState) => state.user);

  const [active, setActive] = useState<boolean>(false);

  const toggleView = () => {
    setActive(!active);
  };

  return (
    <div className="login-form-two-container">
      <div className="login-form-content">
        <h1 className="login-form-header">Nhập mật khẩu</h1>
        <DisableValidatedInput label={"username"} value={state.username} />

        <div className="login-form-two-password">
          <ValidatedTextInput
            type="text"
            valid={!state.error}
            name={"password"}
            label={"password"}
            changeValue={setPassword}
            attributes={{
              minLength: 8,
              type: active ? "text" : "password",
            }}
          />

          <div className="login-form-two-password-icon" onClick={toggleView}>
            {active ? (
              <VisibilityOffOutlined
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

          {state.error ? (
            <p className="login-form-error color-red">Mật khẩu không đúng!</p>
          ) : (
            <></>
          )}
          <p className="login-form-two-forgot color-blue" onClick={forgot}>
            Quên mật khẩu?
          </p>
        </div>
      </div>
    </div>
  );
};
