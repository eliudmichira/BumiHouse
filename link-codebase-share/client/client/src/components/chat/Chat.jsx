import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.scss";
import apiRequest from "../../lib/apiRequest.js";

const Chat = ({ chats }) => {
  const [chat, setChat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getChat = async () => {
      try {
        const res = await apiRequest("/chats/" + chats.id);
        setChat(res.data);
      } catch (error) {
        // Handle error silently or with proper error handling
      }
    };
    getChat();
  }, [chats.id]);

  const handleNavigate = () => {
    navigate(`/profile/${chats.receiver.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text.trim()) return;

    try {
      const res = await apiRequest.post("/messages", {
        chatId: chat.id,
        text,
      });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
      }));
      e.target.reset();
    } catch (error) {
      // Handle error silently or with proper error handling
    }
  };

  const markAsRead = async () => {
    try {
      await apiRequest.put("/chats/read" + chat.id);
    } catch (error) {
      // Handle error silently or with proper error handling
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              justifyContent:
                chats.receiver.id === c.receiverId ? "flex-end" : "flex-start",
            }}
          >
            <div className="content">
              <img src={c.receiver.img} alt="" />
              <span>{c.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
