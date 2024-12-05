import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Mock implementations
class MockSocket {
  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data?: any, callback?: () => void) {
    console.log(`Emitted ${event}:`, data);
    if (callback) callback();
  }

  disconnect() {
    console.log('Socket disconnected');
  }

  // Helper method to trigger events for testing
  triggerEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

function io(url: string): any {
  console.log(`Connecting to ${url}`);
  return new MockSocket();
}

// Component implementation
@Component({
  selector: 'app-chat',
  template: `
    <h1>Flask-SocketIO-Chat: {{ room }}</h1>
    <textarea id="chat" cols="80" rows="20" [value]="chatContent" readonly></textarea><br><br>
    <input id="text" size="80" placeholder="Enter your message here" [(ngModel)]="message" (keypress)="onKeyPress($event)"><br><br>
    <a href="#" (click)="leaveRoom()">Leave this room</a>
  `
})
class ChatComponent implements OnInit, OnDestroy {
  room: string = '';
  socket: any;
  chatContent: string = '';
  message: string = '';

  constructor(private route: ActivatedRoute) {
    this.socket = io('http://' + document.domain + ':' + location.port + '/chat');
  }

  ngOnInit() {
    this.room = this.route.snapshot.params['room'];
    
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

  scrollChatToBottom() {
    const chatTextarea = document.getElementById('chat') as HTMLTextAreaElement;
    chatTextarea.scrollTop = chatTextarea.scrollHeight;
  }

  leaveRoom() {
    this.socket.emit('left', {}, () => {
      this.socket.disconnect();
      window.location.href = '/';
    });
  }
}

// Test suite
describe('ChatComponent', () => {
  let component: ChatComponent;
  let mockRoute: any;

  beforeEach(() => {
    mockRoute = {
      snapshot: {
        params: { room: 'TestRoom' }
      }
    };
    component = new ChatComponent(mockRoute);
  });

  it('should initialize correctly', () => {
    component.ngOnInit();
    expect(component.room).toBe('TestRoom');
    expect(component.chatContent).toBe('');
  });

  it('should handle status messages', () => {
    component.ngOnInit();
    (component.socket as MockSocket).triggerEvent('status', { msg: 'User joined' });
    expect(component.chatContent).toContain('User joined');
  });

  it('should handle chat messages', () => {
    component.ngOnInit();
    (component.socket as MockSocket).triggerEvent('message', { msg: 'Hello, world!' });
    expect(component.chatContent).toContain('Hello, world!');
  });

  it('should send messages', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.sendMessage();
    expect(component.message).toBe('');
  });

  it('should handle key press', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.onKeyPress({ key: 'Enter' } as KeyboardEvent);
    expect(component.message).toBe('');
  });

  it('should leave room', () => {
    component.ngOnInit();
    const originalLocation = window.location;
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', { value: mockLocation, writable: true });
    component.leaveRoom();
    expect(mockLocation.href).toBe('/');
    Object.defineProperty(window, 'location', { value: originalLocation });
  });
});

// Test runner
function describe(name: string, tests: () => void) {
  console.log(`Test Suite: ${name}`);
  tests();
}

function it(name: string, test: () => void) {
  try {
    test();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${error}`);
  }
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toContain: (expected: any) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    }
  };
}

function beforeEach(setup: () => void) {
  setup();
}

// Run tests
describe('ChatComponent', () => {
  let component: ChatComponent;
  let mockRoute: any;

  beforeEach(() => {
    mockRoute = {
      snapshot: {
        params: { room: 'TestRoom' }
      }
    };
    component = new ChatComponent(mockRoute);
  });

  it('should initialize correctly', () => {
    component.ngOnInit();
    expect(component.room).toBe('TestRoom');
    expect(component.chatContent).toBe('');
  });

  it('should handle status messages', () => {
    component.ngOnInit();
    (component.socket as MockSocket).triggerEvent('status', { msg: 'User joined' });
    expect(component.chatContent).toContain('User joined');
  });

  it('should handle chat messages', () => {
    component.ngOnInit();
    (component.socket as MockSocket).triggerEvent('message', { msg: 'Hello, world!' });
    expect(component.chatContent).toContain('Hello, world!');
  });

  it('should send messages', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.sendMessage();
    expect(component.message).toBe('');
  });

  it('should handle key press', () => {
    component.ngOnInit();
    component.message = 'Test message';
    component.onKeyPress({ key: 'Enter' } as KeyboardEvent);
    expect(component.message).toBe('');
  });

  it('should leave room', () => {
    component.ngOnInit();
    const originalLocation = window.location;
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', { value: mockLocation, writable: true });
    component.leaveRoom();
    expect(mockLocation.href).toBe('/');
    Object.defineProperty(window, 'location', { value: originalLocation });
  });
});

console.log('All tests completed.');