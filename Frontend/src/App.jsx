import './App.css';
import Sidebar from "./Sidebar.jsx";
import Chatwindow from "./Chatwindow.jsx";
import { Mycontext } from './Mycontext.jsx';
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChats, setNewChats] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [refreshThreads, setRefreshThreads] = useState(false);
  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChats, setNewChats,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    refreshThreads, setRefreshThreads
  };

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get("token");

    const user =
      params.get("user");

    if (token && user) {

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        user
      );

      // clean URL
      window.history.replaceState(
        {},
        document.title,
        "/"
      );

      window.location.reload();
    }

  }, []);
  return (
    <div className='app'>
      <Mycontext.Provider value={providerValues}>
        <Sidebar isSidebarOpen={
          isSidebarOpen
        }
          setIsSidebarOpen={
            setIsSidebarOpen
          }
        ></Sidebar>
        <Chatwindow isSidebarOpen={
          isSidebarOpen
        } setIsSidebarOpen={
          setIsSidebarOpen
        }></Chatwindow>
      </Mycontext.Provider>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>

  )
}

export default App
