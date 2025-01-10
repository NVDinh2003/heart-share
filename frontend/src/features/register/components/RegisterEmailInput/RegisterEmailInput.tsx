import React, { useState } from "react";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";
import { useDispatch } from "react-redux";
import { updateRegister } from "../../../../redux/Slices/RegisterSlice";
import { validateEmail } from "../../../../services/Validator";
import { AppDispatch } from "../../../../redux/Store";

import "./RegisterEmailInput.css";

interface RegisterEmailInputProps {
  email: string;
}

export const RegisterEmailInput: React.FC<RegisterEmailInputProps> = ({
  email,
}) => {
  const [validEmail, setValidEmail] = useState<boolean>(true);

  const dispatch: AppDispatch = useDispatch();

  const updateEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(
      updateRegister({
        name: "email",
        value: e.target.value,
      })
    );

    let valid = validateEmail(e.target.value);
    setValidEmail(valid);

    dispatch(
      updateRegister({
        name: "emailValid",
        value: valid,
      })
    );
  };

  return (
    <div className="register-email-input">
      <ValidatedTextInput
        type="text"
        data={email}
        valid={validEmail}
        label={"Email"}
        name={"email"}
        changeValue={updateEmail}
      />
      {validEmail ? (
        <></>
      ) : (
        <span className="register-email-error">
          Vui lòng nhập email hợp lệ!
        </span>
      )}
    </div>
  );
};
