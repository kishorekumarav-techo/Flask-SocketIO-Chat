import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  room: string = '';
  socket: Socket;
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
      // Navigate back to the login page
      window.location.href = '/'; // Assuming the login page is at the root URL
    });
  }
}