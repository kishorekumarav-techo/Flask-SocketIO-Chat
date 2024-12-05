import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

interface ChatProps {
  room: string;
}

const Chat: React.FC<ChatProps> = ({ room }) => {
  const [socket, setSocket] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const newSocket = io(`http://${document.domain}:${location.port}/chat`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joined', {});
    });

    newSocket.on('status', (data: { msg: string }) => {
      const d = new Date();
      setChatMessages((prev) => prev + `[${d.toLocaleTimeString()}] <${data.msg}>\n`);
      scrollToBottom();
    });

    newSocket.on('message', (data: { msg: string }) => {
      const d = new Date();
      setChatMessages((prev) => prev + `[${d.toLocaleTimeString()}] ${data.msg}\n`);
      scrollToBottom();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    if (chatTextareaRef.current) {
      chatTextareaRef.current.scrollTop = chatTextareaRef.current.scrollHeight;
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = inputText;
      setInputText('');
      socket.emit('text', { msg: text });
    }
  };

  const leaveRoom = () => {
    socket.emit('left', {}, () => {
      socket.disconnect();
      // Navigate back to the login page
      window.location.href = '/'; // Assuming the index route is at the root
    });
  };

  return (
    <div>
      <h1>Flask-SocketIO-Chat: {room}</h1>
      <textarea
        ref={chatTextareaRef}
        value={chatMessages}
        readOnly
        cols={80}
        rows={20}
      />
      <br /><br />
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleInputKeyPress}
        size={80}
        placeholder="Enter your message here"
      />
      <br /><br />
      <a href="#" onClick={leaveRoom}>Leave this room</a>
    </div>
  );
};

export default Chat;