import React from "react";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";

import "./ForgotForm.css";
import "../../../../assets/global.css";

interface ForgotFormThreeProps {
  updateCode: (value: number) => void;
  valid: boolean;
}

export const ForgotFormThree: React.FC<ForgotFormThreeProps> = ({
  updateCode,
  valid,
}) => {
  //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCode(+e.target.value);
  };
  return (
    <div className="forgot-form-container">
      <h1 className="forgot-form-header">Chúng tôi đã gửi mã cho bạn</h1>
      <p className="forgot-form-text color-gray">
        Kiểm tra email của bạn để nhận mã xác nhận. Nếu bạn cần yêu cầu mã mới,
        hãy quay lại và chọn lại phương thức xác nhận.
      </p>
      <ValidatedTextInput
        type="text"
        valid={valid}
        name={"code"}
        label={"Nhập mã của bạn: "}
        changeValue={handleChange}
      />
    </div>
  );
};
