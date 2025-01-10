import React, { useState, useEffect } from "react";
import { ValidatedTextInput } from "../../../../components/ValidatedInput/ValidatedTextInput";
import { ValidatedDateSelector } from "../../../../components/ValidatedInput/ValidatedDateSelector";
import { Dob, User } from "../../../../utils/GlobalInterface";
import { getDays, getMonths, getYears } from "../../../../utils/DateUtils";
import "./EditProfile.css";
import { validateDob, validateName } from "../../../../services/Validator";
import { AppDispatch } from "../../../../redux/Store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

interface EditUserInfoFormProps {
  formData: {
    firstName: string;
    lastName: string;
    nickname: string;
    bio: string;
    dateOfBirth: Dob;
  };
  setFormData: (data: any) => void;
  setValid: (valid: boolean) => void;
}

export const EditUserInfoForm: React.FC<EditUserInfoFormProps> = ({
  formData,
  setFormData,
  setValid,
}) => {
  // console.log(formData.dateOfBirth);
  const [localValid, setLocalValid] = useState(true);

  const updateField = (field: string, value: string | number) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const updateDateField = (field: string, value: string | number | boolean) => {
    const updatedDateOfBirth = {
      ...formData.dateOfBirth,
      [field]: value,
    };

    setFormData((prevData: any) => ({
      ...prevData,
      dateOfBirth: updatedDateOfBirth,
    }));

    const isValid = validateDob({
      month: updatedDateOfBirth.month,
      day: updatedDateOfBirth.day,
      year: updatedDateOfBirth.year,
    });

    setLocalValid(isValid);
    setValid(isValid);

    if (!isValid) {
      toast.error("Please enter a valid date of birth.");
    }
  };

  // useEffect(() => {
  //   console.log(formData.dateOfBirth);
  //   if (
  //     formData.dateOfBirth.day === 0 ||
  //     formData.dateOfBirth.month === 0 ||
  //     formData.dateOfBirth.year === 0
  //   ) {
  //     setLocalValid(false);
  //     setValid(false);
  //   }
  // }, [formData, setValid]);

  return (
    <div id="inputs" className="flex flex-col px-4 mt-20 gap-6">
      <div className="register-name-input edit-name-section">
        <div className="register-name-content">
          <ValidatedTextInput
            type="text"
            valid={validateName(formData.firstName)}
            name={"firstName"}
            label={"Họ"}
            changeValue={(e) => updateField("firstName", e.target.value)}
            data={formData.firstName}
            attributes={{
              maxLength: 50,
            }}
          />
          {validateName(formData.firstName) ? (
            <></>
          ) : (
            <span className="register-name-error">What's your name?</span>
          )}
        </div>

        <div className="register-name-content">
          <ValidatedTextInput
            type="text"
            valid={validateName(formData.lastName)}
            name={"lastName"}
            label={"Tên"}
            changeValue={(e) => updateField("lastName", e.target.value)}
            data={formData.lastName}
            attributes={{
              maxLength: 50,
            }}
          />
          {validateName(formData.lastName) ? (
            <></>
          ) : (
            <span className="register-name-error">What's your name?</span>
          )}
        </div>
      </div>

      <div className="location-modal-content-address-group">
        <div className="location-modal-content-address-input-wrapper">
          <ValidatedTextInput
            type="text"
            valid={validateName(formData.nickname)}
            name={"nickname"}
            label={"Nickname"}
            changeValue={(e) => updateField("nickname", e.target.value)}
            data={formData.nickname}
          />
        </div>
      </div>

      <div className="group w-full border-2 border-gray-600 border-opacity-50 rounded transition-all focus-within:border-[#1d9bf0] h-[96px] px-2 relative">
        <span className="text-sm text-gray-500 group-focus-within:text-[#1d9bf0] ">
          Bio
        </span>
        <textarea
          onInput={(e) =>
            updateField("bio", (e.target as HTMLTextAreaElement).value)
          }
          id="userDescriptionInput"
          className="w-full h-[60px] bg-transparent outline-none"
          defaultValue={formData.bio}
        ></textarea>
      </div>

      <div className="register-one-dob-wrapper">
        <h4 className="register-h4">Ngày sinh</h4>
        <span className="register-text-sm color-gray">
          Thông tin này sẽ không được hiển thị công khai. Vui lòng xác nhận ngày
          sinh của bạn !
        </span>
      </div>

      {!localValid && (
        <div className="error-message">
          <span className="text-red-500">
            Please enter a valid date of birth.
          </span>
        </div>
      )}
      <div className="register-date">
        <div className="register-date-content">
          <div className="register-date-day">
            <ValidatedDateSelector
              style={"validated-day"}
              valid={localValid}
              name={"Ngày"}
              dropDown={getDays}
              dispatcher={(name, value) => updateDateField(name, value)}
              data={formData.dateOfBirth.day}
            />
          </div>
          <div className="register-date-month">
            <ValidatedDateSelector
              style={"validated-month"}
              valid={localValid}
              name={"Tháng"}
              dropDown={getMonths}
              dispatcher={(name, value) => updateDateField(name, value)}
              data={formData.dateOfBirth.month}
            />
          </div>
          <div className="register-date-year">
            <ValidatedDateSelector
              style={"validated-year"}
              valid={localValid}
              name={"Năm"}
              dropDown={getYears}
              dispatcher={(name, value) => updateDateField(name, value)}
              data={formData.dateOfBirth.year}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
