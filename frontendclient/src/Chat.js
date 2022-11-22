import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const handeTyping = () => socket.emit("typing", username + " is typing...")

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("typingResponse", data => setTypingStatus(data))
    socket.on("typingEnd", data => {
      setTypingStatus("")
    })
  }, [socket]);

  useEffect(() => {
    const eventListener = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", eventListener);
    return () => socket.off("receive_message", eventListener);
  }, [socket]);

  function onSetMessageHandler(e) {
    setCurrentMessage(e.target.value)
    const preMessage = e.target.value.slice(0, -1);

    setTimeout(() => {
      if (!preMessage || preMessage === currentMessage) {
        socket.emit("endMessage", [])
        
      }
      else {
        clearTimeout()
      }
    }, 2000);
  }



  return (
    
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
           <div className="message-status">
            <p> {typingStatus} </p>
          </div>
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={onSetMessageHandler}
          onKeyDown={handeTyping}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;