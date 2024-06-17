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
import { TbApi } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import { AiFillDelete, AiOutlineCheck, AiFillApi } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { React, useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import jwt from "jwt-decode";
import { w3cwebsocket as W3CWebsocket } from "websocket";
import AppContext from "../../Utils/AppContext";
import "./Sidebar.css";
import { backendRoot, websocketRoot } from "../../Utils/backendInfo";
import TextareaAutosize from "react-textarea-autosize";
import BionicText from "../../Utils/BionicText";
import { switchAnatomy } from "@chakra-ui/anatomy";
import B from "../../assets/b.svg";
import arrow from "../../assets/arrow.svg";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const Sidebar = () => {
  const trackColor = useColorModeValue("gray.200", "gray.600");
  const [isdata, setIsdata] = useState(true);
  const [highlightedchetindex, sethighlightedchetindex] = useState(-1);
  const buttonRef = useRef(null);
  const popupRef = useRef(null);
  let stopFlag = ".___stop___.";
  const [lengthCheck, setLengthCheck] = useState(1);
  const { colorMode, toggleColorMode } = useColorMode();

  let {
    user,
    companyid,
    logoutUser,
    getUser,
    index,
    bionic,
    setbionic,
    chatid,
    setChatid,
    chatlist,
    apivalid,
    setapivalid,
    updateuserapi,
    conversationlist,
    screenLoader,
    getConversation,
    submittedValues,
    setSubmittedValues,
    getChat,
    disablesending,
    setdisablesending,
    editChat,
    deleteChat,
    editAndDeleteLoader,
    setEditAndDeleteID,
    editAndDeleteID,
    chatSwapsLoader,
    setScreenLoader,
    GPTVersion,
    setupdateapiloader,
    updateapiloader,
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
  // const [submittedValues, setSubmittedValues] = useState([]);
  const [socket, setSocket] = useState(
    new W3CWebsocket(
      `${
        window.location.protocol === "https:" ? "wss" : "ws"
      }://${websocketRoot}/ws/chatbot/?token=${Cookie.get("access_token")}`
    )
  );

  function handleHover() {
    document.getElementById(
      "home_bottom_bar_sidenav"
    ).style.backgroundColor = `${bg5}`;
  }

  useEffect(() => {
    highlightChat();
  }, [highlightedchetindex]);

  function highlightChat() {
    console.log("inside highlifhted chat");
    console.log("inside highlighterd chat", highlightedchetindex);
    let count = document.getElementsByClassName("chat_buttons").length;
    for (let index = 0; index < count; index++) {
      document.getElementsByClassName("chat_buttons")[
        index
      ].style.backgroundColor = `transparent`;
    }
    if (highlightedchetindex !== -1) {
      console.log(
        document.getElementsByClassName("chat_buttons")[highlightedchetindex]
      );
      document.getElementsByClassName("chat_buttons")[
        highlightedchetindex
      ].style.backgroundColor = `${bg5}`;
    }
  }

  function handleHover2() {
    document.getElementById("home_bottom_bar_sidenav").style.backgroundColor =
      "transparent";
  }

  const handleChat = (chat_id, model) => {
    setSubmittedValues([]);
    console.log("chat click", chat_id, model);
    setGPTVersion(model);
    setChatid(chat_id);
    getConversation(chat_id);
  };

  const handleNewChat = () => {
    console.log("handle new chat");
    setGPTVersion(4);
    setSubmittedValues([]);
    setChatid(null);
  };

  //Switch
  useEffect(() => {
    const storedBionic = localStorage.getItem("bionic");
    if (storedBionic) {
      setbionic(storedBionic === "true");
    } else {
      localStorage.setItem("bionic", false);
    }
  }, []);

  useEffect(() => {
    console.log("debug conversations", conversationlist);
    if (conversationlist && conversationlist.length > 0) {
      setSubmittedValues([]);
      setSubmittedValues((prevValues) => [
        ...prevValues,
        ...conversationlist.flatMap((value) => [value.question, value.answer]),
      ]);
    }
  }, [conversationlist]);

  useEffect(() => {
    // console.log("debug user on refresh: ", user);
    // console.log("debug companyid on refresh: ", companyid);
    // console.log("debug index on refresh: ", index);
    // console.log("debug statates on refresh: ", chatlist);
    console.log("debug protocol", window.location.protocol);
    if ("email" in user) {
      console.log("email" in user);
    } else {
      getUser(jwt(Cookie.get("access_token")).user_id);
      getChat(jwt(Cookie.get("access_token")).user_id);
    }
  }, []);

  useEffect(() => {
    let count = document.getElementsByClassName("chat_buttons").length;
    for (let index = 0; index < count; index++) {
      document.getElementsByClassName("chat_buttons")[
        index
      ].style.backgroundColor = `transparent`;
    }
    if (highlightedchetindex !== -1) {
      console.log(
        document.getElementsByClassName("chat_buttons")[highlightedchetindex]
      );
      document.getElementsByClassName("chat_buttons")[
        highlightedchetindex
      ].style.backgroundColor = `${bg5}`;
    }
  }, [colorMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        // Handle click outside the button
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          document
            .getElementById("profile_popup_home")
            .classList.remove("active");
        } else {
          // document
          // .getElementById("profile_popup_home")
          // .classList.remove("active");
        }
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });
  };

  let handleAPIChange = (e) => {
    e.preventDefault()
    if (!updateapiloader){
      setupdateapiloader(true)
      console.log(e.target[0].value)
      updateuserapi(e.target[0].value)
    }
  };

  return (
    <>
      <div
        style={
          colorMode === "light"
            ? {
                backgroundColor: `${bg2}`,
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              }
            : {
                backgroundColor: `${bg2}`,
                boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
              }
        }
        id="update_api_popup"
      >
        <div id="update_api_popup_header">
          <TbApi id="update_api_popup_header_icon" />
          <span id="update_api_popup_header_span">Update API</span>
          <button onClick={()=>{
            document.getElementById("update_api_popup").classList.remove("active");
            document.getElementById("navbar_dimscreen").classList.remove("active");
          }} id="api_popup_cross_button">
            <RxCross2 id="api_popup_cross_icon" />
          </button>
        </div>
        <form id="submit_api_form" onSubmit={handleAPIChange}>
          <input
            style={
              colorMode === "light"
                ? {
                    backgroundColor: `${bg6}`,
                    boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
                  }
                : {
                    backgroundColor: `${bg6}`,
                    // boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
                  }
            }
            id="api_submission_input"
            type="text"
            name="key"
          />
          <button style={
              colorMode === "light"
                ? {
                    backgroundColor: "#3E4EE6",
                  }
                : { backgroundColor: "#5161F9" }
            }
             id="submit_button_api">{updateapiloader ? <span className="loader_circle"></span> : <>Submit</>}</button>
        </form>
      </div>
      <div
        ref={popupRef}
        id="profile_popup_home"
        style={
          colorMode === "light"
            ? {
                backgroundColor: `${bg4}`,
                boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
              }
            : { backgroundColor: `${bg4}` }
        }
      >
        <div
          className="profile_popup_home_buttons"
          id="profile_popup_bionictext_button"
          style={{ borderBottom: `1px solid ${bg3}` }}
        >
          <img
            style={{
              width: "20px",
              height: "20px",
              marginRight: "20px",
              filter: colorMode == "dark" && "invert(100%)",
            }}
            src={B}
            alt=""
          />
          <span>Bionic Text</span>
          <Switch
            isChecked={bionic}
            style={{ marginLeft: "auto" }}
            onChange={() => {
              const updatedBionic = !bionic;
              setbionic(updatedBionic);
              localStorage.setItem("bionic", updatedBionic);
            }}
            colorScheme="teal"
            css={{
              "& .chakra-switch__track": {
                backgroundColor: bionic ? "#5db693" : "grey",
              },
            }}
          />
        </div>
        <button
          className="profile_popup_home_buttons"
          id="profile_popup_changemode_button"
          onClick={toggleColorMode}
          style={{ borderBottom: `1px solid ${bg3}` }}
        >
          {colorMode === "light" ? (
            <MoonIcon id="home_popup_profile_icons" />
          ) : (
            <SunIcon id="home_popup_profile_icons" />
          )}
          <span id="mode_span_profile_popup">Mode</span>
        </button>
        <button
          className="profile_popup_home_buttons"
          id="profile_popup_signout_button"
          style={{ borderBottom: `1px solid ${bg3}` }}
          onClick={() => {
            logoutUser();
            socket.close();
          }}
        >
          <FiLogOut id="home_popup_profile_icons" />
          <span id="mode_span_profile_popup">Sign Out</span>
        </button>
        <button
          className="profile_popup_home_buttons"
          id="profile_popup_changemode_button"
          onClick={()=>{
            document.getElementById("update_api_popup").classList.add("active");
            document.getElementById("navbar_dimscreen").classList.add("active");

            document
            .getElementById("home_sidebar")
            .classList.remove("active");
          document
            .getElementById("profile_popup_home")
            .classList.remove("active");
          }}
        >
          <TbApi id="home_popup_profile_icons" />
          <span id="mode_span_profile_popup">Update API</span>
        </button>
      </div>
      <div
        id="home_sidebar"
        style={
          colorMode === "light"
            ? {
                backgroundColor: `${bg2}`,
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              }
            : {
                backgroundColor: `${bg2}`,
                boxShadow: "rgb(0 0 0 / 20%) 0px 2px 8px 0px",
              }
        }
      >
        {disablesending && (
          <div style={{ position: "absolute", top: "50%", left: "100px" }}>
            <span className="loader_sidebar"></span>
          </div>
        )}
        <div>
          <Button
            leftIcon={<AddIcon boxSize={3.5} w={6} />}
            style={
              colorMode === "light"
                ? {
                    backgroundColor: "#3E4EE6",
                    color: "white",
                    font: "16px Roboto",
                  }
                : { backgroundColor: "#5161F9", font: "16px Roboto" }
            }
            onClick={() => {
              sethighlightedchetindex(-1);
              handleNewChat();
              if (window.innerWidth < 751) {
                document
                  .getElementById("navbar_dimscreen")
                  .classList.remove("active");
                document
                  .getElementById("home_sidebar")
                  .classList.remove("active");
                document
                  .getElementById("profile_popup_home")
                  .classList.remove("active");
              }
            }}
            id="attach_file_button"
          >
            New Chat
          </Button>
        </div>
        <div
          id="chat_buttons_master_container"
          style={{
            opacity: disablesending && "0.2",
          }}
        >
          {chatlist &&
            chatlist.length > 0 &&
            chatlist.map((value, index) => (
              <div
                onClick={() => {
                  if (disablesending === false) {
                    handleChat(value.id, value.model);
                    if (window.innerWidth < 751) {
                      document
                        .getElementById("navbar_dimscreen")
                        .classList.remove("active");
                      document
                        .getElementById("home_sidebar")
                        .classList.remove("active");
                      document
                        .getElementById("profile_popup_home")
                        .classList.remove("active");
                    }
                    sethighlightedchetindex(index);
                  }
                }}
                className="chat_buttons"
                key={index}
              >
                <div style={{ marginRight: "7px" }}>
                  <BiMessageDetail style={{ fontSize: "16px" }} />
                </div>
                {editAndDeleteLoader && editAndDeleteID === value.id ? (
                  <span
                    style={{ marginLeft: "80%" }}
                    className="loader_dots"
                  ></span>
                ) : (
                  <>
                    <span
                      className="span_for_chats"
                      style={{
                        width: "100%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value.name}
                    </span>
                    <input
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="input_box_edit"
                      style={
                        colorMode === "light"
                          ? {
                              border: "1px solid #0000004d",
                            }
                          : {
                              border: "1px solid #ffffff4d",
                              outline: "none",
                            }
                      }
                    />

                    {!disablesending && (
                      <div className="action_icons_for_chats">
                        <div className="action_icons_for_edit">
                          <AiOutlineCheck
                            onClick={(event) => {
                              event.stopPropagation();
                              //code
                              if (
                                document.getElementsByClassName(
                                  "input_box_edit"
                                )[index].value != ""
                              ) {
                                console.log(
                                  "debug edit icon",
                                  value.id,
                                  document.getElementsByClassName(
                                    "input_box_edit"
                                  )[index].value
                                );
                                const formData = new FormData();
                                formData.append("chat_id", value.id);
                                formData.append(
                                  "new_chat_name",
                                  document.getElementsByClassName(
                                    "input_box_edit"
                                  )[index].value
                                );
                                setEditAndDeleteID(value.id);
                                editChat(formData);
                                document.getElementsByClassName(
                                  "action_icons_default"
                                )[index].style.display = "flex";
                                document.getElementsByClassName(
                                  "action_icons_for_edit"
                                )[index].style.display = "none";
                                document.getElementsByClassName(
                                  "span_for_chats"
                                )[index].style.display = "block";
                                document.getElementsByClassName(
                                  "input_box_edit"
                                )[index].style.display = "none";
                              }
                            }}
                            onMouseEnter={() => {
                              document.getElementsByClassName(
                                "check_chat_name_icon"
                              )[index].style.color = `#5DB693`;
                            }}
                            onMouseLeave={() => {
                              document.getElementsByClassName(
                                "check_chat_name_icon"
                              )[index].style.color = `${tx1}`;
                            }}
                            className="check_chat_name_icon"
                            style={{
                              color: `${tx1}`,
                              marginRight: "10px",
                            }}
                          />
                          <RxCross2
                            onClick={(event) => {
                              event.stopPropagation();
                              document.getElementsByClassName(
                                "action_icons_default"
                              )[index].style.display = "flex";
                              document.getElementsByClassName(
                                "action_icons_for_edit"
                              )[index].style.display = "none";
                              document.getElementsByClassName("span_for_chats")[
                                index
                              ].style.display = "block";
                              document.getElementsByClassName("input_box_edit")[
                                index
                              ].style.display = "none";
                            }}
                            onMouseEnter={() => {
                              document.getElementsByClassName(
                                "cross_chat_name_icon"
                              )[index].style.color = `#F23F42`;
                            }}
                            onMouseLeave={() => {
                              document.getElementsByClassName(
                                "cross_chat_name_icon"
                              )[index].style.color = `${tx1}`;
                            }}
                            className="cross_chat_name_icon"
                            style={{
                              color: `${tx1}`,
                            }}
                          />
                        </div>
                        <div className="action_icons_default">
                          <FiEdit2
                            onMouseEnter={() => {
                              document.getElementsByClassName(
                                "edit_chat_name_icon"
                              )[index].style.color = `#5DB693`;
                            }}
                            onMouseLeave={() => {
                              document.getElementsByClassName(
                                "edit_chat_name_icon"
                              )[index].style.color = `${tx1}`;
                            }}
                            style={{
                              color: `${tx1}`,
                              marginRight: "10px",
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              document.getElementsByClassName(
                                "action_icons_default"
                              )[index].style.display = "none";
                              document.getElementsByClassName(
                                "action_icons_for_edit"
                              )[index].style.display = "flex";
                              document.getElementsByClassName("span_for_chats")[
                                index
                              ].style.display = "none";
                              document.getElementsByClassName("input_box_edit")[
                                index
                              ].style.display = "block";
                              document.getElementsByClassName("input_box_edit")[
                                index
                              ].value =
                                document.getElementsByClassName(
                                  "span_for_chats"
                                )[index].innerHTML;
                              document
                                .getElementsByClassName("input_box_edit")
                                [index].focus();
                            }}
                            className="edit_chat_name_icon"
                          />

                          <AiFillDelete
                            onClick={(event) => {
                              event.stopPropagation();
                              //code
                              console.log("debug delete icon", value.id);
                              const formdata = new FormData();
                              formdata.append("chat_id", value.id);
                              setEditAndDeleteID(value.id);
                              deleteChat(formdata);
                              document
                                .getElementById("attach_file_button")
                                .click();
                              sethighlightedchetindex(-1);
                            }}
                            className="delete_chat_icon"
                            onMouseEnter={() => {
                              document.getElementsByClassName(
                                "delete_chat_icon"
                              )[index].style.color = `#F23F42`;
                            }}
                            onMouseLeave={() => {
                              document.getElementsByClassName(
                                "delete_chat_icon"
                              )[index].style.color = `${tx1}`;
                            }}
                            style={{ color: `${tx1}` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>
        <div
          ref={buttonRef}
          id="home_bottom_bar_sidenav"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover2}
          onClick={() => {
            document
              .getElementById("profile_popup_home")
              .classList.toggle("active");
          }}
        >
          <div
            style={
              colorMode === "light"
                ? {
                    backgroundColor: "#3E4EE6",
                    color: "white",
                  }
                : { backgroundColor: "#5161F9" }
            }
            id="home_person_icon_div"
          >
            <BsFillPersonFill id="person_icon" />
          </div>
          <div
            id="home_email_div"
            style={
              colorMode === "light"
                ? {
                    color: "black",
                  }
                : { color: "white" }
            }
          >
            {user.email}
          </div>
          <FiMoreHorizontal id="home_more_icon" />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
