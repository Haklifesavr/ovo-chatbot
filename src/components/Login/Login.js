import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import Cookie from "js-cookie";
import React, { useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import { IconButton, Icon } from "@chakra-ui/react";
import { AttachmentIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import jwt from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import AppContext from "../../Utils/AppContext";
import layered_steps_blue from "../../assets/layered_steps_blue.svg";
import layered_steps_green from "../../assets/layered_steps_green.svg";
import google from "../../assets/google.svg";
import robot_light from "../../assets/robot_light.svg";
import robot_dark from "../../assets/robot_dark.svg";
import { backendRoot } from "../../Utils/backendInfo";

function SignIn() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg1 = useColorModeValue("#F6F8FA", "#171821");
  const bg2 = useColorModeValue("#FFFFFF", "#1C1E29");
  const bg3 = useColorModeValue("#FFFFFF", "#4857EF");
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = Cookie.get("token");
  const hexToRGBA = (hex, opacity) => {
    // Remove the "#" character from the beginning of the hex code
    const cleanHex = hex.replace("#", "");

    // Convert the hex code to RGB values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Return the RGBA value with the desired opacity
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  let {
    signIn,
    user,
    setUser,
    authloader,
    setAuthloader,
    screenLoader,
    setScreenLoader,
  } = useContext(AppContext);

  return (
    <>
      {screenLoader ? (
        <>
          <div style={{ background: `${bg1}` }} id="loader_master_div">
            <div className="loader"></div>
          </div>
        </>
      ) : (
        <>
          <button
            style={
              colorMode === "light"
                ? {
                    backgroundColor: window.innerWidth<441 ? `${bg1}` : `${bg3}`,
                    color: "black",
                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  }
                : {  backgroundColor: window.innerWidth<441 ? `${bg1}` : `${bg3}` }
            }
            id="floating_buttons_colormode"
            onClick={toggleColorMode}
          >
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <div style={{ background: `${bg1}` }} id="center_card_login_master">
            <div
              id="center_card_login"
              style={
                colorMode === "light"
                  ? {
                      backgroundColor: `${bg2}`,
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                    }
                  : {
                      backgroundColor: `${bg2}`,
                    }
              }
            >
              <img id="background_image" src={layered_steps_blue} alt="" />
              <div id="center_login_child_div">
                <img
                  id="robot_logo"
                  src={colorMode === "light" ? robot_light : robot_dark}
                  alt=""
                />
                <div id="welcome_to_ovo_text">Welcome to Chatbot</div>
                <button
                  // style={{backgroundColor: colorMode === "light" ? "transparent" : "#7F6CFA", border: colorMode === "light" ? "1px solid rgb(110, 110, 110)" : "none"}}
                  onClick={() =>{
                    setAuthloader(true);
                      window.location.href = `${backendRoot}accounts/google/login/?process=login`;
                  }
                  }
                  id="login_button"
                  style={{backgroundColor:window.innerWidth<441 && `${bg1}`}}
                >
                  {authloader ? (
                     <div className="buttonloader"></div>
                  ) : (
                    <>
                      <img id="googleiconlogin" src={google} alt="" />
                      <div style={{ opacity: "0.8" }}>SIGN IN WITH GOOGLE</div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SignIn;
