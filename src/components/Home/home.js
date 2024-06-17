import {
  Button,
  useColorModeValue,
  useColorModem,
  Switch,
  useColorMode,
  Box,
} from "@chakra-ui/react";
import { AttachmentIcon, MoonIcon, SunIcon, AddIcon } from "@chakra-ui/icons";
import { FaRobot } from "react-icons/fa";
import { FiLogOut, FiMoreHorizontal } from "react-icons/fi";
import { BsFillPersonFill, BsFillChatSquareTextFill } from "react-icons/bs";
import { MdSend, MdOutlineMenu } from "react-icons/md";
import { BiMessageDetail } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { AiFillDelete, AiOutlineCheck } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { React, useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import jwt from "jwt-decode";
import { w3cwebsocket as W3CWebsocket } from "websocket";
import AppContext from "../../Utils/AppContext";
import "./Home.css";
import { backendRoot, websocketRoot } from "../../Utils/backendInfo";
import TextareaAutosize from "react-textarea-autosize";
import BionicText from "../../Utils/BionicText";
import { switchAnatomy } from "@chakra-ui/anatomy";
import B from "../../assets/b.svg";
import arrow from "../../assets/arrow.svg";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import Sidebar from "../Sidebar/Sidebar";

function Home() {
  const trackColor = useColorModeValue("gray.200", "gray.600");
  const [isdata, setIsdata] = useState(true);
  const buttonRef = useRef(null);
  const popupRef = useRef(null);
  let stopFlag = ".___stop___.";
  const [lengthCheck, setLengthCheck] = useState(1);
  const { colorMode, toggleColorMode } = useColorMode();

  let {
    user,
    companyid,
    getAPIvalid,
    logoutUser,
    getUser,
    index,
    apivalid,
    setapivalid,
    disablesending,
    setdisablesending,
    chatid,
    setChatid,
    screenLoader,
    submittedValues,
    setSubmittedValues,
    getChat,
    bionic,
    chatSwapsLoader,
    GPTVersion,
    setGPTVersion,
  } = useContext(AppContext);
  const bg1 = useColorModeValue("#F6F8FA", "#171821");
  const bg2 = useColorModeValue("#FFFFFF", "#1C1E29");
  const bg3 = useColorModeValue("#C4C7CA", "#262736");
  const bg4 = useColorModeValue("#fff", "#111219");
  const bg5 = useColorModeValue("#eef0f2", "#111219");
  const bg6 = useColorModeValue("#fff", "#262736");
  const bg7 = useColorModeValue("white", "#1d1f2a");
  const bg8 = useColorModeValue("#f0f0f0", "#1d1f2a");
  const tx1 = useColorModeValue("#282B30", "#DCE0E3");
  const tx2 = useColorModeValue("#61656B", "#C4C7CA");

  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(
    new W3CWebsocket(
      `${
        window.location.protocol === "https:" ? "wss" : "ws"
      }://${websocketRoot}/ws/chatbot/?token=${Cookie.get("access_token")}`
    )
  );

  // console.log("debug gpt model", GPTVersion);

  useEffect(() => {
    console.log("DEBUGGING USEFFECT GPTVERSION", GPTVersion)
    const setButtonStyles = () => {
      const buttons = document.getElementsByClassName("gptbuttons_child");
      if (buttons.length > 0) {
        buttons[0].style.backgroundColor = "transparent";
        buttons[1].style.backgroundColor = "transparent";
        if (GPTVersion === "3.5") {
          buttons[0].style.backgroundColor = bg8;
        } else {
          buttons[1].style.backgroundColor = bg8;
        }
      }
    };

    // Call the function once on initial render
    setButtonStyles();

    // Add event listener to handle subsequent renders (if necessary)
    window.addEventListener("load", setButtonStyles);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("load", setButtonStyles);
    };
  }, [colorMode]);

  useEffect(() => {
    getAPIvalid(Cookie.get("access_token"));
  }, []);

  useEffect(() => {
    console.log("debug submitted values", submittedValues);
    scrollToBottom();
    // if (!chatid){
    getChat(user.id)
  // }
  }, [submittedValues]);

  const handleInputChange = (event) => {
    let height = 0;
    if (window.innerWidth < 751) {
      height =
        document.getElementById("home_yes_message_div_master").clientHeight - 1;
    } else {
      height =
        document.getElementById("home_yes_message_div_master").clientHeight +
        26;
    }
    document.getElementById(
      "home_yes_data_chat_screen"
    ).style.paddingBottom = `${height}px`;
    setInputValue(event.target.value);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });
  };

  function isEmptyOrWhitespace(str) {
    // Check if the string is empty
    if (str.length === 0) {
      return true;
    }

    // Check if the string contains only whitespace characters
    return str.trim().length === 0;
  }

  const handleInputSubmit = () => {
    if (disablesending == false) {
      if (isEmptyOrWhitespace(inputValue) == true) {
        setInputValue("");
        if (window.innerWidth < 751) {
          document.getElementById(
            "home_yes_data_chat_screen"
          ).style.paddingBottom = `65px`;
        } else {
          document.getElementById(
            "home_yes_data_chat_screen"
          ).style.paddingBottom = `90px`;
        }
        document.getElementById("home_yes_textarea").value = "";
        setdisablesending(false);
        scrollToBottom();
      } else {
        if (window.innerWidth < 751) {
          document.getElementById(
            "home_yes_data_chat_screen"
          ).style.paddingBottom = `65px`;
        } else {
          document.getElementById(
            "home_yes_data_chat_screen"
          ).style.paddingBottom = `90px`;
        }
        document.getElementById("home_yes_textarea").value = "";
        // socket.send({text: inputValue, es_index: "chatbot"})
        // socket.send(JSON.stringify({ text: inputValue, es_index: index, chat_id: chatid ? chatid : '0'}));
        // if (inputValue.trim() !== "") {
        setSubmittedValues([...submittedValues, inputValue]);
        getChat(user.id);
        // setSubmittedValues((prevValues) => [...prevValues, inputValue]);
        // setLengthCheck(submittedValues.length + 1)
        setLengthCheck(1);

        // }
        setInputValue("");
        socket.send(
          JSON.stringify({
            text: inputValue,
            es_index: index,
            chat_id: chatid ? chatid : -1,
            owner_id: user.id,
            messages: submittedValues,
            model: GPTVersion === "3.5" ? "gpt-3.5-turbo" : "gpt-4",
          })
        );
        setdisablesending(true);
        scrollToBottom();
        // socket.send(inputValue)
      }
    }

    console.log("debug handle submit chat id", chatid);
  };

  socket.onopen = () => {
    console.log("WebSocket Client connected");
  };

  socket.onmessage = (message) => {
    console.log("debug length", submittedValues.length);

    console.log(
      "WebSocket Client connected and got data",
      message.data,
      typeof JSON.parse(message.data)
    );
    // const newResponse = JSON.parse(message.data);

    let newResponse = {};
    if (message.data.includes(stopFlag)) {
      console.log("condition met@!!@!");
      newResponse["chatgpt_res"] = "";
    } else {
      newResponse = JSON.parse(message.data);
      setChatid(newResponse["chat_id"]);
    }

    if (message.data.includes(stopFlag)) {
      setdisablesending(false);
    } else {
      setdisablesending(true);
    }

    console.log("debug length", lengthCheck, newResponse);

    if (newResponse["chatgpt_res"] !== "") {
      setSubmittedValues((prevValues) => {
        const updatedValues = [...prevValues];

        console.log("length updated values", updatedValues);

        if (lengthCheck === 1) {
          console.log("debug length check", updatedValues, lengthCheck);
          updatedValues[updatedValues.length] = newResponse["chatgpt_res"];
          setLengthCheck(2);
        } else {
          // Update the current new index by concatenating the response with the existing value
          const currentIndex = updatedValues.length - 1;
          updatedValues[currentIndex] += "" + newResponse["chatgpt_res"];
        }

        scrollToBottom();

        return updatedValues;
      });
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    if (Cookie.get("access_token")) {
      setSocket(
        new W3CWebsocket(
          `${
            window.location.protocol === "https:" ? "wss" : "ws"
          }://${websocketRoot}/ws/chatbot/?token=${Cookie.get("access_token")}`
        )
      );
    }
    console.log("connection closed");
  };

  return (
    <>
      {screenLoader ? (
        <div style={{ background: `${bg1}` }} id="loader_master_div">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <MdOutlineMenu
            style={{ color: `${tx1}` }}
            onClick={() => {
              document
                .getElementById("home_sidebar")
                .classList.toggle("active");
              document.getElementById("home_chat").classList.toggle("active");
              document
                .getElementById("arrow_button")
                .classList.toggle("active");
              document
                .getElementById("sidebar_laptop")
                .classList.toggle("active");
            }}
            id="sidebar_laptop"
          />
          <div
            id="arrow_button"
            onClick={() => {
              document
                .getElementById("home_sidebar")
                .classList.toggle("active");
              document.getElementById("home_chat").classList.toggle("active");
              document
                .getElementById("arrow_button")
                .classList.toggle("active");
              document
                .getElementById("sidebar_laptop")
                .classList.toggle("active");
            }}
          >
            <img src={arrow} id="arrow_button_pic" alt="" />
          </div>
          <div
            onClick={() => {
              document
                .getElementById("navbar_dimscreen")
                .classList.remove("active");
              document
                .getElementById("home_sidebar")
                .classList.remove("active");
              document
                .getElementById("profile_popup_home")
                .classList.remove("active");
              document
                .getElementById("update_api_popup")
                .classList.remove("active");
            }}
            id="navbar_dimscreen"
          ></div>
          <div
            style={
              colorMode === "light"
                ? {
                    background: `${bg2}`,
                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  }
                : {
                    background: `${bg2}`,
                    borderBottom: "1px solid #36393E",
                  }
            }
            id="home_yes_navbar"
          >
            <MdOutlineMenu
              style={{ color: `${tx1}` }}
              onClick={() => {
                document
                  .getElementById("navbar_dimscreen")
                  .classList.add("active");
                document
                  .getElementById("home_sidebar")
                  .classList.toggle("active");
              }}
              id="home_yes_menu_icon"
            />
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              ChatGPT Version {GPTVersion}
            </span>
          </div>
          <Sidebar />
          {chatSwapsLoader ? (
            <div style={{ background: `${bg1}` }} id="loader_master_div">
              <div
                id="home_chat"
                style={{
                  background: `${bg1}`,
                  minHeight: "100vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="loader"></div>
              </div>
            </div>
          ) : (
            <>
              {!apivalid && (
                <div
                  onClick={() => {
                    document
                      .getElementById("update_api_popup")
                      .classList.add("active");
                    document
                      .getElementById("navbar_dimscreen")
                      .classList.add("active");
                  }}
                  id="floating_error_div"
                >
                  !
                </div>
              )}
              <div id="gpt_version_float">GPT Version: {GPTVersion}</div>
              <div id="home_chat" style={{ background: `${bg1}` }}>
                {isdata ? (
                  <div id="home_yes_data_screen">
                    {submittedValues.length === 0 && (
                      <div
                        style={
                          colorMode === "light"
                            ? {
                                backgroundColor: `${bg6}`,
                                boxShadow:
                                  "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                              }
                            : {
                                backgroundColor: `${bg6}`,
                                // boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
                              }
                        }
                        id="gptbuttons_master_div"
                      >
                        <button
                          className="gptbuttons_child"
                          style={{ backgroundColor: GPTVersion=="3.5" && `${bg8}` }}
                          onClick={() => {
                            setGPTVersion("3.5");
                            document.getElementsByClassName(
                              "gptbuttons_child"
                            )[1].style.backgroundColor = `transparent`;
                            document.getElementsByClassName(
                              "gptbuttons_child"
                            )[0].style.backgroundColor = `${bg8}`;
                          }}
                        >
                          GPT-3.5
                        </button>
                        <button
                          className="gptbuttons_child"
                          style={{ backgroundColor: GPTVersion=="4" && `${bg8}` }}
                          onClick={() => {
                            setGPTVersion("4");
                            document.getElementsByClassName(
                              "gptbuttons_child"
                            )[0].style.backgroundColor = `transparent`;
                            document.getElementsByClassName(
                              "gptbuttons_child"
                            )[1].style.backgroundColor = `${bg8}`;
                          }}
                        >
                          GPT-4
                        </button>
                      </div>
                    )}
                    <div id="home_yes_data_chat_screen">
                      {submittedValues.length === 0 && (
                        <div id="chat_text">
                          <div id="home_no_data_header">Custom Chat Bot</div>
                          <div
                            style={{ color: `${tx1}` }}
                            id="home_no_data_text"
                          >
                            Send a message to start a conversation
                          </div>
                        </div>
                      )}

                      {submittedValues &&
                        submittedValues.length > 0 &&
                        submittedValues &&
                        submittedValues.map((value, index) => (
                          <div
                            key={index}
                            style={
                              index % 2 === 0
                                ? {
                                    background: "transparent",
                                    color: `${tx1}`,
                                  }
                                : { background: `${bg7}`, color: `${tx1}` }
                            }
                            className="home_yes_chat_bubble_master"
                          >
                            {index % 2 === 0 ? (
                              <>
                                <div
                                  style={
                                    colorMode === "light"
                                      ? {
                                          backgroundColor: "#3E4EE6",
                                          color: "white",
                                        }
                                      : { backgroundColor: "#5161F9" }
                                  }
                                  className="home_yes_data_chat_screen_icon_div"
                                >
                                  <BsFillPersonFill className="home_yes_data_chat_screen_icon" />
                                </div>
                                <div
                                  style={{ whiteSpace: "pre-line" }}
                                  key={index}
                                  className="home_yes_data_chat_screen_bot_message"
                                >
                                  {value}
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  style={
                                    colorMode === "light"
                                      ? {
                                          backgroundColor: "#50547c",
                                          color: "white",
                                        }
                                      : { backgroundColor: "#50547c" }
                                  }
                                  className="home_yes_data_chat_screen_icon_div"
                                >
                                  <FaRobot className="home_yes_data_chat_screen_icon" />
                                </div>
                                <div
                                  className="home_yes_data_chat_screen_bot_message"
                                  style={{ whiteSpace: "pre-line" }}
                                  key={index}
                                >
                                  {bionic ? <BionicText text={value} /> : value}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                    <div id="home_yes_message_div_master">
                      <div
                        style={
                          colorMode === "light"
                            ? {
                                backgroundColor: `${bg7}`,
                                boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
                              }
                            : {
                                backgroundColor: `${bg7}`,
                                border: "1px solid #3C4057",
                              }
                        }
                        id="home_yes_message_div_child"
                      >
                        <BsFillChatSquareTextFill
                          style={{ color: `${tx2}`, opacity: "0.6" }}
                          id="home_yes_messageicon"
                        />
                        <TextareaAutosize
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" &&
                              !event.shiftKey &&
                              apivalid
                            ) {
                              event.preventDefault();
                              handleInputSubmit();
                            }
                          }}
                          onChange={handleInputChange}
                          style={{ color: `${tx1}` }}
                          placeholder={
                            apivalid
                              ? "Ask me anything..."
                              : "Chatbot is disabled, please update your API key"
                          }
                          id="home_yes_textarea"
                          readOnly={!apivalid}
                        />
                      </div>
                      <button
                        type="submit"
                        onClick={handleInputSubmit}
                        style={
                          colorMode === "light"
                            ? {
                                backgroundColor: "#3E4EE6",
                                color: "white",
                              }
                            : { backgroundColor: "#5161F9" }
                        }
                        className="home_yes_icons_master_div"
                      >
                        {disablesending ? (
                          <span className="loader_dots"></span>
                        ) : (
                          <MdSend id="home_yes_sendicon" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // </div>
                  <div id="home_no_data_screen">
                    <div id="home_no_data_header">Custom Chat Bot</div>
                    <div style={{ color: `${tx1}` }} id="home_no_data_text">
                      Your Conversations
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Home;
