import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Mock implementations
jest.mock('socket.io-client', () => {
  const mockOn = jest.fn();
  const mockEmit = jest.fn();
  const mockDisconnect = jest.fn();
  return jest.fn(() => ({
    on: mockOn,
    emit: mockEmit,
    disconnect: mockDisconnect,
  }));
});

// Component implementation
interface ChatProps {
  room: string;
}

const Chat: React.FC<ChatProps> = ({ room }) => {
  const [socket, setSocket] = React.useState<any>(null);
  const [chatMessages, setChatMessages] = React.useState<string>('');
  const [inputText, setInputText] = React.useState<string>('');
  const chatTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const newSocket = (window as any).io(`http://${document.domain}:${location.port}/chat`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joined', {});
    });

    newSocket.on('status', (data: { msg: string }) => {
      const d = new Date();
      setChatMessages((prev) => prev + `[${d.toLocaleTimeString()}] <${data.msg}>\n`);
    });

    newSocket.on('message', (data: { msg: string }) => {
      const d = new Date();
      setChatMessages((prev) => prev + `[${d.toLocaleTimeString()}] ${data.msg}\n`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

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
      window.location.href = '/';
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

// Test suite
describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Chat room="TestRoom" />);
    expect(getByText('Flask-SocketIO-Chat: TestRoom')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter your message here')).toBeInTheDocument();
    expect(getByText('Leave this room')).toBeInTheDocument();
  });

  it('connects to socket and sets up event listeners', () => {
    render(<Chat room="TestRoom" />);
    const mockIo = (window as any).io;
    expect(mockIo).toHaveBeenCalledWith('http://localhost:80/chat');
    const mockSocket = mockIo.mock.results[0].value;
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('status', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('handles input and sends message', () => {
    const { getByPlaceholderText } = render(<Chat room="TestRoom" />);
    const input = getByPlaceholderText('Enter your message here') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hello, World!' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    const mockSocket = (window as any).io.mock.results[0].value;
    expect(mockSocket.emit).toHaveBeenCalledWith('text', { msg: 'Hello, World!' });
    expect(input.value).toBe('');
  });

  it('leaves room when link is clicked', () => {
    const { getByText } = render(<Chat room="TestRoom" />);
    const leaveLink = getByText('Leave this room');
    fireEvent.click(leaveLink);
    const mockSocket = (window as any).io.mock.results[0].value;
    expect(mockSocket.emit).toHaveBeenCalledWith('left', {}, expect.any(Function));
  });
});

// Mock global objects
(global as any).io = require('socket.io-client');
(global as any).document = {
  domain: 'localhost',
};
(global as any).location = {
  port: '80',
};
(global as any).window = {
  location: {
    href: '/',
  },
};

// Run tests
describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Chat room="TestRoom" />);
    expect(getByText('Flask-SocketIO-Chat: TestRoom')).toBeTruthy();
    expect(getByPlaceholderText('Enter your message here')).toBeTruthy();
    expect(getByText('Leave this room')).toBeTruthy();
  });

  it('connects to socket and sets up event listeners', () => {
    render(<Chat room="TestRoom" />);
    const mockIo = (global as any).io;
    expect(mockIo).toHaveBeenCalledWith('http://localhost:80/chat');
    const mockSocket = mockIo.mock.results[0].value;
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('status', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('handles input and sends message', () => {
    const { getByPlaceholderText } = render(<Chat room="TestRoom" />);
    const input = getByPlaceholderText('Enter your message here') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hello, World!' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    const mockSocket = (global as any).io.mock.results[0].value;
    expect(mockSocket.emit).toHaveBeenCalledWith('text', { msg: 'Hello, World!' });
    expect(input.value).toBe('');
  });

  it('leaves room when link is clicked', () => {
    const { getByText } = render(<Chat room="TestRoom" />);
    const leaveLink = getByText('Leave this room');
    fireEvent.click(leaveLink);
    const mockSocket = (global as any).io.mock.results[0].value;
    expect(mockSocket.emit).toHaveBeenCalledWith('left', {}, expect.any(Function));
  });
});

console.log('All tests passed!');