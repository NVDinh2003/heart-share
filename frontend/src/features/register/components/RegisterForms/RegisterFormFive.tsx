import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/Store";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";

import "./RegisterForm.css";
import "../../../../assets/global.css";

import {
  resendEmail,
  updateRegister,
} from "../../../../redux/Slices/RegisterSlice";

export const RegisterFormFive: React.FC = () => {
  const state = useSelector((state: RootState) => state.register);

  const dispatch: AppDispatch = useDispatch();

  const [code, setCode] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    dispatch(
      updateRegister({
        name: "code",
        value: e.target.value,
      })
    );
  };

  const resend = () => {
    dispatch(resendEmail(state.username));
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <h1 className="register-header-2">
          Chúng tôi đã gửi cho bạn mã xác nhận
        </h1>
        <p className="register-text color-gray">
          Nhập mã xác nhận bên dưới để xác minh cho {state.email}
        </p>

        <div className="register-five-input-wrapper">
          <ValidatedTextInput
            type="text"
            valid={true}
            name={"code"}
            label={"Verification Code"}
            changeValue={handleChange}
          />
          <p className="register-five-message color-blue" onClick={resend}>
            Không nhận được email?
          </p>
        </div>
      </div>
    </div>
  );
};
