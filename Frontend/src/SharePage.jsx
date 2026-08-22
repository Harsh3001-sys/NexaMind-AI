import "./SharePage.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import "highlight.js/styles/github-dark.css";

function SharePage() {

    const { shareId } =
        useParams();

    const [messages,
        setMessages] =
        useState([]);

    const [title,
        setTitle] =
        useState("");

    const [loading,
        setLoading] =
        useState(true);

    useEffect(() => {

        const getSharedChat =
        async () => {

            try {

                const response =
                await fetch(

`${import.meta.env.VITE_API_URL}/api/share/${shareId}`

                );

                const res =
                await response.json();

                setMessages(
                    res.messages
                );

                setTitle(
                    res.title
                );

            } catch (error) {

                console.log(
                    error
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

        getSharedChat();

    }, [shareId]);

    if (loading) {

        return (
            <div className="share-loading">
                Loading...
            </div>
        );
    }

    return (
        <div className="share-page">

            <div className="share-header">

                <h1>
                    {title}
                </h1>

                <p>
                    Shared from
                    NexaMind-AI
                </p>

            </div>

            <div className="share-chat">

                {
                    messages.map(
                    (msg, idx) => (

                    <div
                        key={idx}
                        className={
                        msg.role
                        === "user"
                        ? "share-user"
                        : "share-ai"
                    }>

                    {
                        msg.role
                        === "user"

                        ? (

                        <p className="share-user-msg">
                            {msg.content}
                        </p>

                        )

                        : (

                        <ReactMarkdown
                        rehypePlugins={[
                            rehypeHighlight
                        ]}
                        remarkPlugins={[
                            remarkGfm
                        ]}
                        >

                        {msg.content}

                        </ReactMarkdown>
                        )
                    }

                    </div>
                    ))
                }

            </div>
        </div>
    );
}

export default SharePage;