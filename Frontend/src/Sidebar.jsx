import "./Sidebar.css";
import { useEffect, useState, useContext } from "react";
import { Mycontext } from "./Mycontext.jsx";
import { v1 as uuidv1 } from "uuid";
import { toast } from "react-toastify";

function Sidebar({
    isSidebarOpen
}) {
    const { allThreads, setAllThreads, currThreadId, setCurrThreadId, setPrompt, setReply, setPrevChats, setNewChats, refreshThreads, setRefreshThreads } = useContext(Mycontext);
    const [openThreadId, setOpenThreadId] = useState(null);

    const getThreads = async () => {
        const token =
            localStorage.getItem(
                "token"
            );

        if (!token) return;
        try {
            const response = await fetch("http://localhost:5000/api/thread", {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            });
            const res = await response.json();
            const filterData = res.map(thread => ({ threadID: thread.threadID, title: thread.title }));
            console.log(filterData);
            setAllThreads(filterData);
        } catch (e) {
            console.log(e);
        }
    }


    useEffect(() => {
        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {
            getThreads();
        }
    }, [refreshThreads]);

    const createNewChat = () => {
        setNewChats(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        const token =
            localStorage.getItem(
                "token"
            );
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`http://localhost:5000/api/thread/${newThreadId}`, {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            });
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChats(false);
        } catch (e) {
            console.log(e);
        }
    }

    const handleDropdown = (threadId) => {
        setOpenThreadId(
            openThreadId === threadId ? null : threadId
        );
    };

    const deleteThread = async (threadId) => {
        const token =
            localStorage.getItem(
                "token"
            );
        try {
            const response = await fetch(`http://localhost:5000/api/thread/${threadId}`, {
                method: "DELETE", headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            });
            const res = await response.json();
            setAllThreads(prev => prev.filter(thread => thread.threadID !== threadId));
            if (currThreadId === threadId) {
                setPrevChats([]);
                setNewChats(true);
                setCurrThreadId(uuidv1());
            }

            setOpenThreadId(null);

        } catch (e) {
            console.log(e);
        }
    }

    const shareThread =
        async (threadId) => {

            const token =
                localStorage.getItem(
                    "token"
                );

            const response =
                await fetch(

                    `http://localhost:5000/api/thread/share/${threadId}`,

                    {
                        method:
                            "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    });

            const res =
                await response.json();

            navigator.clipboard
                .writeText(
                    res.shareLink
                );

            toast.success(
                "Link copied!"
            );
        }

    return (
        <section className={`sidebar ${isSidebarOpen
            ? "open"
            : "closed"
            }`}>
            <button onClick={createNewChat}>
                <img src="/src/assets/logo.png" alt="NexaMind-AI logo" className="logo"></img>
                NexaMind-AI
                <span><i className="fa-regular fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                <p style={{ "fontWeight": "bold" }}>Recent Chats</p>

                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx}
                            onClick={() => changeThread(thread.threadID)}>{thread.title}<i className="fa-solid fa-ellipsis" onClick={(e) => {
                                e.stopPropagation();
                                handleDropdown(thread.threadID);
                            }}></i>
                            {
                                openThreadId === thread.threadID && (
                                    <div className="dropDown" onClick={(e) =>
                                        e.stopPropagation()
                                    }>
                                        <div className="dropDownItem" onClick={(e) => { e.stopPropagation(); shareThread(thread.threadID) }}>
                                            <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                            <span>Share</span>
                                        </div>
                                        <div className="dropDownItem" onClick={(e) => { e.stopPropagation(); deleteThread(thread.threadID) }}>
                                            <i className="fa-regular fa-trash-can delete"></i>
                                            <span className="delete">Delete</span>
                                        </div>
                                    </div>
                                )
                            }
                        </li>
                    ))
                }

            </ul>

            <div className="sign">
                <p>Made with <i className="fa-solid fa-heart" style={{ "color": "red" }}></i> </p>
            </div>
        </section>
    )
}

export default Sidebar;