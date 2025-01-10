import React from "react";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";

import "./ForgotForm.css";
import "../../../../assets/global.css";

interface ForgotFormProps {
  setCredential: (name: string) => void;
  error: boolean;
}

export const ForgotFormOne: React.FC<ForgotFormProps> = ({
  setCredential,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredential(e.target.value);
  };

  return (
    <div className="forgot-form-container">
      <h1 className="forgot-form-header">Tìm tài khoản HeartShare của bạn</h1>

      <p className="forgot-form-text color-gray">
        Nhập email, số điện thoại hoặc username liên kết với tài khoản của bạn
        để đổi mật khẩu
      </p>
      <ValidatedTextInput
        type="text"
        valid={!error}
        name={"forgot"}
        label={"Email, Phone Number, or Username"}
        changeValue={handleChange}
      />

      {error ? (
        <p className="color-red forgot-error">Không tìm thấy người dùng này!</p>
      ) : (
        <></>
      )}
    </div>
  );
};
