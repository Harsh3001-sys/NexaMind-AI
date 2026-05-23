import "./Sidebar.css";
import { useEffect, useState, useContext } from "react";
import { Mycontext } from "./Mycontext.jsx";
import {v1 as uuidv1} from "uuid";

function Sidebar(){
    const {allThreads, setAllThreads, currThreadId, setCurrThreadId, setPrompt, setReply, setPrevChats, setNewChats} =  useContext(Mycontext);

    const getThreads = async() =>{
        try{
            const response = await fetch("http://localhost:5000/api/thread");
            const res = await response.json();
            const filterData = res.map(thread =>({threadId: thread.threadId, title: thread.title}));
            console.log(filterData);
            setAllThreads(filterData);
        }catch(e){
            console.log(e);
        }
    }


    useEffect(() =>{
        getThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChats(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    return(
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="/src/assets/logo.png" alt="NexaMind-AI logo" className="logo"></img>
                NexaMind-AI
                <span><i className="fa-regular fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx}>{thread.title}</li>
                    ))
                }
            </ul>

            <div className="sign">
                <p>Made with &hearts; </p>
            </div>
        </section>
    )
}

export default Sidebar;