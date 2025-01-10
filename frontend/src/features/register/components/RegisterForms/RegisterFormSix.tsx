import React, { useEffect, useState } from "react";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../redux/Store";
import { updateRegister } from "../../../../redux/Slices/RegisterSlice";
import { setFromRegister, loginUser } from "../../../../redux/Slices/UserSlice";

import { useNavigate } from "react-router-dom";

import "./RegisterForm.css";
import "../../../../assets/global.css";

export const RegisterFormSix: React.FC = () => {
  const state = useSelector((state: RootState) => state);
  const dispatch: AppDispatch = useDispatch();

  const [active, setActive] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    dispatch(
      updateRegister({
        name: "password",
        value: e.target.value,
      })
    );
  };

  const toggleView = () => {
    setActive(!active);
  };

  useEffect(() => {
    if (state.user.loggedIn) {
      navigate("/home");
      return () => {};
    }

    if (state.user.fromRegister) {
      //we are ready to dispatch the login
      dispatch(
        loginUser({
          username: state.register.username,
          password: password,
        })
      );
      return;
    }

    if (state.register.login) {
      // store some user info into local storage, that way we can load the user into ther user slice
      // when we hit the feed page
      // navigate("/home");

      // set the dispath to set user.fromRegister
      dispatch(setFromRegister(true));
    }
  }, [state.register.login, state.user.loggedIn, state.user.fromRegister]);

  return (
    <div className="register-container">
      <div className="register-content">
        <h1 className="register-header-2">Thêm mật khẩu</h1>
        <p className="register-text color-gray">
          Đảm bảo độ dài tối thiểu là 8 ký tự.
        </p>
        <div className="register-six-password">
          <ValidatedTextInput
            type="text"
            valid={true}
            label={"Password"}
            name={"password"}
            changeValue={handleChange}
            attributes={{
              minLength: 8,
              type: active ? "text" : "password",
            }}
          />
        </div>

        <div className="register-six-icon" onClick={toggleView}>
          {active ? (
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
    </div>
  );
};
