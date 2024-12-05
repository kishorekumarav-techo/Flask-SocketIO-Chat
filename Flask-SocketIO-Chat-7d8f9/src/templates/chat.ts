import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface ChatProps {
  room: string;
}

const Chat: React.FC<ChatProps> = ({ room }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatMessages, setChatMessages] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const chatAreaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io(`http://${document.domain}:${location.port}/chat`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joined', {});
    });

    newSocket.on('status', (data: { msg: string }) => {
      const d = new Date();
      setChatMessages(prev => `${prev}[${d.toLocaleTimeString()}] <${data.msg}>\n`);
    });

    newSocket.on('message', (data: { msg: string }) => {
      const d = new Date();
      setChatMessages(prev => `${prev}[${d.toLocaleTimeString()}] ${data.msg}\n`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && socket) {
      socket.emit('text', { msg: inputText });
      setInputText('');
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('left', {}, () => {
        socket.disconnect();
        navigate('/'); // Assuming '/' is the route for the index page
      });
    }
  };

  return (
    <div>
      <h1>Flask-SocketIO-Chat: {room}</h1>
      <textarea
        ref={chatAreaRef}
        value={chatMessages}
        readOnly
        cols={80}
        rows={20}
      />
      <br /><br />
      <input
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        size={80}
        placeholder="Enter your message here"
      />
      <br /><br />
      <a href="#" onClick={leaveRoom}>Leave this room</a>
    </div>
  );
};

export default Chat;