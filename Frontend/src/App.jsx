import './App.css';
import Sidebar from "./Sidebar.jsx";
import Chatwindow from "./Chatwindow.jsx";
import { Mycontext } from './Mycontext.jsx';
import { useState } from 'react';
import {v1 as uuidv1} from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChats, setNewChats] = useState(true);
  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChats, setNewChats,
    prevChats, setPrevChats
  };
  return (
    <div className='app'>
      <Mycontext.Provider value={providerValues}>
        <Sidebar></Sidebar>
        <Chatwindow></Chatwindow>
      </Mycontext.Provider>
    </div>
  )
}

export default App
