import "./Sidebar.css";

function Sidebar(){
    return(
        <section className="sidebar">
            <button>
                <img src="/src/assets/logo.png" alt="NexaMind-AI logo" className="logo"></img>
                NexaMind-AI
                <span><i className="fa-regular fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                <li>history 1</li>
                <li>history 2</li>
                <li>history 3</li>
            </ul>

            <div className="sign">
                <p>Made with &hearts; </p>
            </div>
        </section>
    )
}

export default Sidebar;