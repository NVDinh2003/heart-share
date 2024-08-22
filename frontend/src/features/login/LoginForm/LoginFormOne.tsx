import React, { useState } from "react";

import { AppDispatch, RootState } from "../../../redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { verifyUsername } from "../../../redux/Slices/UserSlice";
import { validateEmail, validatePhone } from "../../../services/Validator";

import { ValidatedTextInput } from "../../../components/ValidatedInput/ValidatedTextInput";
import { ModalButton } from "../../../components/ModalButton/ModalButton";

import google from "../../../assets/google.png";
import apple from "../../../assets/apple.png";

import "../../../assets/global.css";
import "./LoginForms.css";

interface LoginFormOneProps {
  noAccount: () => void;
}

export const LoginFormOne: React.FC<LoginFormOneProps> = ({ noAccount }) => {
  const state = useSelector((state: RootState) => state.user);

  const dispatch: AppDispatch = useDispatch();

  const [credential, setCredential] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCredential(e.target.value);
  };

  const findUsername = (): void => {
    let body = {
      email: "",
      phone: "",
      username: "",
    };

    if (validateEmail(credential)) body.email = credential;
    else if (validatePhone(credential)) body.phone = credential;
    else body.username = credential;

    console.log(body);

    dispatch(verifyUsername(body));
  };
  //
  return (
    <div className="login-form-one-container">
      <h1 className="login-form-header">Sign in to Fwitter</h1>
      <ModalButton
        active={true}
        height={40}
        fontColor={"#536471"}
        borderColor={"#536471"}
        backgroundColor={"white"}
        fontSize={15}
        fontWeight={600}
        hoverBackground={{
          r: 179,
          g: 204,
          b: 255,
          a: 0.05,
        }}
        hoverBorder={{
          r: 128,
          g: 170,
          b: 255,
          a: 0.5,
        }}
      >
        <img src={google} alt="" className="login-form-one-buttons-logo" />
        Sign in with Google
      </ModalButton>
      <ModalButton
        active={true}
        height={40}
        fontColor={"black"}
        borderColor={"#536471"}
        backgroundColor={"white"}
        fontSize={16}
        fontWeight={700}
        hoverBackground={{
          r: 87,
          g: 87,
          b: 87,
          a: 0.1,
        }}
        hoverBorder={{
          r: 87,
          g: 87,
          b: 87,
          a: 1,
        }}
      >
        <img src={apple} alt="" className="login-form-one-buttons-logo" />
        Sign in with Apple
      </ModalButton>

      <div className="login-form-one-divider">
        <div className="login-form-one-line"></div>
        <p className="login-form-one-or">or</p>
        <div className="login-form-one-line"></div>
      </div>

      <ValidatedTextInput
        valid={!state.error}
        name={"identifier"}
        label={"Phone, email, or username"}
        changeValue={handleChange}
      />
      {state.error ? (
        <p className="login-form-error color-red">Unable to find User</p>
      ) : (
        <></>
      )}
      <ModalButton
        active={true}
        height={40}
        fontColor={"white"}
        backgroundColor={"black"}
        fontSize={16}
        fontWeight={700}
        hoverBackground={{
          r: 0,
          g: 0,
          b: 0,
          a: 0.9,
        }}
        onClick={findUsername}
      >
        Next
      </ModalButton>

      <ModalButton
        active={true}
        height={40}
        fontColor={"black"}
        borderColor={"#D3D3D3"}
        backgroundColor={"white"}
        fontSize={16}
        fontWeight={700}
        hoverBackground={{
          r: 83,
          g: 100,
          b: 113,
          a: 0.2,
        }}
        hoverBorder={{
          r: 211,
          g: 211,
          b: 211,
          a: 1.0,
        }}
      >
        Forgot password ?
      </ModalButton>
      <p className="login-form-one-text color-gray">
        Don't have an account?{" "}
        <span className="link color-blue" onClick={noAccount}>
          Sign up
        </span>
      </p>
    </div>
  );
};