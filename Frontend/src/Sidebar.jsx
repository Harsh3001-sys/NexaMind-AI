import "./Sidebar.css";
import { useEffect, useState, useContext } from "react";
import { Mycontext } from "./Mycontext.jsx";
import { v1 as uuidv1 } from "uuid";
import { toast } from "react-toastify";
import AuthModal from "./AuthModal.jsx";

function Sidebar({
    isSidebarOpen, setIsSidebarOpen
}) {
    const { allThreads, setAllThreads, currThreadId, setCurrThreadId, setPrompt, setReply, setPrevChats, setNewChats, refreshThreads, setRefreshThreads } = useContext(Mycontext);
    const [openThreadId, setOpenThreadId] = useState(null);
    const [openFolders, setOpenFolders] = useState({
        Work: true,
        Study: false,
        Projects: false,
        Personal: false
    });
    const [showAuth, setShowAuth] = useState(false);

    const [user, setUser] = useState(
        JSON.parse(
            localStorage.getItem("user")
        )
    );
    const [openSubjects,
        setOpenSubjects] =
        useState({});

    const getThreads = async () => {
        const token =
            localStorage.getItem(
                "token"
            );

        if (!token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/thread`, {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            });
            const res = await response.json();
            const filterData = res.map(thread => ({
                threadID: thread.threadID,
                title: thread.title,
                category: thread.category,
                subject:
                    thread.subject
            }));
            console.log(filterData);
            setAllThreads(filterData);
        } catch (e) {
            console.log(e);
        }
    }

    const groupedThreads =
        allThreads.reduce(
            (
                acc,
                thread
            ) => {

                const category =
                    thread.category
                    || "Personal";

                const subject =
                    thread.subject
                    || "General";

                if (!acc[category]) {

                    acc[category] = {};
                }

                if (
                    !acc[category][subject]
                ) {

                    acc[category][subject]
                        = [];
                }

                acc[category][subject]
                    .push(thread);

                return acc;

            }, {});


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
        if (
            window.innerWidth
            <= 768
        ) {

            setIsSidebarOpen(
                false
            );
        }
    }

    const changeThread = async (newThreadId) => {
        const token =
            localStorage.getItem(
                "token"
            );
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${newThreadId}`, {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            });
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChats(false);
            if (
                window.innerWidth
                <= 768
            ) {

                setIsSidebarOpen(
                    false
                );
            }
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${threadId}`, {
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

                    `${import.meta.env.VITE_API_URL}/api/thread/share/${threadId}`,

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

    const toggleFolder =
        (folderName) => {

            setOpenFolders(
                prev => ({

                    ...prev,

                    [folderName]:
                        !prev[
                        folderName
                        ]
                }));
        };

    const toggleSubject =
        (subjectKey) => {

            setOpenSubjects(
                prev => ({

                    ...prev,

                    [subjectKey]:
                        !prev[
                        subjectKey
                        ]
                })
            );
        };

    return (
        <>
            <section className={`sidebar ${isSidebarOpen
                ? "open"
                : "closed"
                }`}>
                <button onClick={createNewChat}>
                    <img src="/src/assets/logo2.webp" alt="NexaMind-AI logo" className="logo"></img>
                    NexaMind-AI
                    <span><i className="fa-regular fa-pen-to-square"></i></span>
                </button>

                <ul className="history">

                    <p style={{
                        fontWeight:
                            "bold",

                        marginTop:
                            "1rem"
                    }}>
                        <i class="fa-regular fa-folder-open"></i>    Spaces
                    </p>

                    {
                        Object.entries(
                            groupedThreads
                        ).map(
                            ([level, subjects]) => (

                                <div
                                    key={level}
                                    className="folderSection"
                                >

                                    <div
                                        className="folderHeader"

                                        onClick={() =>
                                            toggleFolder(
                                                level
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                openFolders[
                                                    level
                                                ]

                                                    ? <i className="fa-solid fa-angle-down"></i>

                                                    : <i className="fa-solid fa-angle-right"></i>
                                            }
                                        </span>

                                        <h3>
                                            {level}
                                        </h3>

                                    </div>

                                    {
                                        openFolders[
                                        level
                                        ] && (

                                            <div
                                                className="folderContent"
                                            >

                                                {
                                                    Object.entries(
                                                        subjects
                                                    ).map(
                                                        ([
                                                            subject,
                                                            threads
                                                        ]) => (

                                                            <div
                                                                key={subject}
                                                                className="subjectSection"
                                                            >

                                                                <div
                                                                    className="subjectHeader"

                                                                    onClick={() =>
                                                                        toggleSubject(
                                                                            `${level}-${subject}`
                                                                        )
                                                                    }
                                                                >

                                                                    <span>
                                                                        {
                                                                            openSubjects[
                                                                                `${level}-${subject}`
                                                                            ]

                                                                                ? <i className="fa-solid fa-angle-down"></i>
                                                                                : <i className="fa-solid fa-angle-right"></i>
                                                                        }
                                                                    </span>

                                                                    <h4>
                                                                        {subject}
                                                                    </h4>

                                                                </div>

                                                                {
                                                                    openSubjects[
                                                                    `${level}-${subject}`
                                                                    ] && (

                                                                        <div
                                                                            className="subjectContent"
                                                                        >

                                                                            {
                                                                                threads.map(
                                                                                    (
                                                                                        thread
                                                                                    ) => (

                                                                                        <li
                                                                                            key={
                                                                                                thread.threadID
                                                                                            }

                                                                                            onClick={() =>
                                                                                                changeThread(
                                                                                                    thread.threadID
                                                                                                )
                                                                                            }
                                                                                        >

                                                                                            {
                                                                                                (
                                                                                                    thread.title
                                                                                                    || ""
                                                                                                )
                                                                                                    .trim()
                                                                                                    .length > 22

                                                                                                    ?

                                                                                                    thread.title
                                                                                                        .trim()
                                                                                                        .slice(
                                                                                                            0,
                                                                                                            22
                                                                                                        ) + "..."

                                                                                                    :

                                                                                                    thread.title
                                                                                            }

                                                                                            <i
                                                                                                className=
                                                                                                "fa-solid fa-ellipsis"

                                                                                                onClick={
                                                                                                    (e) => {

                                                                                                        e.stopPropagation();

                                                                                                        handleDropdown(
                                                                                                            `subject-${thread.threadID}`
                                                                                                        );
                                                                                                    }}
                                                                                            >
                                                                                            </i>

                                                                                            {
                                                                                                openThreadId ===
                                                                                                `subject-${thread.threadID}` && (

                                                                                                    <div
                                                                                                        className=
                                                                                                        "dropDown"

                                                                                                        onClick={
                                                                                                            (e) =>
                                                                                                                e.stopPropagation()
                                                                                                        }
                                                                                                    >

                                                                                                        <div
                                                                                                            className=
                                                                                                            "dropDownItem"

                                                                                                            onClick={() =>
                                                                                                                shareThread(
                                                                                                                    thread.threadID
                                                                                                                )
                                                                                                            }
                                                                                                        >

                                                                                                            <i
                                                                                                                className=
                                                                                                                "fa-solid fa-arrow-up-from-bracket"
                                                                                                            >
                                                                                                            </i>

                                                                                                            <span>
                                                                                                                Share
                                                                                                            </span>

                                                                                                        </div>

                                                                                                        <div
                                                                                                            className=
                                                                                                            "dropDownItem"

                                                                                                            onClick={() =>
                                                                                                                deleteThread(
                                                                                                                    thread.threadID
                                                                                                                )
                                                                                                            }
                                                                                                        >

                                                                                                            <i
                                                                                                                className=
                                                                                                                "fa-regular fa-trash-can delete"
                                                                                                            >
                                                                                                            </i>

                                                                                                            <span
                                                                                                                className=
                                                                                                                "delete"
                                                                                                            >
                                                                                                                Delete
                                                                                                            </span>

                                                                                                        </div>

                                                                                                    </div>
                                                                                                )
                                                                                            }

                                                                                        </li>
                                                                                    ))
                                                                            }

                                                                        </div>
                                                                    )
                                                                }

                                                            </div>
                                                        ))
                                                }

                                            </div>
                                        )
                                    }

                                </div>
                            ))
                    }

                    <p style={{ fontWeight: "bold" }}>Recent Chats</p>
                    {
                        allThreads?.map(
                            (thread, idx) => (

                                <li
                                    key={
                                        thread.threadID
                                    }

                                    onClick={() =>
                                        changeThread(
                                            thread.threadID
                                        )
                                    }
                                >

                                    {
                                        (
                                            thread.title
                                            || ""
                                        )
                                            .trim()
                                            .length > 22

                                            ?

                                            thread.title
                                                .trim()
                                                .slice(
                                                    0,
                                                    22
                                                ) + "..."

                                            :

                                            thread.title
                                    }

                                    <i
                                        className=
                                        "fa-solid fa-ellipsis"

                                        onClick={
                                            (e) => {

                                                e.stopPropagation();

                                                handleDropdown(
                                                    `recent-${thread.threadID}`
                                                );
                                            }}
                                    >
                                    </i>

                                    {
                                        openThreadId
                                        ===
                                        `recent-${thread.threadID}` && (

                                            <div
                                                className=
                                                "dropDown"

                                                onClick={
                                                    (e) =>
                                                        e.stopPropagation()
                                                }
                                            >

                                                <div
                                                    className=
                                                    "dropDownItem"

                                                    onClick={() =>
                                                        shareThread(
                                                            thread.threadID
                                                        )
                                                    }
                                                >

                                                    <i
                                                        className=
                                                        "fa-solid fa-arrow-up-from-bracket"
                                                    >
                                                    </i>

                                                    <span>
                                                        Share
                                                    </span>

                                                </div>

                                                <div
                                                    className=
                                                    "dropDownItem"

                                                    onClick={() =>
                                                        deleteThread(
                                                            thread.threadID
                                                        )
                                                    }
                                                >

                                                    <i
                                                        className=
                                                        "fa-regular fa-trash-can delete"
                                                    >
                                                    </i>

                                                    <span
                                                        className=
                                                        "delete"
                                                    >
                                                        Delete
                                                    </span>

                                                </div>

                                            </div>
                                        )}
                                </li>
                            ))
                    }



                </ul>

                {!user && (
                    <div className="login-signin">
                        <p>
                            Please{" "}
                            <span onClick={() => setShowAuth(true)} style={{ fontWeight: "bold", cursor: "pointer"}}>
                                Login
                            </span>{" "}
                            or{" "}
                            <span onClick={() => setShowAuth(true)} style={{ fontWeight: "bold", cursor: "pointer"}}>
                                Sign Up
                            </span>
                            <br />
                            to save your chats and access them from anywhere.
                        </p>
                    </div>
                )}


                <div className="sign">
                    <p> Built for ideas. Powered by AI.</p>
                </div>
            </section>
            {showAuth && (
                <AuthModal
                    setShowAuth={setShowAuth}
                    setUser={setUser}
                />
            )}
        </>
    )
}

export default Sidebar;