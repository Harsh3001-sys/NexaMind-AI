import "./Chat.css";
import { useContext, useEffect, useState, useRef } from "react";
import { Mycontext } from "./Mycontext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css"
import { HashLoader } from "react-spinners";

function Chat({ loading }) {
    const { newChats, prevChats, reply, setPrevChats } = useContext(Mycontext);
    const [latestReply, setLatestReply] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [prevChats, latestReply, loading]);



    useEffect(() => {
        if (!reply) return;

        const content = reply.split(" ");
        let idx = 0;
        setLatestReply("");
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));

            idx++;
            if (idx >= content.length) {
                clearInterval(interval);

                setPrevChats(prev => [
                    ...prev,
                    {
                        role: "assistant",
                        content: reply
                    }
                ]);
                setLatestReply(null);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [reply]);

    return (
        <>
            {newChats && prevChats.length === 0 && !loading && (
                <div className="welcomeTxt">
                    <h1>Where should we start?</h1>
                </div>
            )

            }
            <div className="chats">

                {
                    prevChats?.map((chat, idx) => {
                        const isLastAssistant =
                            idx === prevChats.length - 1 &&
                            chat.role === "assistant";

                        if (isLastAssistant && latestReply) return null;
                        return (<div className={chat.role === "user" ? "userDiv" : "aiDiv"} key={idx}>

                            {

                                chat.role === "user" ?
                                    <p className="userMsg">{chat.content}</p>
                                    : <ReactMarkdown rehypePlugins={[rehypeHighlight]} rehypePlugins={[remarkGfm]}>{chat.content}</ReactMarkdown>
                            }

                        </div>)
                    })
                }

                {
                    prevChats.length > 0 && latestReply != null &&
                    <div className="aiDiv" key="typing">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]} rehypePlugins={[remarkGfm]}>{latestReply}</ReactMarkdown>
                    </div>
                }

                {loading && <HashLoader className="aiDiv loaderWrapper" color="#fff" size={28}></HashLoader>}
                <div ref={bottomRef}></div>

            </div>
        </>
    )
}

export default Chat;