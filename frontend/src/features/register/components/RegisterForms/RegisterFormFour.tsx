import React, { useEffect, useState } from "react";
import { Checkbox } from "../../../../components/Checkbox/Checkbox";
import { DropDown } from "../../../../components/DropDown/DropDown";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";
import { countryCodeDropDown } from "../../utils/RegisterModalUtils";
import { validatePhone } from "../../../../services/Validator";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/Store";
import { updateRegister } from "../../../../redux/Slices/RegisterSlice";

import "./RegisterForm.css";
import "../../../../assets/global.css";

export const RegisterFormFour: React.FC = () => {
  const state = useSelector((state: RootState) => state.register);

  const [phoneCode, setPhoneCode] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [validNumber, setValidNumber] = useState<boolean>(true);

  const dispatch: AppDispatch = useDispatch();

  const changeCode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPhoneCode(e.target.value.split(" ")[0]);
  };

  const changePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    dispatch(
      updateRegister({
        name: "phoneNumber",
        value: e.target.value,
      })
    );
  };

  useEffect(() => {
    if (phoneNumber) {
      setValidNumber(validatePhone(phoneNumber));
      dispatch(
        updateRegister({
          name: "phoneNumberValid",
          value: validatePhone(phoneNumber),
        })
      );
    }
  }, [phoneCode, phoneNumber]);

  return (
    <div className="register-container">
      <div className="register-content">
        <h1 className="register-header-2">Thêm số điện thoại</h1>
        <p className="register-text color-gray">
          Nhập số điện thoại bạn muốn liên kết với tài khoản HeartShare của bạn.
        </p>

        <div
          className={
            validNumber
              ? "register-four-input-wrapper"
              : "register-four-input-wrapper-condensed"
          }
        >
          <DropDown
            content={countryCodeDropDown}
            change={changeCode}
            label={"Country code"}
            defaultValue={"Việt Nam +84"}
          />
          <ValidatedTextInput
            type="text"
            valid={true}
            name={"phoneNumber"}
            label={"Your phone number"}
            changeValue={changePhoneNumber}
          />
          {validNumber ? (
            <></>
          ) : (
            <p className="register-error color-red">
              Vui lòng nhập số điện thoại hợp lệ!
            </p>
          )}
        </div>

        <div className="register-four-checkbox-wrapper">
          <p className="register-text color-gray">
            Cho phép người dùng có số điện thoại của bạn tìm và liên kết với bạn
            trên HeartShare.{" "}
            <span className="reg-step-four-link">Tìm hiểu thêm</span>.
          </p>
          <Checkbox />
        </div>
        <div className="register-four-checkbox-wrapper">
          <p className="register-text color-gray">
            Cho phép HeartShare sử dụng số điện thoại của bạn để cá nhân hóa
            dịch vụ, bao gồm quảng cáo (nếu được cho phép theo tùy chọn quảng
            cáo).
            <span className="register-link color-blue">
              Xem Chính sách Quyền riêng tư của chúng tôi để biết thêm thông
              tin.
            </span>
          </p>
          <Checkbox />
        </div>
      </div>
    </div>
  );
};
