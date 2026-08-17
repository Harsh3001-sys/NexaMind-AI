import "./Chat.css";
import { useContext, useEffect, useState, useRef } from "react";
import { Mycontext } from "./Mycontext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css"
import { HashLoader } from "react-spinners";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function Chat({ loading }) {
    const { newChats, prevChats, reply, setPrevChats, setPrompt } = useContext(Mycontext);
    const [latestReply, setLatestReply] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [prevChats, latestReply, loading]);

    const handleLearnClick = () => {
        setPrompt("I want to learn something new. Help me understand a topic step by step with examples.");
    };

    const handleBuildClick = () => {
        setPrompt("I have an idea or problem I'm working on. Help me plan, build, debug, or improve it.");
    };

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
                <div className="welcomeSection">
                    <div className="welcomeTxt">
                        <h1>What are we working on?</h1>
                    </div>
                    <div className="suggestionCards">

                        <Card variant="outlined" className="suggestionCard" onClick={handleLearnClick}>
                            <CardContent>
                                <Typography variant="h6">
                                    <i className="fa-solid fa-lightbulb"></i> Learn & Explore
                                </Typography>

                                <Typography variant="body2">
                                    Understand concepts, ask questions and explore ideas.
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="suggestionCard" onClick={handleBuildClick}>
                            <CardContent>
                                <Typography variant="h6">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Build something
                                </Typography>

                                <Typography variant="body2">
                                    Write, code, brainstorm, debug and build things.
                                </Typography>
                            </CardContent>
                        </Card>

                    </div>

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
                                    : <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>{chat.content}</ReactMarkdown>
                            }

                        </div>)
                    })
                }

                {
                    prevChats.length > 0 && latestReply != null &&
                    <div className="aiDiv" key="typing">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>{latestReply}</ReactMarkdown>
                    </div>
                }

                {loading && <HashLoader className="aiDiv loaderWrapper" color="#fff" size={28}></HashLoader>}
                <div ref={bottomRef}></div>

            </div>
        </>
    )
}

export default Chat;