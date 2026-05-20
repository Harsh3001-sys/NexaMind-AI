import "./Chat.css";
import { useContext } from "react";
import { Mycontext } from "./Mycontext";

function Chat(){
    const {newChats, prevChats} = useContext(Mycontext);
    return(
        <>
        {newChats && <h1>Where should we start?</h1>}
        <div className="chats">
            <div className="useDiv">
                <p className="userMsg">User Message</p>
            </div>
            <div className="aiDiv">
                <p className="aiMsg">Ai Message</p>
            </div>
        </div>
        </>
    )
}

export default Chat;