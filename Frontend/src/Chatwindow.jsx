import "./Chatwindow.css";
import Chat from "./Chat.jsx";
import { Mycontext } from "./Mycontext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import AuthModal from "./AuthModal";
import { toast } from "react-toastify";

function Chatwindow({
    isSidebarOpen,
    setIsSidebarOpen
}) {
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setRefreshThreads, refreshThreads } = useContext(Mycontext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDown, setIsDown] = useState(false);
    const userDropdownRef = useRef(null);
    const loginDropdownRef = useRef(null);
    const [showAuth, setShowAuth] = useState(false);
    const [user, setUser] = useState(
        JSON.parse(
            localStorage.getItem("user")
        )
    );

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

        const token =
            localStorage.getItem(
                "token"
            );

        const user =
            localStorage.getItem(
                "user"
            );

        // block non-logged users
        if (!user) {

            toast.error(
                "Please login first"
            );

            setShowAuth(true);

            return;
        }

        if (!prompt.trim())
            return;

        setLoading(true);

        console.log(
            "message:",
            prompt,
            "threadid:",
            currThreadId
        );

        const options = {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`
            },

            body: JSON.stringify({
                messages: prompt,
                threadID:
                    currThreadId
            })
        };

        try {

            const response =
                await fetch(
                    "http://localhost:4000/api/chat",
                    options
                );

            // unauthorized
            if (
                response.status === 401
            ) {

                toast.error(
                    "Session expired"
                );

                localStorage.clear();

                setTimeout(() => {
                    window.location.reload();
                }, 1200);

                return;
            }

            const res =
                await response.json();

            console.log(res);

            setReply(res.reply);
            setRefreshThreads(
                prev => !prev
            );

        } catch (e) {

            console.log(e);

            toast.error(
                "Something went wrong"
            );

        } finally {

            setLoading(false);
        }
    };

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

    const handleLogout = async () => {
        try {

            const response =
                await fetch(
                    "http://localhost:4000/auth/logout",
                    {
                        method: "POST",
                    }
                );

            const data =
                await response.json();

            if (data.success) {

                toast.success(
                    "Logged out successfully"
                );

                // clear auth
                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                setUser(null);

                setIsOpen(false);

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }


        } catch (error) {
            console.log(error);
        }
    };

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
                                    {
                                        user ? (
                                            <div
                                                className="items"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className="items"
                                                    onClick={() =>
                                                        setShowAuth(true)
                                                    }
                                                >
                                                    Login
                                                </div>

                                                <div
                                                    className="items"
                                                    onClick={() =>
                                                        setShowAuth(true)
                                                    }
                                                >
                                                    SignUp
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                            )
                        }
                        {showAuth && (
                            <AuthModal
                                setShowAuth={setShowAuth}
                                setUser={setUser}
                            />
                        )}
                    </div>
                </div>
                <div className="userIconDiv"
                    onClick={handleDropdown} >
                    <span className="usericon">

                        {
                            (
                                user?.profilePicture ||
                                user?.avatar
                            ) ? (

                                <img
                                    src={
                                        user?.profilePicture ||
                                        user?.avatar
                                    }

                                    className="profile-img"

                                    onError={(e) => {

                                        console.log(
                                            "image failed"
                                        );

                                        e.target.style.display =
                                            "none";
                                    }}
                                />

                            ) : (

                                user?.name?.[0] || "U"

                            )
                        }

                    </span>
                </div>

                {
                    isOpen && (
                        <div className="dropdown" ref={userDropdownRef}>
                            <div className="dropDown-items"><i className="fa-solid fa-gear"></i>Settings</div>
                            <div className="dropDown-items"><i className="fa-solid fa-wand-magic-sparkles"></i>Upgrade Plan</div>
                            <div className="dropDown-items"><i className="fa-regular fa-circle-user"></i>Profile</div>
                            {
                                user && (
                                    <div
                                        className=
                                        "dropDown-items"
                                        onClick={
                                            handleLogout
                                        }
                                    >
                                        <i className=
                                            "fa-solid fa-arrow-right-from-bracket">
                                        </i>

                                        LogOut
                                    </div>
                                )
                            }
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
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                !loading
                            ) {
                                getReply();
                            }
                        }}>
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