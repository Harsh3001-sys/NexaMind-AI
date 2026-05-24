import "./Chatwindow.css";
import Chat from "./Chat.jsx";
import { Mycontext } from "./Mycontext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import AuthModal from "./AuthModal";

function Chatwindow({
    isSidebarOpen,
    setIsSidebarOpen
}) {
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats } = useContext(Mycontext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDown, setIsDown] = useState(false);
    const userDropdownRef = useRef(null);
    const loginDropdownRef = useRef(null);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {

            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(
                    event.target
                )
            ) {
                setIsOpen(false);
            }

            if (
                loginDropdownRef.current &&
                !loginDropdownRef.current.contains(
                    event.target
                )
            ) {
                setIsDown(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const getReply = async () => {
        setLoading(true);
        console.log("message: ", prompt, "threadid: ", currThreadId);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: prompt,
                threadID: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:5000/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                }
                ]
            ))

        }

        setPrompt("");

    }, [reply]);

    const handleDropdown = () => {
        setIsOpen(!isOpen);
    }

    const loginDropdown = () => {
        setIsDown(!isDown);
    }

    return (
        <div className="chatwindow">
            <div className="navbar">
                <div className="navbar-left">
                    <button
                        className="menuBtn"
                        onClick={() =>
                            setIsSidebarOpen(
                                !isSidebarOpen
                            )
                        }
                    >
                        <i className={isSidebarOpen ? "fa-solid fa-angle-left" : "fa-solid fa-angle-right"}></i>
                    </button>
                    <div className="menu-wrapper">
                        <span onClick={loginDropdown}>NexaMind-AI <i className="fa-solid fa-angle-down"></i></span>
                        {
                            isDown && (
                                <div className="login-box" ref={loginDropdownRef}>
                                    <div className="items" onClick={() => setShowAuth(true)}>Login</div>
                                    <div className="items" onClick={() => setShowAuth(true)}>SignUp</div>
                                </div>
                            )
                        }
                        {showAuth && (
                            <AuthModal
                                setShowAuth={setShowAuth}
                            />
                        )}
                    </div>
                </div>
                <div className="userIconDiv"
                    onClick={handleDropdown}>
                    <span className="usericon"><i className="fa-solid fa-user"></i></span>
                </div>
                {
                    isOpen && (
                        <div className="dropdown" ref={userDropdownRef}>
                            <div className="dropDown-items"><i className="fa-solid fa-gear"></i>Settings</div>
                            <div className="dropDown-items"><i className="fa-solid fa-wand-magic-sparkles"></i>Upgrade Plan</div>
                            <div className="dropDown-items"><i className="fa-regular fa-circle-user"></i>Profile</div>
                            <div className="dropDown-items"><i className="fa-solid fa-arrow-right-from-bracket"></i>LogOut</div>
                        </div>
                    )
                }
            </div>

            <Chat loading={loading}></Chat>

            <div className="chatinput">
                <div className="inputbox">
                    <input placeholder="Ask NexaMind"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}>
                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-arrow-up"></i></div>
                </div>
                <p>
                    NexaMind-AI can make mistakes. Check important info. See cookie preferences.
                </p>
            </div>
        </div>
    )
}

export default Chatwindow;