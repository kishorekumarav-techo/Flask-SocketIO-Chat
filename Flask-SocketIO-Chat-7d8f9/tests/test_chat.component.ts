import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  template: `
    <h1>Flask-SocketIO-Chat: {{ room }}</h1>
    <textarea id="chat" cols="80" rows="20" [value]="chatContent" readonly></textarea><br><br>
    <input id="text" size="80" placeholder="Enter your message here" [(ngModel)]="message" (keypress)="onKeyPress($event)"><br><br>
    <a href="#" (click)="leaveRoom()">Leave this room</a>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  private socket: Socket;
  room: string;
  chatContent: string = '';
  message: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.room = this.route.snapshot.params['room'];
    this.socket = io('http://' + document.domain + ':' + location.port + '/chat');
    
    this.socket.on('connect', () => {
      this.socket.emit('joined', {});
    });

    this.socket.on('status', (data: { msg: string }) => {
      const d = new Date();
      this.chatContent += `[${d.toLocaleTimeString()}] <${data.msg}>\n`;
      this.scrollChatToBottom();
    });

    this.socket.on('message', (data: { msg: string }) => {
      const d = new Date();
      this.chatContent += `[${d.toLocaleTimeString()}] ${data.msg}\n`;
      this.scrollChatToBottom();
    });
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.message.trim()) {
      this.socket.emit('text', { msg: this.message });
      this.message = '';
    }
  }

  leaveRoom() {
    this.socket.emit('left', {}, () => {
      this.socket.disconnect();
      this.router.navigate(['/']);
    });
  }

  private scrollChatToBottom() {
    const chatTextarea = document.getElementById('chat') as HTMLTextAreaElement;
    chatTextarea.scrollTop = chatTextarea.scrollHeight;
  }
}

// Mock implementations
class MockActivatedRoute {
  snapshot = {
    params: { room: 'TestRoom' }
  };
}

class MockRouter {
  navigate(commands: any[]): Promise<boolean> {
    console.log('Navigating to:', commands);
    return Promise.resolve(true);
  }
}

class MockSocket {
  private listeners: { [event: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data?: any, callback?: Function) {
    console.log(`Emitted ${event}:`, data);
    if (callback) callback();
  }

  disconnect() {
    console.log('Socket disconnected');
  }

  // Helper method to trigger events for testing
  triggerEvent(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// Mock global objects
(global as any).document = {
  domain: 'localhost',
  getElementById: (id: string) => ({
    scrollTop: 0,
    scrollHeight: 100
  })
};
(global as any).location = { port: '5000' };

// Mock io function
function io(url: string): Socket {
  console.log('Connecting to:', url);
  return new MockSocket() as any;
}

// Test suite
describe('ChatComponent', () => {
  let component: ChatComponent;
  let mockRoute: MockActivatedRoute;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockRoute = new MockActivatedRoute();
    mockRouter = new MockRouter();
    component = new ChatComponent(mockRoute as any, mockRouter as any);
  });

  it('should initialize correctly', () => {
    component.ngOnInit();
    expect(component.room).toBe('TestRoom');
    expect(component.chatContent).toBe('');
  });

  it('should handle status messages', () => {
    component.ngOnInit();
    (component as any).socket.triggerEvent('status', { msg: 'User joined' });
    expect(component.chatContent).toContain('User joined');
  });

  it('should handle chat messages', () => {
    component.ngOnInit();
    (component as any).socket.triggerEvent('message', { msg: 'Hello, world!' });
    expect(component.chatContent).toContain('Hello, world!');
  });

  it('should send messages', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.sendMessage();
    expect(component.message).toBe('');
  });

  it('should leave room', () => {
    component.ngOnInit();
    component.leaveRoom();
    // Check if router.navigate was called
  });

  it('should handle key press', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.onKeyPress({ key: 'Enter' } as KeyboardEvent);
    expect(component.message).toBe('');
  });
});

// Run tests
console.log('Running tests...');
describe('ChatComponent', () => {
  let component: ChatComponent;
  let mockRoute: MockActivatedRoute;
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockRoute = new MockActivatedRoute();
    mockRouter = new MockRouter();
    component = new ChatComponent(mockRoute as any, mockRouter as any);
  });

  it('should initialize correctly', () => {
    component.ngOnInit();
    console.assert(component.room === 'TestRoom', 'Room should be TestRoom');
    console.assert(component.chatContent === '', 'Chat content should be empty');
  });

  it('should handle status messages', () => {
    component.ngOnInit();
    (component as any).socket.triggerEvent('status', { msg: 'User joined' });
    console.assert(component.chatContent.includes('User joined'), 'Chat content should include status message');
  });

  it('should handle chat messages', () => {
    component.ngOnInit();
    (component as any).socket.triggerEvent('message', { msg: 'Hello, world!' });
    console.assert(component.chatContent.includes('Hello, world!'), 'Chat content should include chat message');
  });

  it('should send messages', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.sendMessage();
    console.assert(component.message === '', 'Message should be cleared after sending');
  });

  it('should leave room', () => {
    component.ngOnInit();
    component.leaveRoom();
    // Check if router.navigate was called (mock implementation logs this)
  });

  it('should handle key press', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.onKeyPress({ key: 'Enter' } as KeyboardEvent);
    console.assert(component.message === '', 'Message should be cleared after Enter key press');
  });
});

console.log('All tests completed.');