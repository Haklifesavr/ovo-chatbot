import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendRoot, verifyTokenPath } from "./backendInfo";
import React, { useLayoutEffect } from "react";
import Cookie from "js-cookie";
import axios from "axios";
import jwt from "jwt-decode";
import { useLocation } from "react-router-dom";

const AppContext = createContext();

export default AppContext;

export const Provider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(0);
  const [index, setIndex] = useState(null);
  const [disablesending, setdisablesending] = useState(false);
  const [updateapiloader, setupdateapiloader] = useState(false);
  const [companyid, setCompanyid] = useState(null);
  const [bionic, setbionic] = useState(false);
  const [chatid, setChatid] = useState(null);
  const [apivalid, setapivalid] = useState(true);
  const [chatlist, setChatList] = useState([]);
  const [conversationlist, setConversationList] = useState([]);
  const [submittedValues, setSubmittedValues] = useState([]);
  const [screenLoader, setScreenLoader] = useState(false);
  const [editAndDeleteLoader, setEditAndDeleteLoader] = useState(false);
  const [editAndDeleteID, setEditAndDeleteID] = useState(null);
  const [GPTVersion, setGPTVersion] = useState("4");
  const [chatSwapsLoader, setChatSwapsLoader] = useState(false);

  const [user, setUser] = useState(() =>
    Cookie.get("access_token") ? jwt(Cookie.get("access_token")) : null
  );
  const [authloader, setAuthloader] = useState(false);
  const setTokens = (accessToken, refreshToken) => {
    // Set the access token cookie with an expiry of 7 days
    const accessTokenExpiry = new Date();
    accessTokenExpiry.setDate(accessTokenExpiry.getDate() + 1);
    Cookie.set("access_token", accessToken, {
      expires: accessTokenExpiry,
      path: "/",
    });

    // Set the refresh token cookie with an expiry of 30 days
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 1);
    Cookie.set("refresh_token", refreshToken, {
      expires: refreshTokenExpiry,
      path: "/",
    });

    const user = jwt(accessToken);
    // setUser(user)
    getUser(user.user_id);
    getChat(user.user_id);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    // Do something with the token (e.g., store it in state, send it to the server, etc.)
    if (token) {
      // setScreenLoader(true);
      const accessTokenRegex = /'access':\s*'([^']+)'/;
      const refreshTokeRegex = /'refresh':\s*'([^']+)'/;

      const accessTokenMatch = token.match(accessTokenRegex);
      const refreshTokenMatch = token.match(refreshTokeRegex);

      const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
      const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      setTokens(accessToken, refreshToken);
    }
  }, [location]);

  let signIn = async (e) => {
    e.preventDefault();
    if (authloader != true) {
      setAuthloader(true);
      const email = e.target[0].value;
      const password = e.target[1].value;

      Cookie.remove("access_token");
      const form = new FormData();
      form.append("email", email);
      form.append("password", password);

      let response = await fetch(`${backendRoot}/api/account/auth/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: form,
      });
      let data = await response.json();
      if (data.access) {
        // navigate("/");
        const user = jwt(data.access);
        Cookie.set("access_token", data.access);
        await getUser(user.user_id);
        await getChat(user.user_id);
        // await getAPIvalid(data.access);
      } else {
        setAuthloader(false);
        setUser(null);
        alert("Failed");
        setCompanyid(null);
      }
    }
  };

  let updateuserapi = async (key) => {
    try {
      const response = await fetch(`${backendRoot}api/account/updateapi/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(Cookie.get("access_token")),
        },
        body: JSON.stringify({ key }), // Send data as JSON
      });
  
      const data = await response.json();
      if (data.status === true) {
        setupdateapiloader(false)
        console.log("api updated");
        getAPIvalid(Cookie.get("access_token"));
      } else {
        setupdateapiloader(false)
        alert("Error");
      }
    } catch (error) {
      setupdateapiloader(false)
      console.error("API call error:", error);
      alert("Error occurred while updating API");
    }
  };
  


  let getAPIvalid = async (accesstoken) => {
    let response = await fetch(`${backendRoot}api/account/apivalid/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(accesstoken),
      },
    });
    let data = await response.json();
    setapivalid(data.status)
  };


  let getCompany = async (company_name, user_id) => {
    const formdata = new FormData()
    formdata.append("company_name", company_name)
    formdata.append("user_id", user_id)
    let response = await fetch(`${backendRoot}/api/account/company/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + Cookie.get("access_token"),
      },
      body: formdata,
    });
    let data = await response.json();
    console.log("get company data", data);
    setCompanyid(data.id);
    setIndex(data["es_index"]);
    setAuthloader(false);
    navigate("/");
    setScreenLoader(false);
  };

  let getUser = async (id) => {
    setScreenLoader(true);
    let response = await fetch(`${backendRoot}/api/account/user/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + Cookie.get("access_token"),
      },
    });
    let data = await response.json();
    setUser(data)
    if(data && data.company){
      setCompanyid(data.company.id);
      setIndex(data.company["es_index"])
      setAuthloader(false);
      navigate("/");
      setScreenLoader(false);
    }
    else {
      let parsedEmail = data.email.split("@")[1].split(".")[0];
      console.log("user data", data, data.email, parsedEmail)
      getCompany(parsedEmail, data.id)
    }
    // auth loader and navigate was originally here. uncomment this I moved it to getCompany API beacuse I wanted to navigate after company and index is set
    // setAuthloader(false);
    // navigate("/");
  };

  // let setChat = async (formdata) => {
  //   let response = await fetch(`${backendRoot}/api/chat/chats/`, {
  //     method: "POST",
  //     body: formdata,
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: "Bearer " + Cookie.get("token"),
  //     },
  //   });
  //   let resp = await response.json();
  //   console.log("chat api resp", resp)
  //   setChatid(resp.id)
  // };

  let getChat = async (owner_id) => {
    let response = await fetch(
      `${backendRoot}/api/chat/chats?owner_id=${owner_id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + Cookie.get("access_token"),
        },
      }
    );
    let resp = await response.json();
    console.log("chat api resp", resp);
    setChatList(resp);
  };

  // let getAfterDeleteAndEditChat = async (owner_id) => {
  //   let response = await fetch(
  //     `${backendRoot}/api/chat/chats?owner_id=${owner_id}`,
  //     {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: "Bearer " + Cookie.get("access_token"),
  //       },
  //     }
  //   );
  //   let resp = await response.json();
  //   console.log("chat api resp", resp);
  //   setChatList(resp);
  // };

  let editChat = async (formdata) => {
    setEditAndDeleteLoader(true);
    let response = await fetch(`${backendRoot}/api/chat/chats/`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + Cookie.get("access_token"),
      },
      body: formdata,
    });
    let resp = await response.json();
    console.log("edit chat api resp", resp);
    // setChatList(resp)
    await getChat(user.id);
    setEditAndDeleteLoader(false);
  };

  let deleteChat = async (formdata) => {
    setEditAndDeleteLoader(true);
    let response = await fetch(`${backendRoot}/api/chat/chats/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + Cookie.get("access_token"),
      },
      body: formdata,
    });
    let resp = await response.json();
    console.log("delete chat api resp", resp);
    // setChatList(resp)
    await getChat(user.id);
    setEditAndDeleteLoader(false);
  };

  let getConversation = async (chat_id) => {
    setChatSwapsLoader(true);
    let response = await fetch(
      `${backendRoot}/api/chat/conversations?chat_id=${chat_id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + Cookie.get("access_token"),
        },
      }
    );
    let resp = await response.json();
    setConversationList(resp);
    console.log("conversation api resp", resp);
    setChatSwapsLoader(false);
  };

  let logoutUser = () => {
    Cookie.remove("access_token");
    setScreenLoader(false);
    setUser(null);
    setChatid(null);
    setConversationList([]);
    setChatList([]);
    setSubmittedValues([]);
    setEditAndDeleteLoader(false);
    setEditAndDeleteID(null);
    setChatSwapsLoader(false);
    setGPTVersion("4")
    navigate("/login");
  };

  const verifyToken = () => {
    const token = Cookie.get("access_token");
    if (token) {
      const url = `${backendRoot}/${verifyTokenPath}`;
      axios
        .post(url, { token })
        .then((res) => {
          // console.log("verify res", res);
          if (res.status === 200) {
            // console.log("status code is 200");
            setIsAuthenticated(1);
            navigate("/");
          }
        })
        .catch((err) => {
          console.log("error: ", err);
          navigate("/login");
        });
    }
  };

  let contextData = {
    user: user,
    bionic: bionic,
    setbionic: setbionic,
    signIn: signIn,
    setUser: setUser,
    isAuthenticated: isAuthenticated,
    setIsAuthenticated: setIsAuthenticated,
    verifyToken: verifyToken,
    authloader: authloader,
    setAuthloader: setAuthloader,
    logoutUser: logoutUser,
    getUser: getUser,
    companyid: companyid,
    setCompanyid: setCompanyid,
    index: index,
    setIndex: setIndex,
    chatid: chatid,
    setChatid: setChatid,
    getChat: getChat,
    setChatList: setChatList,
    chatlist: chatlist,
    getConversation: getConversation,
    conversationlist: conversationlist,
    setConversationList: setConversationList,
    submittedValues: submittedValues,
    setSubmittedValues: setSubmittedValues,
    screenLoader: screenLoader,
    setScreenLoader: setScreenLoader,
    editChat: editChat,
    disablesending: disablesending,
    setdisablesending: setdisablesending,
    deleteChat: deleteChat,
    editAndDeleteLoader: editAndDeleteLoader,
    editAndDeleteID: editAndDeleteID,
    setEditAndDeleteID: setEditAndDeleteID,
    setEditAndDeleteLoader: setEditAndDeleteLoader,
    chatSwapsLoader: chatSwapsLoader,
    setGPTVersion: setGPTVersion,
    GPTVersion: GPTVersion,
    apivalid: apivalid,
    setapivalid: setapivalid,
    getAPIvalid: getAPIvalid,
    updateapiloader: updateapiloader,
    setupdateapiloader: setupdateapiloader,
    updateuserapi: updateuserapi,
  };

  return (
    <AppContext.Provider value={contextData}>{children}</AppContext.Provider>
  );
};
