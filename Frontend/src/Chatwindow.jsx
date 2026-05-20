import "./Chatwindow.css";
import Chat from "./Chat.jsx";
import { Mycontext } from "./Mycontext.jsx";
import { useContext, useState } from "react";
import { HashLoader } from "react-spinners";

function Chatwindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId } = useContext(Mycontext);
    const [loading, setLoading] = useState(false);
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
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="chatwindow">
            <div className="navbar">
                <span>NexaMind-AI <i className="fa-solid fa-angle-down"></i></span>
                <div className="userIconDiv">
                    <span className="usericon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            <Chat></Chat>
            {loading && <HashLoader color="#fff"></HashLoader>}
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